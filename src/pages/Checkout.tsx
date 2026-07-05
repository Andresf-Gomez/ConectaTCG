import { useState } from 'react';
import { ShieldCheck, CreditCard, WalletCards, ArrowLeft, AlertCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { money } from '../utils/money';
import { supabase } from '../lib/supabase';
import type { Card, Offer } from '../data/cards';

interface CheckoutProps {
  card: Card;
  offer: Offer;
  listingId?: string;   // real UUID when coming from a live listing
  setPage: (page: string) => void;
  setOrderPlaced: (v: boolean) => void;
}

export function Checkout({ card, offer, listingId, setPage, setOrderPlaced }: CheckoutProps) {
  if (!card || !offer) return null;

  const platformBalance = 180000;
  const [usePlatformBalance, setUsePlatformBalance] = useState(false);
  const [address, setAddress] = useState('Calle 123 #45-67');
  const [city, setCity] = useState('Bogotá');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productTotal = offer.price;
  const balanceUsed = usePlatformBalance
    ? Math.min(platformBalance, productTotal)
    : 0;
  const totalToPay = productTotal - balanceUsed;

  async function handleOrder() {
    setSubmitting(true);
    setError(null);

    if (listingId) {
      // Real path: call place_order RPC then immediately confirm as paid (mock payment)
      const shipping = { address, city, notes: notes || undefined };

      const { data: orderId, error: placeErr } = await supabase.rpc('place_order', {
        p_listing_id: listingId,
        p_quantity: 1,
        p_shipping_address: shipping,
      });

      if (placeErr) {
        const msg: Record<string, string> = {
          insufficient_stock:     'Ya no hay stock disponible para esta carta.',
          listing_not_active:     'Este listing ya no está disponible.',
          listing_not_found:      'No se encontró el listing.',
          cannot_buy_own_listing: 'No puedes comprar tu propia publicación.',
          unauthenticated:        'Debes iniciar sesión para comprar.',
        };
        setError(msg[placeErr.message] ?? 'Error al procesar el pedido. Intenta de nuevo.');
        setSubmitting(false);
        return;
      }

      // Mock payment confirmation — Phase 4 replaces this with gateway webhook
      const { error: payErr } = await supabase.rpc('update_order_status', {
        p_order_id: orderId as string,
        p_new_status: 'paid',
      });

      if (payErr) {
        setError('Pedido creado pero no se pudo confirmar el pago. Contáctanos.');
        setSubmitting(false);
        return;
      }
    }

    // Both real and mock paths end here
    setOrderPlaced(true);
    setPage('orderSuccess');
  }

  return (
    <Layout>
      <button
        onClick={() => setPage('detail')}
        className="mb-5 flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400"
      >
        <ArrowLeft size={18} /> Volver
      </button>
      <div className="grid lg:grid-cols-[1fr_420px] gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="text-3xl font-black text-slate-950 dark:text-white">Pago seguro</h2>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            Tu pago queda protegido hasta que confirmes que recibiste el
            producto en buen estado.
          </p>
          <div className="mt-6 p-5 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-3xl flex gap-3">
            <ShieldCheck className="text-blue-600 shrink-0" />
            <div>
              <p className="font-black text-slate-900 dark:text-white">
                Protección de compra activada
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                La plataforma retiene el dinero. El vendedor solo recibe el pago
                cuando confirmes la recepción.
              </p>
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-6 mb-3">
            Selecciona método de pago
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <button className="border-2 border-blue-600 bg-blue-50 dark:bg-blue-950/40 rounded-2xl p-4 text-left">
              <CreditCard className="text-blue-600 mb-2" />
              <p className="font-bold dark:text-white">Tarjeta débito/crédito</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pago inmediato</p>
            </button>
            <button className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-left hover:border-blue-300 dark:hover:border-blue-600">
              <WalletCards className="text-slate-600 dark:text-slate-400 mb-2" />
              <p className="font-bold dark:text-white">PSE / transferencia</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Disponible en Colombia</p>
            </button>
          </div>

          <div className="mt-4 border border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-950/30 rounded-3xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <WalletCards size={18} className="text-blue-600" />
                  Usar saldo de la plataforma
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Saldo disponible: {money(platformBalance)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Puedes usar tu saldo acumulado por ventas anteriores para
                  pagar esta compra.
                </p>
              </div>
              <button
                onClick={() => setUsePlatformBalance(!usePlatformBalance)}
                className={`px-4 py-2 rounded-2xl text-sm font-black transition ${
                  usePlatformBalance
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {usePlatformBalance ? 'Saldo aplicado' : 'Usar saldo'}
              </button>
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-6 mb-3">
            Dirección de envío
          </h3>
          <div className="grid gap-3">
            <input
              className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-2xl p-4 outline-none focus:border-blue-500"
              placeholder="Dirección"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
            <input
              className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-2xl p-4 outline-none focus:border-blue-500"
              placeholder="Ciudad"
              value={city}
              onChange={e => setCity(e.target.value)}
            />
            <textarea
              className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-2xl p-4 outline-none focus:border-blue-500"
              placeholder="Observaciones"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-red-700 dark:text-red-400 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm h-fit">
          <h3 className="text-xl font-black text-slate-950 dark:text-white mb-4">
            Resumen del pedido
          </h3>
          <div className="flex gap-4">
            <img
              src={card.image}
              className="w-24 rounded-xl object-contain bg-slate-50 dark:bg-slate-800"
            />
            <div>
              <p className="font-black text-slate-900 dark:text-white">{card.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {offer.condition} · {offer.seller}
              </p>
              <p className="font-black text-blue-700 dark:text-blue-400 mt-2">
                {money(offer.price)}
              </p>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-700 mt-5 pt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Producto</span>
              <b>{money(productTotal)}</b>
            </div>
            {usePlatformBalance && (
              <div className="flex justify-between text-blue-700 dark:text-blue-400">
                <span>Saldo usado</span>
                <b>- {money(balanceUsed)}</b>
              </div>
            )}
            <div className="flex justify-between text-lg pt-3 border-t border-slate-100 dark:border-slate-700">
              <span className="font-black">Total a pagar</span>
              <b>{money(totalToPay)}</b>
            </div>
          </div>
          <button
            onClick={handleOrder}
            disabled={submitting}
            className="mt-6 w-full px-5 py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 disabled:cursor-not-allowed font-black text-slate-900 flex items-center justify-center gap-2 transition"
          >
            <ShieldCheck size={20} />
            {submitting ? 'Procesando…' : 'Realizar pedido protegido'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
