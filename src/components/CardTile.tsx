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
      <div className="bg-gradient-to-br from-blue-50 to-yellow-50 p-5 flex justify-center h-64">
        <CardImage
          src={card.image}
          alt={card.name}
          className="max-h-full object-contain group-hover:scale-105 transition"
        />
      </div>
      <div className="p-5">
        <div className="flex justify-between gap-3">
          <div>
            <h3 className="font-black text-slate-900 text-lg">{card.name}</h3>
            <p className="text-sm text-slate-500">{card.set}</p>
            <p className="text-xs text-slate-400 mt-1">Idioma: {card.language || 'Español'}</p>
          </div>
          <span className="h-fit text-xs bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full">
            {card.offers.length} ofertas
          </span>
        </div>
        <div className="mt-4 flex justify-between items-end">
          <div>
            <p className="text-xs text-slate-500">Desde</p>
            <p className="text-xl font-black text-blue-700">{money(best)}</p>
          </div>
          <p className="text-sm text-slate-500">
            Prom. {money(card.marketAvg)}
          </p>
        </div>
      </div>
    </button>
  );
}
