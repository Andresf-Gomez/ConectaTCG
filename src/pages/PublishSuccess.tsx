import { CheckCircle2 } from 'lucide-react';
import { Layout } from '../components/Layout';

export function PublishSuccess({ setPage }: { setPage: (page: string) => void }) {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-8 text-center shadow-sm">
        <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={42} />
        </div>
        <h2 className="text-4xl font-black text-slate-950 dark:text-white">
          Publicación activa
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mt-3">
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
