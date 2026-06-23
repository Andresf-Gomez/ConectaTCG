import { Truck } from 'lucide-react';
import { Layout } from '../components/Layout';

export function ShipmentSuccess({ setPage }) {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-slate-200 p-8 text-center shadow-sm">
        <Truck className="mx-auto text-blue-600 mb-4" size={58} />
        <h2 className="text-4xl font-black text-slate-950">Envío registrado</h2>
        <p className="text-slate-600 mt-3">
          El comprador fue notificado. Cuando confirme la recepción, podrás
          solicitar el desembolso.
        </p>
        <button
          onClick={() => setPage('payout')}
          className="mt-6 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold"
        >
          Simular recepción
        </button>
      </div>
    </Layout>
  );
}
