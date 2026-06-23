import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Layout } from '../components/Layout';

export function OrderSuccess({ setPage }: { setPage: (page: string) => void }) {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-slate-200 p-8 text-center shadow-sm">
        <div className="w-20 h-20 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={42} />
        </div>
        <h2 className="text-4xl font-black text-slate-950">Pedido realizado</h2>
        <p className="text-slate-600 mt-3">
          Tu pago quedó protegido. Notificaremos al vendedor para que indique el
          método de envío y despache el producto.
        </p>

        <div className="bg-blue-50 rounded-3xl p-5 mt-6 text-left">
          <p className="font-black text-slate-900">Estado actual</p>
          <p className="text-slate-600">
            Pago retenido por la plataforma hasta que confirmes la recepción
            desde el historial de transacciones.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-5 mt-4 text-left">
          <p className="font-black text-slate-900 flex items-center gap-2">
            <Clock size={20} className="text-blue-600" />
            Confirmación automática en 10 días calendario
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Si en un plazo de 10 días calendario no realizas la confirmación de
            recibido ni reportas un problema, se entenderá que la compra fue
            recibida correctamente y el pago protegido será desembolsado al
            vendedor.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-3xl p-5 mt-4 text-left">
          <p className="font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-600" />
            ¿No recibiste la compra?
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Desde el historial de transacciones puedes abrir un caso. La
            plataforma contactará al vendedor para verificar la información de
            envío y resolver la solicitud.
          </p>
        </div>

        <button
          onClick={() => setPage('history')}
          className="mt-6 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold"
        >
          Ir al historial de transacciones
        </button>
      </div>
    </Layout>
  );
}
