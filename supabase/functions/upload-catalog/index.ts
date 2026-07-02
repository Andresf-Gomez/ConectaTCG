import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ─── Constants ───────────────────────────────────────────────────────────────

const GAME_SLUG  = "pokemon";
const GAME_NAME  = "Pokémon TCG";
const BATCH_SIZE = 500;

// Rarity name normalization applied before storing
const RARITY_CLEAN: Record<string, string> = {
  "Rare Holo":         "Holo Rare",
  "Rare Holo EX":      "Holo Rare EX",
  "Rare Holo GX":      "Holo Rare GX",
  "Rare Holo V":       "Holo Rare V",
  "Rare Holo VMAX":    "Holo Rare VMAX",
  "Rare Holo VSTAR":   "Holo Rare VSTAR",
  "Rare Holo LV.X":    "Holo Rare LV.X",
  "Rare Prime":        "Prime Rare",
  "Rare ACE":          "ACE SPEC Rare",
  "Rare BREAK":        "BREAK Rare",
  "Rare Rainbow":      "Rainbow Rare",
  "Rare Secret":       "Secret Rare",
  "Rare Shining":      "Shining Rare",
  "Rare Shiny":        "Shiny Rare",
  "Rare Shiny GX":     "Shiny Rare GX",
  "Rare Ultra":        "Ultra Rare",
};

const KNOWN_VARIANTS    = ["holo", "normal", "reverse", "firstEdition", "wPromo"];
const VARIANT_LOWER_MAP = Object.fromEntries(KNOWN_VARIANTS.map(v => [v.toLowerCase(), v]));

// ─── Types ───────────────────────────────────────────────────────────────────

interface RawCard {
  id: string;
  localId?: string;
  names?: Record<string, string>;
  setNames?: Record<string, string>;
  set?: { id?: string };
  year?: number;
  languages?: string[];
  data?: Record<string, {
    image?: string;
    rarity?: string;
    variants_detailed?: Array<{ type?: string }>;
  }>;
}

interface ParsedCard {
  id: string;
  localId: string;
  names: Record<string, string>;
  setNames: Record<string, string>;
  set_id: string;
  year: number | null;
  image_url: string;
  languages: string[];
  rarity: string;
  variants: string[];
}

// ─── Parsing ─────────────────────────────────────────────────────────────────

function normalizeVariantType(type: string): string {
  const lower = type.toLowerCase().replace(/\s+/g, "");
  return VARIANT_LOWER_MAP[lower] || lower;
}

