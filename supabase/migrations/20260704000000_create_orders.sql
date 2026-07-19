-- ================================================================
-- Phase 2: transactional core — orders table + RPCs
-- ================================================================
-- Known limitation (to be addressed in a future phase):
--   A 'pending' order that is never confirmed as paid leaves
--   the listing's quantity decremented indefinitely.
--   Resolution: a scheduled cleanup job will expire stale
--   'pending' orders and restore stock after a timeout (e.g. 30 min).
-- ================================================================

-- ── 1. Table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
  id               uuid          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  listing_id       bigint        NOT NULL REFERENCES listings(id),
  buyer_id         uuid          NOT NULL REFERENCES profiles(id),
  seller_id        uuid          NOT NULL REFERENCES profiles(id),
  catalog_card_id  bigint        NOT NULL REFERENCES catalog_cards(id),

  -- Prices frozen at purchase time — never recalculated afterward
  quantity         integer       NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price       numeric(12,2) NOT NULL CHECK (unit_price > 0),
  platform_fee     numeric(12,2) NOT NULL CHECK (platform_fee >= 0),
  seller_payout    numeric(12,2) NOT NULL CHECK (seller_payout >= 0),

  -- State machine: pending → paid → shipped → received → closed
  --                any non-closed state → disputed
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','paid','shipped','received','closed','disputed')),

  -- Shipping
  shipping_address jsonb,
  tracking_code    text,

  -- Reserved for Phase 4 payment gateway (nullable until then)
  -- Phase 4 fills payment_method and payment_ref via webhook,
  -- and fires the pending→paid transition instead of the buyer mock.
  payment_method   text,
  payment_ref      text,

  -- Timestamps per state transition
  created_at       timestamptz   NOT NULL DEFAULT now(),
  paid_at          timestamptz,
  shipped_at       timestamptz,
  received_at      timestamptz,
  closed_at        timestamptz,
  disputed_at      timestamptz,
  updated_at       timestamptz   NOT NULL DEFAULT now()
);

-- ── 2. Indexes ───────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS orders_buyer_status  ON orders (buyer_id,  status);
CREATE INDEX IF NOT EXISTS orders_seller_status ON orders (seller_id, status);
CREATE INDEX IF NOT EXISTS orders_listing_id    ON orders (listing_id);
CREATE INDEX IF NOT EXISTS orders_created_at    ON orders (created_at DESC);

-- ── 3. Row Level Security ────────────────────────────────────────

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Buyers see their own purchases
CREATE POLICY "buyer_reads_own_orders" ON orders
  FOR SELECT
  USING (buyer_id = auth.uid());

-- Sellers see their own sales
CREATE POLICY "seller_reads_own_orders" ON orders
  FOR SELECT
  USING (seller_id = auth.uid());

-- Admins have full access
CREATE POLICY "admin_manages_orders" ON orders
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- No direct INSERT or UPDATE from clients — all mutations go through
-- SECURITY DEFINER RPCs that enforce business rules atomically.

-- ── 4. RPC: place_order ──────────────────────────────────────────
-- Atomically validates stock, decrements listing quantity, and
-- creates an order in a single transaction.
--
-- Security: the buyer is resolved from auth.uid() — the client
-- never supplies their own ID, eliminating ID spoofing.
--
-- Race-condition protection: SELECT ... FOR UPDATE serializes
-- concurrent purchases of the same listing. The second buyer waits
-- on the lock; when they proceed, the stock check catches quantity = 0
-- and raises 'insufficient_stock' without creating a duplicate order.

