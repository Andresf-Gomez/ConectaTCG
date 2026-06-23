import { CheckCircle2 } from 'lucide-react';
import { Layout } from '../components/Layout';

export function PublishSuccess({ setPage }) {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-slate-200 p-8 text-center shadow-sm">
        <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={42} />
        </div>
        <h2 className="text-4xl font-black text-slate-950">
          Publicación activa
        </h2>
        <p className="text-slate-600 mt-3">
          Tu producto ya está visible para compradores. Te notificaremos cuando
          alguien realice una compra.
        </p>
        <button
          onClick={() => setPage('market')}
          className="mt-6 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold"
        >
          Ver en marketplace
        </button>
      </div>
    </Layout>
  );
}
