import type { Card } from '../data/cards';
import type { GroupedCard } from '../hooks/useCards';
import { money } from '../utils/money';
import { CardImage } from './ImagePlaceholder';

export function CardTile({ card, onClick }: { card: Card | GroupedCard; onClick: () => void }) {
  const best = Math.min(...card.offers.map((o) => o.price));
  return (
    <button
      onClick={onClick}
      className="group text-left bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
    >
      <div className="bg-gradient-to-br from-blue-50 to-yellow-50 p-4 flex justify-center h-44 sm:h-56">
        <CardImage
          src={card.image}
          alt={card.name}
          className="max-h-full object-contain group-hover:scale-105 transition"
        />
      </div>
      <div className="p-3 sm:p-5">
        <div className="flex justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-black text-slate-900 text-sm sm:text-lg truncate">{card.name}</h3>
            <p className="text-xs text-slate-500 truncate">{card.set}</p>
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">Idioma: {card.language || 'Español'}</p>
          </div>
          <span className="flex-shrink-0 h-fit text-xs bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded-full">
            {card.offers.length} ofertas
          </span>
        </div>
        <div className="mt-3 flex justify-between items-end">
          <div>
            <p className="text-xs text-slate-500">Desde</p>
            <p className="text-base sm:text-xl font-black text-blue-700">{money(best)}</p>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">
            Prom. {money(card.marketAvg)}
          </p>
        </div>
      </div>
    </button>
  );
}
