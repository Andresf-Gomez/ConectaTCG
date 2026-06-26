import { Bell, Truck } from 'lucide-react';
import { Layout } from '../components/Layout';
import { money } from '../utils/money';

export function SellerSale({ setPage }: { setPage: (page: string) => void }) {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center">
            <Bell className="text-blue-700 dark:text-blue-400" size={30} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-950 dark:text-white">
              Tienes una nueva venta
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              El comprador ya realizó el pago protegido.
            </p>
          </div>
        </div>
        <div className="mt-6 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-3xl p-5">
          <p className="font-black text-slate-900 dark:text-white">Charizard ex · Near Mint</p>
          <p className="text-slate-600 dark:text-slate-300">
            Pago retenido por la plataforma: {money(365000)}
          </p>
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mt-6 mb-3">
          Indica método de envío
        </h3>
        <div className="grid gap-3">
          <select className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl p-4 outline-none focus:border-blue-500">
            <option>Servientrega</option>
            <option>Coordinadora</option>
            <option>Interrapidísimo</option>
            <option>Mensajería local</option>
          </select>
          <input
            className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-2xl p-4 outline-none focus:border-blue-500"
            placeholder="Número de guía"
          />
          <textarea
            className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-2xl p-4 outline-none focus:border-blue-500"
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
