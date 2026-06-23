import { Bell, Truck } from 'lucide-react';
import { Layout } from '../components/Layout';
import { money } from '../utils/money';

export function SellerSale({ setPage }) {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center">
            <Bell className="text-blue-700" size={30} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-950">
              Tienes una nueva venta
            </h2>
            <p className="text-slate-600">
              El comprador ya realizó el pago protegido.
            </p>
          </div>
        </div>
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-3xl p-5">
          <p className="font-black text-slate-900">Charizard ex · Near Mint</p>
          <p className="text-slate-600">
            Pago retenido por la plataforma: {money(365000)}
          </p>
        </div>
        <h3 className="text-xl font-black text-slate-900 mt-6 mb-3">
          Indica método de envío
        </h3>
        <div className="grid gap-3">
          <select className="border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500">
            <option>Servientrega</option>
            <option>Coordinadora</option>
            <option>Interrapidísimo</option>
            <option>Mensajería local</option>
          </select>
          <input
            className="border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
            placeholder="Número de guía"
          />
          <textarea
            className="border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
            placeholder="Observaciones del envío"
          />
        </div>
        <button
          onClick={() => setPage('shipmentSuccess')}
          className="mt-5 w-full px-5 py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 font-black text-slate-900 flex items-center justify-center gap-2"
        >
          <Truck size={20} /> Confirmar envío
        </button>
      </div>
    </Layout>
  );
}