function parseCards(raw: { cards: Record<string, RawCard> }): ParsedCard[] {
  return Object.values(raw.cards).map(card => {
    const data      = card.data || {};
    const dataLangs = Object.keys(data);

    let image_url = "";
    if (data.en?.image) {
      image_url = data.en.image + "/high.png";
    } else if (dataLangs.length > 0) {
      const img = data[dataLangs[0]]?.image;
      if (img) image_url = img + "/high.png";
    }

    let rawRarity = "";
    if (data.en?.rarity)        rawRarity = data.en.rarity;
    else if (dataLangs.length)  rawRarity = data[dataLangs[0]]?.rarity || "";
    const rarity = RARITY_CLEAN[rawRarity] ?? rawRarity;

    const seen = new Map<string, string>();
    const orderedLangs = dataLangs.includes("en")
      ? ["en", ...dataLangs.filter(l => l !== "en")]
      : dataLangs;
    for (const lang of orderedLangs) {
      for (const v of data[lang]?.variants_detailed || []) {
        if (!v.type) continue;
        const canonical = normalizeVariantType(v.type);
        const lower     = canonical.toLowerCase();
        if (!seen.has(lower)) seen.set(lower, canonical);
      }
    }

    return {
      id:        card.id,
      localId:   card.localId || "",
      names:     card.names    || {},
      setNames:  card.setNames || {},
      set_id:    card.set?.id  || "",
      year:      card.year     ?? null,
      image_url,
      languages: card.languages || [],
      rarity,
      variants:  Array.from(seen.values()),
    };
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function upsertBatch(
  supabase: SupabaseClient,
  table: string,
  rows: Record<string, unknown>[],
  onConflict: string,
): Promise<void> {
  for (const batch of chunk(rows, BATCH_SIZE)) {
    const { error } = await supabase.from(table).upsert(batch, { onConflict });
    if (error) throw new Error(`upsert ${table}: ${error.message}`);
  }
}

// ─── Preview mode (lightweight) ──────────────────────────────────────────────
// Client sends only IDs/codes extracted locally — no full card data needed.

interface PreviewPayload {
  total_in_file: number;
  tcgdex_ids: string[];
  set_codes: string[];
  rarities: string[];
}

async function runPreviewLightweight(supabase: SupabaseClient, data: PreviewPayload) {
  // Sets and rarities are small (hundreds) — no pagination needed
  const [setsRes, raritiesRes] = await Promise.all([
    supabase.from("sets").select("set_code"),
    supabase.from("rarities").select("names"),
  ]);
  if (setsRes.error)     throw new Error(setsRes.error.message);
  if (raritiesRes.error) throw new Error(raritiesRes.error.message);

  const existingSetCodes = new Set((setsRes.data || []).map((r: { set_code: string }) => r.set_code));
  const existingRarityEn = new Set(
    (raritiesRes.data || [])
      .filter((r: { names: Record<string, string> }) => r.names?.en)
      .map((r: { names: Record<string, string> }) => r.names.en)
  );

  // Check which submitted IDs already exist — batch to avoid huge IN clauses
  const existingIds = new Set<string>();
  for (const idBatch of chunk(data.tcgdex_ids, 500)) {
    const { data: matches, error } = await supabase
      .from("catalog_cards")
      .select("tcgdex_id")
      .in("tcgdex_id", idBatch);
    if (error) throw new Error(`catalog_cards check: ${error.message}`);
    for (const r of (matches || [])) existingIds.add(r.tcgdex_id);
  }

  const fileSets     = new Set(data.set_codes);
  const fileRarities = new Set(data.rarities);

  return {
    total_cards: data.total_in_file,
    sets: {
      total_in_file: fileSets.size,
      new:      [...fileSets].filter(s => !existingSetCodes.has(s)).length,
      existing: [...fileSets].filter(s =>  existingSetCodes.has(s)).length,
    },
    cards: {
      new:      data.tcgdex_ids.filter(id => !existingIds.has(id)).length,
      existing: data.tcgdex_ids.filter(id =>  existingIds.has(id)).length,
    },
    rarities: {
      total_in_file: fileRarities.size,
      new:      [...fileRarities].filter(r => !existingRarityEn.has(r)).length,
      existing: [...fileRarities].filter(r =>  existingRarityEn.has(r)).length,
    },
  };
}

// ─── Commit mode ─────────────────────────────────────────────────────────────

async function runCommit(supabase: SupabaseClient, catalog: ParsedCard[]) {
  // 1. Game
  const { data: gameData, error: gameErr } = await supabase
    .from("games")
    .upsert({ slug: GAME_SLUG, name: GAME_NAME, active: true }, { onConflict: "slug" })
    .select("id")
    .single();
  if (gameErr) throw new Error(`game: ${gameErr.message}`);
  const gameId: number = gameData.id;

  // 2. Sets
  const seenSets = new Map<string, Record<string, unknown>>();
  for (const card of catalog) {
    if (!card.set_id || seenSets.has(card.set_id)) continue;
    seenSets.set(card.set_id, {
      game_id:  gameId,
      set_code: card.set_id,
      names:    card.setNames || {},
      year:     card.year ?? null,
    });
  }
  const setRows = Array.from(seenSets.values());
  await upsertBatch(supabase, "sets", setRows, "game_id,set_code");

  const { data: setsData, error: setsErr } = await supabase
    .from("sets").select("id, set_code").eq("game_id", gameId);
  if (setsErr) throw new Error(`sets fetch: ${setsErr.message}`);
  const setMap = Object.fromEntries(
    setsData.map((r: { set_code: string; id: number }) => [r.set_code, r.id])
  );

  // 3. Rarities
  const uniqueRarities = [...new Set(catalog.map(c => c.rarity).filter(Boolean))];
  const rarityRows = uniqueRarities.map(name => ({
    game_id: gameId,
    code:    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    names:   { en: name },
  }));
  await upsertBatch(supabase, "rarities", rarityRows, "game_id,code");

  const { data: raritiesData, error: raritiesErr } = await supabase
    .from("rarities").select("id, names").eq("game_id", gameId);
  if (raritiesErr) throw new Error(`rarities fetch: ${raritiesErr.message}`);
  const rarityMap = Object.fromEntries(
    raritiesData
      .filter((r: { names: Record<string, string>; id: number }) => r.names?.en)
      .map((r: { names: Record<string, string>; id: number }) => [r.names.en, r.id])
  );

  // 4. Variants
  const uniqueVariants = [...new Set(catalog.flatMap(c => c.variants).filter(Boolean))];
  const variantRows = uniqueVariants.map(name => ({
    game_id: gameId,
    code:    name,
    names:   { en: name },
  }));
  await upsertBatch(supabase, "variants", variantRows, "game_id,code");

  // 5. Catalog cards
  const cardRows = catalog
    .filter(c => c.set_id && setMap[c.set_id])
    .map(c => ({
      tcgdex_id: c.id,
      set_id:    setMap[c.set_id],
      rarity_id: c.rarity ? (rarityMap[c.rarity] ?? null) : null,
      number:    c.localId || "",
      names:     c.names   || {},
      image_url: c.image_url || null,
      languages: c.languages || [],
    }));
  const skipped = catalog.length - cardRows.length;

  // Determine inserted vs updated BEFORE the upsert.
  // Batch at 500 to stay within PostgREST URL length limits.
  const allIds = cardRows.map(r => r.tcgdex_id);
  const existingIds = new Set<string>();
  for (const idBatch of chunk(allIds, 500)) {
    const { data } = await supabase
      .from("catalog_cards")
      .select("tcgdex_id")
      .in("tcgdex_id", idBatch);
    for (const r of data || []) existingIds.add(r.tcgdex_id);
  }
  const inserted = cardRows.filter(r => !existingIds.has(r.tcgdex_id)).length;
  const updated  = cardRows.filter(r =>  existingIds.has(r.tcgdex_id)).length;

  await upsertBatch(supabase, "catalog_cards", cardRows, "tcgdex_id");

  return {
    game_id:             gameId,
    sets_upserted:       setRows.length,
    rarities_upserted:   rarityRows.length,
    variants_upserted:   variantRows.length,
    cards: {
      total_processed: cardRows.length,
      inserted,
      updated,
      skipped,
    },
  };
}

// ─── CORS ─────────────────────────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

// ─── Handler ─────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: CORS });
  }

  // Build admin client (service role bypasses RLS)
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // Verify caller's JWT
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return json({ error: "Unauthorized: missing token" }, 401);
  }
  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(
    authHeader.slice(7),
  );
  if (authErr || !user) {
    return json({ error: "Unauthorized: invalid token" }, 401);
  }

  // Verify admin role
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profileErr || profile?.role !== "admin") {
    return json({ error: "Forbidden: admin role required" }, 403);
  }

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const isPreview = body.preview !== false; // default true (safe)

  try {
    if (isPreview) {
      // Lightweight preview: client sends extracted arrays, not full card data
      if (!Array.isArray(body.tcgdex_ids) || (body.tcgdex_ids as unknown[]).length === 0) {
        return json({ error: "Preview requires non-empty tcgdex_ids array" }, 400);
      }
      const result = await runPreviewLightweight(supabaseAdmin, body as unknown as PreviewPayload);
      return json({ mode: "preview", ...result });
    } else {
      // Commit: client sends a chunk of cards (subset of full catalog)
      if (!body.cards || typeof body.cards !== "object") {
        return json({ error: "Commit requires a cards object" }, 400);
      }
      let catalog: ParsedCard[];
      try {
        catalog = parseCards(body as unknown as { cards: Record<string, RawCard> });
      } catch (e) {
        return json({ error: `Parse error: ${(e as Error).message}` }, 400);
      }
      if (catalog.length === 0) {
        return json({ error: "No cards found in chunk" }, 400);
      }
      const result = await runCommit(supabaseAdmin, catalog);
      return json({ mode: "commit", ...result });
    }
  } catch (e) {
    return json({ error: (e as Error).message ?? String(e) }, 500);
  }
});
