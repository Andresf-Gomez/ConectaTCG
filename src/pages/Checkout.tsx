import { useState } from 'react';
import { ShieldCheck, CreditCard, WalletCards, ArrowLeft } from 'lucide-react';
import { Layout } from '../components/Layout';
import { money } from '../utils/money';
import type { Card, Offer } from '../data/cards';

export function Checkout({ card, offer, setPage, setOrderPlaced }: { card: Card; offer: Offer; setPage: (page: string) => void; setOrderPlaced: (v: boolean) => void }) {
  if (!card || !offer) return null;

  const platformBalance = 180000;
  const [usePlatformBalance, setUsePlatformBalance] = useState(false);

  const productTotal = offer.price;
  const balanceUsed = usePlatformBalance
    ? Math.min(platformBalance, productTotal)
    : 0;
  const totalToPay = productTotal - balanceUsed;

  return (
    <Layout>
      <button
        onClick={() => setPage('detail')}
        className="mb-5 flex items-center gap-2 text-slate-600 hover:text-blue-700"
      >
        <ArrowLeft size={18} /> Volver
      </button>
      <div className="grid lg:grid-cols-[1fr_420px] gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-3xl font-black text-slate-950">Pago seguro</h2>
          <p className="text-slate-600 mt-2">
            Tu pago queda protegido hasta que confirmes que recibiste el
            producto en buen estado.
          </p>
          <div className="mt-6 p-5 bg-blue-50 border border-blue-100 rounded-3xl flex gap-3">
            <ShieldCheck className="text-blue-600 shrink-0" />
            <div>
              <p className="font-black text-slate-900">
                Protección de compra activada
              </p>
              <p className="text-sm text-slate-600">
                La plataforma retiene el dinero. El vendedor solo recibe el pago
                cuando confirmes la recepción.
              </p>
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-6 mb-3">
            Selecciona método de pago
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <button className="border-2 border-blue-600 bg-blue-50 rounded-2xl p-4 text-left">
              <CreditCard className="text-blue-600 mb-2" />
              <p className="font-bold">Tarjeta débito/crédito</p>
              <p className="text-sm text-slate-500">Pago inmediato</p>
            </button>
            <button className="border border-slate-200 rounded-2xl p-4 text-left hover:border-blue-300">
              <WalletCards className="text-slate-600 mb-2" />
              <p className="font-bold">PSE / transferencia</p>
              <p className="text-sm text-slate-500">Disponible en Colombia</p>
            </button>
          </div>

          <div className="mt-4 border border-yellow-200 bg-yellow-50 rounded-3xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="font-black text-slate-900 flex items-center gap-2">
                  <WalletCards size={18} className="text-blue-600" />
                  Usar saldo de la plataforma
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Saldo disponible: {money(platformBalance)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Puedes usar tu saldo acumulado por ventas anteriores para
                  pagar esta compra.
                </p>
              </div>
              <button
                onClick={() => setUsePlatformBalance(!usePlatformBalance)}
                className={`px-4 py-2 rounded-2xl text-sm font-black transition ${
                  usePlatformBalance
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {usePlatformBalance ? 'Saldo aplicado' : 'Usar saldo'}
              </button>
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-6 mb-3">
            Dirección de envío
          </h3>
          <div className="grid gap-3">
            <input
              className="border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
              placeholder="Dirección"
              defaultValue="Calle 123 #45-67"
            />
            <input
              className="border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
              placeholder="Ciudad"
              defaultValue="Bogotá"
            />
            <textarea
              className="border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
              placeholder="Observaciones"
            />
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm h-fit">
          <h3 className="text-xl font-black text-slate-950 mb-4">
            Resumen del pedido
          </h3>
          <div className="flex gap-4">
            <img
              src={card.image}
              className="w-24 rounded-xl object-contain bg-slate-50"
            />
            <div>
              <p className="font-black text-slate-900">{card.name}</p>
              <p className="text-sm text-slate-500">
                {offer.condition} · {offer.seller}
              </p>
              <p className="font-black text-blue-700 mt-2">
                {money(offer.price)}
              </p>
            </div>
          </div>
          <div className="border-t border-slate-100 mt-5 pt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Producto</span>
              <b>{money(productTotal)}</b>
            </div>
            {usePlatformBalance && (
              <div className="flex justify-between text-blue-700">
                <span>Saldo usado</span>
                <b>- {money(balanceUsed)}</b>
              </div>
            )}
            <div className="flex justify-between text-lg pt-3 border-t border-slate-100">
              <span className="font-black">Total a pagar</span>
              <b>{money(totalToPay)}</b>
            </div>
          </div>
          <button
            onClick={() => {
              setOrderPlaced(true);
              setPage('orderSuccess');
            }}
            className="mt-6 w-full px-5 py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 font-black text-slate-900 flex items-center justify-center gap-2"
          >
            <ShieldCheck size={20} /> Realizar pedido protegido
          </button>
        </div>
      </div>
    </Layout>
  );
}
