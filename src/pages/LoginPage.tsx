import { Layout } from '../components/Layout';

export function LoginPage({ setPage }: { setPage: (page: string) => void }) {
  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
        <h2 className="text-3xl font-black text-slate-950">Ingresar</h2>
        <p className="text-slate-600 mt-2">
          Accede para comprar, vender y consultar tu historial.
        </p>
        <div className="grid gap-3 mt-6">
          <input
            className="border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
            placeholder="Correo electrónico"
          />
          <input
            className="border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
            placeholder="Contraseña"
            type="password"
          />
        </div>
        <button
          onClick={() => setPage('home')}
          className="mt-5 w-full px-5 py-4 rounded-2xl bg-blue-600 text-white font-black"
        >
          Ingresar
        </button>
        <button className="mt-3 w-full px-5 py-4 rounded-2xl bg-yellow-400 text-slate-900 font-black">
          Crear cuenta
        </button>
      </div>
    </Layout>
  );
}