CREATE OR REPLACE FUNCTION place_order(
  p_listing_id       bigint,
  p_quantity         integer DEFAULT 1,
  p_shipping_address jsonb   DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_buyer_id  uuid;
  v_listing   listings%ROWTYPE;
  v_fee_rate  numeric;
  v_fee       numeric(12,2);
  v_payout    numeric(12,2);
  v_order_id  uuid;
BEGIN
  -- Resolve actor from session JWT — never trust a client-supplied ID
  v_buyer_id := auth.uid();
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  -- Lock the listing row for the duration of this transaction.
  -- A concurrent call blocks here; once unblocked it re-checks stock.
  SELECT * INTO v_listing
  FROM listings
  WHERE id = p_listing_id
  FOR UPDATE;

  IF NOT FOUND                         THEN RAISE EXCEPTION 'listing_not_found'; END IF;
  IF v_listing.status != 'active'      THEN RAISE EXCEPTION 'listing_not_active'; END IF;
  IF v_listing.quantity < p_quantity   THEN RAISE EXCEPTION 'insufficient_stock'; END IF;
  IF v_listing.seller_id = v_buyer_id  THEN RAISE EXCEPTION 'cannot_buy_own_listing'; END IF;

  -- Tiered commission rate, frozen at purchase time
  v_fee_rate := CASE
    WHEN v_listing.price <= 100000 THEN 0.08
    WHEN v_listing.price <= 300000 THEN 0.06
    ELSE 0.04
  END;
  v_fee    := ROUND(v_listing.price * p_quantity * v_fee_rate);
  v_payout := v_listing.price * p_quantity - v_fee;

  -- Decrement stock; auto-pause the listing when it reaches zero
  UPDATE listings
  SET
    quantity   = quantity - p_quantity,
    status     = CASE WHEN quantity - p_quantity = 0 THEN 'paused' ELSE status END,
    updated_at = now()
  WHERE id = p_listing_id;

  -- Create the order in the same atomic transaction
  INSERT INTO orders (
    listing_id,       buyer_id,    seller_id,
    catalog_card_id,  quantity,    unit_price,
    platform_fee,     seller_payout, shipping_address
  ) VALUES (
    p_listing_id,           v_buyer_id,            v_listing.seller_id,
    v_listing.catalog_card_id, p_quantity,          v_listing.price,
    v_fee,                  v_payout,              p_shipping_address
  )
  RETURNING id INTO v_order_id;

  RETURN v_order_id;
END;
$$;

REVOKE ALL    ON FUNCTION place_order(bigint, integer, jsonb) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION place_order(bigint, integer, jsonb) TO   authenticated;

-- ── 5. RPC: update_order_status ──────────────────────────────────
-- Enforces the state machine and role-based transition rules.
-- All validation lives in Postgres; the frontend cannot bypass it.
--
-- Security: the actor is resolved from auth.uid() — the client
-- never supplies their own ID, eliminating privilege escalation.
--
-- State machine (enforced here, not in the frontend):
--   pending  → paid      (buyer — Phase 2 mock; Phase 4: gateway webhook)
--   paid     → shipped   (seller only)
--   shipped  → received  (buyer only — releases protected payment)
--   received → closed    (buyer or seller — Phase 4: system after payout)
--   any !closed → disputed (buyer or seller)

CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id   uuid,
  p_new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid;
  v_order    orders%ROWTYPE;
BEGIN
  -- Resolve actor from session JWT — never trust a client-supplied ID
  v_actor_id := auth.uid();
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'order_not_found'; END IF;

  CASE p_new_status

    WHEN 'paid' THEN
      -- Phase 2: buyer calls this immediately after checkout (mock payment).
      -- Phase 4: remove this buyer-side call; the gateway webhook fires it
      --          instead, passing its own authenticated system role.
      IF v_order.buyer_id != v_actor_id THEN RAISE EXCEPTION 'unauthorized'; END IF;
      IF v_order.status   != 'pending'  THEN RAISE EXCEPTION 'invalid_transition'; END IF;
      UPDATE orders
        SET status = 'paid', paid_at = now(), updated_at = now()
      WHERE id = p_order_id;

    WHEN 'shipped' THEN
      IF v_order.seller_id != v_actor_id THEN RAISE EXCEPTION 'unauthorized'; END IF;
      IF v_order.status    != 'paid'     THEN RAISE EXCEPTION 'invalid_transition'; END IF;
      UPDATE orders
        SET status = 'shipped', shipped_at = now(), updated_at = now()
      WHERE id = p_order_id;

    WHEN 'received' THEN
      -- Buyer confirms receipt — this is the trigger for releasing payment.
      -- Phase 4: after this transition, fire the seller disbursement.
      IF v_order.buyer_id != v_actor_id  THEN RAISE EXCEPTION 'unauthorized'; END IF;
      IF v_order.status   != 'shipped'   THEN RAISE EXCEPTION 'invalid_transition'; END IF;
      UPDATE orders
        SET status = 'received', received_at = now(), updated_at = now()
      WHERE id = p_order_id;

    WHEN 'closed' THEN
      -- Phase 2: either party can close after received.
      -- Phase 4: system closes automatically after payout is confirmed.
      IF v_order.buyer_id  != v_actor_id AND v_order.seller_id != v_actor_id
        THEN RAISE EXCEPTION 'unauthorized'; END IF;
      IF v_order.status != 'received'
        THEN RAISE EXCEPTION 'invalid_transition'; END IF;
      UPDATE orders
        SET status = 'closed', closed_at = now(), updated_at = now()
      WHERE id = p_order_id;

    WHEN 'disputed' THEN
      IF v_order.buyer_id  != v_actor_id AND v_order.seller_id != v_actor_id
        THEN RAISE EXCEPTION 'unauthorized'; END IF;
      IF v_order.status = 'closed'
        THEN RAISE EXCEPTION 'invalid_transition'; END IF;
      UPDATE orders
        SET status = 'disputed', disputed_at = now(), updated_at = now()
      WHERE id = p_order_id;

    ELSE
      RAISE EXCEPTION 'unknown_status:%', p_new_status;

  END CASE;
END;
$$;

REVOKE ALL    ON FUNCTION update_order_status(uuid, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION update_order_status(uuid, text) TO   authenticated;
