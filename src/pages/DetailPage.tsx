import { useMemo } from 'react';
import type { Card, Offer } from '../data/cards';
import { ArrowLeft } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Layout } from '../components/Layout';
import { PriceBox } from '../components/PriceBox';
import { OfferRow } from '../components/OfferRow';
import { money } from '../utils/money';
import { buildSalesHistory } from '../utils/buildSalesHistory';

function PriceTrendChart({ card }: { card: Card }) {
  const data = useMemo(() => buildSalesHistory(card), [card]);
  const firstPrice = data[0]?.precio || 0;
  const lastPrice = data[data.length - 1]?.precio || 0;
  const variation = firstPrice
    ? ((lastPrice - firstPrice) / firstPrice) * 100
    : 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-5">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="text-2xl font-black text-slate-950">
            Historial de ventas del último mes
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Tendencia estimada de precios de ventas recientes para esta carta o
            producto.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-right">
          <p className="text-xs text-slate-500">Variación mensual</p>
          <p
            className={`font-black text-lg ${
              variation >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {variation >= 0 ? '+' : ''}
            {variation.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 18, left: 8, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" tick={{ fontSize: 11 }} minTickGap={18} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(value) =>
                `$${Number(value).toLocaleString('es-CO')}`
              }
              width={92}
            />
            <Tooltip
              formatter={(value) => [money(Number(value)), 'Precio']}
              labelFormatter={(label) => `Fecha: ${label}`}
            />
            <ReferenceLine
              y={card.marketAvg}
              stroke="#facc15"
              strokeDasharray="5 5"
              label={{
                value: 'Promedio',
                position: 'insideTopRight',
                fill: '#334155',
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="precio"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-5">
        <PriceBox label="Primera venta del mes" value={money(firstPrice)} />
        <PriceBox
          label="Última venta registrada"
          value={money(lastPrice)}
          highlight
        />
        <PriceBox
          label="Promedio de referencia"
          value={money(card.marketAvg)}
        />
      </div>
    </div>
  );
}

export function DetailPage({ card, setPage, setSelectedOffer, setSelectedSeller }: { card: Card; setPage: (page: string) => void; setSelectedOffer: (offer: Offer) => void; setSelectedSeller: (offer: Offer) => void }) {
  if (!card) return null;
  return (
    <Layout>
      <button
        onClick={() => setPage('market')}
        className="mb-5 flex items-center gap-2 text-slate-600 hover:text-blue-700"
      >
        <ArrowLeft size={18} /> Volver al marketplace
      </button>
      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-3xl p-6 border border-slate-200 flex items-center justify-center">
          <img
            src={card.image}
            className="max-h-[520px] object-contain drop-shadow-2xl"
          />
        </div>
        <div>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-5">
            <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
              {card.type}
            </span>
            <h2 className="text-4xl font-black text-slate-950 mt-3">
              {card.name}
            </h2>
            <p className="text-slate-500 mt-1">
              {card.set} · {card.number} · {card.rarity} · {card.language || 'Español'}
            </p>
            <p className="text-slate-700 mt-4">{card.description}</p>
            <div className="grid sm:grid-cols-3 gap-3 mt-5">
              <PriceBox label="Precio mínimo" value={money(card.low)} />
              <PriceBox
                label="Promedio histórico"
                value={money(card.marketAvg)}
                highlight
              />
              <PriceBox label="Precio máximo" value={money(card.high)} />
            </div>
          </div>
          <PriceTrendChart card={card} />

          <h3 className="text-2xl font-black text-slate-950 mb-3">
            Vendedores ofreciendo esta carta
          </h3>
          <div className="space-y-3">
            {card.offers.map((offer) => (
              <OfferRow
                key={offer.id}
                offer={offer}
                onSeller={() => {
                  setSelectedSeller(offer);
                  setPage('sellerProfile');
                }}
                onBuy={() => {
                  setSelectedOffer(offer);
                  setPage('checkout');
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
