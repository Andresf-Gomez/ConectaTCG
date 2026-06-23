import { Star, ShieldCheck, Package, Clock, MessageCircle, BadgeCheck } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Metric } from '../components/Metric';
import { InfoPill } from '../components/InfoPill';
import { sellerReviews } from '../data/sellerReviews';

export function SellerProfile({ seller, setPage }: {
  seller: { seller: string; rating: number; sales: number; reviews: number; verified: boolean; city: string };
  setPage: (page: string) => void;
}) {
  if (!seller) return null;
  const reviews = sellerReviews[seller.seller] || [];
  return (
    <Layout>
      <button
        onClick={() => setPage('detail')}
        className="mb-5 flex items-center gap-2 text-slate-600 hover:text-blue-700"
      >
        <ArrowLeft size={18} /> Volver a la publicación
      </button>
      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm h-fit">
          <div className="w-24 h-24 rounded-3xl bg-blue-600 text-yellow-300 font-black flex items-center justify-center text-3xl mb-4">
            TCG
          </div>
          <h2 className="text-3xl font-black text-slate-950 flex items-center gap-2">
            {seller.seller}{' '}
            {seller.verified && <BadgeCheck className="text-blue-600" />}
          </h2>
          <p className="text-slate-500">Vendedor en {seller.city}</p>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <Metric label="Calificación" value={`${seller.rating}/5`} />
            <Metric label="Ventas" value={seller.sales} />
            <Metric label="Reseñas" value={seller.reviews} />
            <Metric
              label="Verificación"
              value={seller.verified ? 'Sí' : 'Pendiente'}
            />
          </div>
          <button className="mt-5 w-full px-5 py-3 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2">
            <MessageCircle size={18} /> Contactar vendedor
          </button>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-2xl font-black text-slate-950 mb-4">
            Reseñas recientes
          </h3>
          <div className="space-y-3">
            {reviews.map((r, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-4">
                <p className="flex items-center gap-1 mb-2">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                </p>
                <p className="text-slate-700">"{r}"</p>
              </div>
            ))}
          </div>
          <h3 className="text-2xl font-black text-slate-950 mt-8 mb-4">
            Indicadores de confianza
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <InfoPill
              icon={ShieldCheck}
              title="Identidad"
              text="Documento verificado"
            />
            <InfoPill icon={Package} title="Empaque" text="Buenas prácticas" />
            <InfoPill icon={Clock} title="Respuesta" text="Menos de 2 horas" />
          </div>
        </div>
      </div>
    </Layout>
  );
}
