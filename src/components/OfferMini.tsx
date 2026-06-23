import { Star, BadgeCheck } from 'lucide-react';
import { money } from '../utils/money';

export function OfferMini({ offer, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white/95 hover:bg-white rounded-2xl p-4 text-left transition"
    >
      <div className="flex justify-between gap-3">
        <div>
          <p className="font-bold text-slate-900 flex items-center gap-1">
            {offer.seller}{' '}
            {offer.verified && (
              <BadgeCheck size={16} className="text-blue-600" />
            )}
          </p>
          <p className="text-sm text-slate-500">
            {offer.condition} · {offer.city}
          </p>
        </div>
        <div className="text-right">
          <p className="font-black text-blue-700">{money(offer.price)}</p>
          <p className="text-sm text-slate-600 flex items-center justify-end gap-1">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            {offer.rating}
          </p>
        </div>
      </div>
    </button>
  );
}
