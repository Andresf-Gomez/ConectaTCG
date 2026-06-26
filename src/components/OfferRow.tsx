import type { Offer } from '../data/cards';
import { Star, BadgeCheck, ShoppingCart } from 'lucide-react';
import { money } from '../utils/money';

export function OfferRow({ offer, onSeller, onBuy }: { offer: Offer; onSeller: () => void; onBuy: () => void }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
      <div className="flex-1">
        <button
          onClick={onSeller}
          className="font-black text-lg text-slate-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-2"
        >
          {offer.seller}{' '}
          {offer.verified && <BadgeCheck className="text-blue-600" size={19} />}
        </button>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {offer.city} · {offer.condition} · {offer.shipping}
        </p>
        <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1">
            <Star size={15} className="fill-yellow-400 text-yellow-400" />{' '}
            {offer.rating} / 5
          </span>
          <span>{offer.reviews} reseñas</span>
          <span>{offer.sales} ventas</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <p className="text-2xl font-black text-blue-700 dark:text-blue-400 min-w-[150px] text-right">
          {money(offer.price)}
        </p>
        <button
          onClick={onBuy}
          className="px-5 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 font-black text-slate-900 flex items-center gap-2"
        >
          <ShoppingCart size={18} /> Comprar
        </button>
      </div>
    </div>
  );
}
