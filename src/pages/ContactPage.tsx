import { MessageCircle } from 'lucide-react';
import { Layout } from '../components/Layout';

export function ContactPage() {
  return (
    <Layout>
      <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
          <span className="inline-flex px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-slate-900 dark:text-yellow-300 text-sm font-black">
            Contáctanos
          </span>
          <h2 className="text-4xl font-black text-slate-950 dark:text-white mt-4">
            Conecta TCG
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mt-3 max-w-2xl">
            Plataforma especializada para conectar compradores, coleccionistas,
            revendedores y vendedores de cartas TCG y producto sellado en Colombia.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-3xl p-5">
              <p className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase">Nombre</p>
              <p className="text-xl font-black text-slate-950 dark:text-white mt-1">Andrés Gómez</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900/50 rounded-3xl p-5">
              <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Teléfono</p>
              <p className="text-xl font-black text-slate-950 dark:text-white mt-1">3108633831</p>
            </div>
          </div>

          <div className="mt-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5">
            <p className="font-black text-slate-900 dark:text-white">Propósito de contacto</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
              Resolver dudas sobre publicaciones, compras protegidas, comisiones,
              estado de transacciones y casos de no recepción.
            </p>
          </div>
        </div>

        <aside className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-xl">
          <MessageCircle size={40} className="text-yellow-300 mb-4" />
          <h3 className="text-2xl font-black">Estamos construyendo confianza</h3>
          <p className="text-blue-50 mt-3">
            Este canal permite centralizar soporte básico durante la validación del
            MVP y recoger dudas frecuentes de usuarios reales.
          </p>
        </aside>
      </div>
    </Layout>
  );
}
