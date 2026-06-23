import { WalletCards } from 'lucide-react';
import { Layout } from '../components/Layout';

export function PayoutPage({ setPage: _setPage }: { setPage: (page: string) => void }) {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-slate-200 p-8 text-center shadow-sm">
        <WalletCards className="mx-auto text-green-600 mb-4" size={58} />
        <h2 className="text-4xl font-black text-slate-950">
          Recepción confirmada
        </h2>
        <p className="text-slate-600 mt-3">
          El comprador confirmó que recibió el producto. El dinero puede
          desembolsarse al vendedor o mantenerse en saldo de la plataforma.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mt-6">
          <button className="px-5 py-4 rounded-2xl bg-green-600 text-white font-black">
            Desembolsar dinero
          </button>
          <button className="px-5 py-4 rounded-2xl bg-blue-600 text-white font-black">
            Dejar saldo en plataforma
          </button>
        </div>
      </div>
    </Layout>
  );
}
