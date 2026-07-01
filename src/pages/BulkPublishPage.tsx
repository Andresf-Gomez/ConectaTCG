import { useState } from 'react';
import { ArrowLeft, Plus, Upload, Eye, EyeOff, X, Loader2, Copy } from 'lucide-react';
import { Layout } from '../components/Layout';
import { CardImage } from '../components/ImagePlaceholder';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  getLanguages,
  fetchYears,
  fetchSets,
  fetchCards,
  LANG_LABELS,
  getDisplayName,
  bestName,
  type CatalogCard,
  type SetOption,
} from '../hooks/useCatalog';

const CONDITIONS = ['Near Mint', 'Excellent', 'Light Played', 'Played'];

interface BulkRow {
  key: number;
  lang: string;
  year: string;
  setId: string;
  cardId: string;
  variant: string;
  condition: string;
  quantity: number;
  price: number;
  description: string;
  avgPrice: number | null;
  avgLoading: boolean;
  availableYears: number[];
  availableSets: SetOption[];
  availableCards: CatalogCard[];
  optionsLoading: boolean;
}

function emptyRow(key: number): BulkRow {
  return {
    key,
    lang: '',
    year: '',
    setId: '',
    cardId: '',
    variant: '',
    condition: 'Near Mint',
    quantity: 1,
    price: 0,
    description: '',
    avgPrice: null,
    avgLoading: false,
    availableYears: [],
    availableSets: [],
    availableCards: [],
    optionsLoading: false,
  };
}

export function BulkPublishPage({ setPage }: { setPage: (page: string) => void }) {
  const { user } = useAuth();
  const languages = getLanguages().sort((a, b) =>
    (LANG_LABELS[a] || a).localeCompare(LANG_LABELS[b] || b),
  );

  const [rows, setRows] = useState<BulkRow[]>([emptyRow(1)]);
  const [nextKey, setNextKey] = useState(2);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [previewCard, setPreviewCard] = useState<CatalogCard | null>(null);

  function updateRow(key: number, patch: Partial<BulkRow>) {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r))
    );
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow(nextKey)]);
    setNextKey((k) => k + 1);
  }

  function removeRow(key: number) {
    setRows((prev) => {
      const next = prev.filter((r) => r.key !== key);
      return next.length === 0 ? [emptyRow(nextKey)] : next;
    });
    if (rows.length <= 1) setNextKey((k) => k + 1);
  }

  function duplicateRow(key: number) {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.key === key);
      if (idx === -1) return prev;
      const src = prev[idx];
      const newRow: BulkRow = {
        ...src,
        key: nextKey,
        price: 0,
        description: '',
      };
      const next = [...prev];
      next.splice(idx + 1, 0, newRow);
      return next;
    });
    setNextKey((k) => k + 1);
  }

  async function changeLang(key: number, lang: string) {
    updateRow(key, {
      lang, year: '', setId: '', cardId: '', variant: '', avgPrice: null,
      availableYears: [], availableSets: [], availableCards: [], optionsLoading: true,
    });
    try {
      const years = await fetchYears(lang);
      updateRow(key, { availableYears: years, optionsLoading: false });
    } catch {
      updateRow(key, { optionsLoading: false });
    }
  }

  async function changeYear(key: number, year: string) {
    const lang = rows.find((r) => r.key === key)?.lang ?? '';
    updateRow(key, {
      year, setId: '', cardId: '', variant: '', avgPrice: null,
      availableSets: [], availableCards: [], optionsLoading: true,
    });
    try {
      const sets = await fetchSets(Number(year), lang);
      updateRow(key, { availableSets: sets, optionsLoading: false });
    } catch {
      updateRow(key, { optionsLoading: false });
    }
  }

  async function changeSet(key: number, setId: string) {
    const row = rows.find((r) => r.key === key);
    if (!row) return;
    updateRow(key, {
      setId, cardId: '', variant: '', avgPrice: null,
      availableCards: [], optionsLoading: true,
    });
    try {
      const cards = await fetchCards(setId, row.lang);
      updateRow(key, { availableCards: cards, optionsLoading: false });
    } catch {
      updateRow(key, { optionsLoading: false });
    }
  }

  async function changeCard(key: number, cardId: string) {
    const row = rows.find((r) => r.key === key);
    const card = row?.availableCards.find((c) => c.id === cardId);
    if (!card) return;
    updateRow(key, { cardId, variant: '', avgLoading: true, avgPrice: null });
    const { data } = await supabase
      .from('listings')
      .select('price')
      .eq('catalog_card_id', card.dbId)
      .eq('language', row.lang);
    if (data && data.length > 0) {
      const avg = Math.round(
        data.reduce((sum: number, r: { price: number }) => sum + r.price, 0) / data.length,
      );
      updateRow(key, { avgPrice: avg, avgLoading: false });
    } else {
      updateRow(key, { avgPrice: null, avgLoading: false });
    }
  }

  const validRows = rows.filter((r) => r.cardId && r.condition && r.price > 0);
  const invalidCount = rows.filter(
    (r) => r.lang && (!r.cardId || !r.condition || r.price <= 0)
  ).length;

  async function handlePublish() {
    if (validRows.length === 0) return;
    setPublishError('');
    setPublishing(true);

    const inserts = validRows.map((r) => {
      const card = r.availableCards.find((c) => c.id === r.cardId)!;
      return {
        seller_id: user?.id,
        catalog_card_id: card.dbId,
        language: r.lang,
        variant: r.variant,
        condition: r.condition,
        quantity: r.quantity,
        price: r.price,
        description: r.description,
        status: 'active',
      };
    });

    const { error } = await supabase.from('listings').insert(inserts);
    setPublishing(false);
    if (error) {
      setPublishError(error.message);
    } else {
      setPage('publishSuccess');
    }
  }

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setPage('publish')}
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-black text-slate-950">
            Publicación masiva
          </h2>
          <p className="text-slate-600">
            Agrega varias cartas a la vez y publícalas con un solo clic.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-3 text-left font-bold text-slate-700 whitespace-nowrap">#</th>
                <th className="px-3 py-3 text-left font-bold text-slate-700 whitespace-nowrap">Idioma</th>
                <th className="px-3 py-3 text-left font-bold text-slate-700 whitespace-nowrap">Año</th>
                <th className="px-3 py-3 text-left font-bold text-slate-700 whitespace-nowrap">Expansión</th>
                <th className="px-3 py-3 text-left font-bold text-slate-700 whitespace-nowrap min-w-[180px]">Carta</th>
                <th className="px-3 py-3 text-left font-bold text-slate-700 whitespace-nowrap">Variante</th>
                <th className="px-3 py-3 text-left font-bold text-slate-700 whitespace-nowrap">Cant.</th>
                <th className="px-3 py-3 text-left font-bold text-slate-700 whitespace-nowrap">Condición</th>
                <th className="px-3 py-3 text-left font-bold text-slate-700 whitespace-nowrap">Precio prom.</th>
                <th className="px-3 py-3 text-left font-bold text-slate-700 whitespace-nowrap">Precio venta</th>
                <th className="px-3 py-3 text-left font-bold text-slate-700 whitespace-nowrap">Descripción</th>
                <th className="px-3 py-3 text-center font-bold text-slate-700">Img</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const card = row.cardId
                  ? row.availableCards.find((c) => c.id === row.cardId) ?? null
                  : null;
                const variants = card?.variants ?? [];

                return (
                  <tr
                    key={row.key}
                    className="border-b border-slate-100 hover:bg-slate-50/50"
                  >
                    <td className="px-3 py-2 text-slate-400 font-bold">{idx + 1}</td>

                    {/* Idioma */}
                    <td className="px-3 py-2">
                      <select
                        value={row.lang}
                        onChange={(e) => changeLang(row.key, e.target.value)}
                        className="w-full min-w-[110px] border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="">—</option>
                        {languages.map((l) => (
                          <option key={l} value={l}>
                            {LANG_LABELS[l] || l}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Año */}
                    <td className="px-3 py-2">
                      {row.optionsLoading && !row.year ? (
                        <Loader2 size={16} className="animate-spin text-blue-500 mx-2" />
                      ) : (
                        <select
                          value={row.year}
                          onChange={(e) => changeYear(row.key, e.target.value)}
                          disabled={!row.lang || row.optionsLoading}
                          className="w-full min-w-[80px] border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none focus:border-blue-500 disabled:opacity-40"
                        >
                          <option value="">—</option>
                          {row.availableYears.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Expansión */}
                    <td className="px-3 py-2">
                      {row.optionsLoading && row.year && !row.setId ? (
                        <Loader2 size={16} className="animate-spin text-blue-500 mx-2" />
                      ) : (
                        <select
                          value={row.setId}
                          onChange={(e) => changeSet(row.key, e.target.value)}
                          disabled={!row.year || row.optionsLoading}
                          className="w-full min-w-[150px] border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none focus:border-blue-500 disabled:opacity-40"
                        >
                          <option value="">—</option>
                          {row.availableSets.map((s) => (
                            <option key={s.id} value={s.id}>
                              {bestName(s.names, row.lang, s.id)}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Carta */}
                    <td className="px-3 py-2">
                      {row.optionsLoading && row.setId && !row.cardId ? (
                        <Loader2 size={16} className="animate-spin text-blue-500 mx-2" />
                      ) : (
                        <select
                          value={row.cardId}
                          onChange={(e) => changeCard(row.key, e.target.value)}
                          disabled={!row.setId || row.optionsLoading}
                          className="w-full min-w-[180px] border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none focus:border-blue-500 disabled:opacity-40"
                        >
                          <option value="">—</option>
                          {row.availableCards.map((c) => (
                            <option key={c.id} value={c.id}>
                              #{c.localId} · {getDisplayName(c, row.lang)}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Variante */}
                    <td className="px-3 py-2">
                      <select
                        value={row.variant}
                        onChange={(e) =>
                          updateRow(row.key, { variant: e.target.value })
                        }
                        disabled={!row.cardId || variants.length === 0}
                        className="w-full min-w-[110px] border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none focus:border-blue-500 disabled:opacity-40"
                      >
                        <option value="">—</option>
                        {variants.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Cantidad */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) =>
                          updateRow(row.key, { quantity: Math.max(1, Number(e.target.value)) })
                        }
                        className="w-full min-w-[60px] border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none focus:border-blue-500 text-center"
                      />
                    </td>

                    {/* Condición */}
                    <td className="px-3 py-2">
                      <select
                        value={row.condition}
                        onChange={(e) =>
                          updateRow(row.key, { condition: e.target.value })
                        }
                        className="w-full min-w-[120px] border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none focus:border-blue-500"
                      >
                        {CONDITIONS.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </td>

                    {/* Precio prom. */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      {row.avgLoading ? (
                        <Loader2 size={16} className="animate-spin text-blue-500" />
                      ) : row.avgPrice !== null ? (
                        <span className="text-slate-700 font-bold">
                          ${row.avgPrice.toLocaleString('es-CO')}
                        </span>
                      ) : row.cardId ? (
                        <span className="text-slate-400 text-xs">Sin historial</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Precio venta */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={row.price || ''}
                        onChange={(e) =>
                          updateRow(row.key, { price: Number(e.target.value) })
                        }
                        placeholder="0"
                        className="w-full min-w-[100px] border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none focus:border-blue-500"
                      />
                    </td>

                    {/* Descripción */}
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) =>
                          updateRow(row.key, { description: e.target.value })
                        }
                        placeholder="Opcional"
                        className="w-full min-w-[120px] border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none focus:border-blue-500"
                      />
                    </td>

                    {/* Img */}
                    <td className="px-3 py-2 text-center">
                      {card && card.image_url ? (
                        <button
                          onClick={() => setPreviewCard(card)}
                          className="p-2 rounded-xl hover:bg-blue-50 transition"
                          title="Ver imagen"
                        >
                          <Eye size={16} className="text-blue-600" />
                        </button>
                      ) : card ? (
                        <span className="p-2 inline-block" title="Sin imagen disponible">
                          <EyeOff size={16} className="text-slate-300" />
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Duplicar / Eliminar */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => duplicateRow(row.key)}
                          className="p-2 rounded-xl hover:bg-blue-50 transition text-slate-400 hover:text-blue-600"
                          title="Duplicar fila"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => removeRow(row.key)}
                          className="p-2 rounded-xl hover:bg-red-50 transition text-slate-400 hover:text-red-600"
                          title="Eliminar fila"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <button
            onClick={addRow}
            className="px-5 py-3 rounded-2xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-2"
          >
            <Plus size={18} /> Agregar carta
          </button>
          <div className="flex-1" />
          <span className="text-sm text-slate-500">
            {validRows.length} de {rows.length} lista(s) para publicar
          </span>
        </div>
      </div>

      {publishError && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-xl p-3">
          {publishError}
        </p>
      )}
      {invalidCount > 0 && (
        <p className="mt-4 text-sm text-yellow-700 bg-yellow-50 rounded-xl p-3">
          {invalidCount} fila(s) incompleta(s) — necesitan carta, condición y
          precio para poder publicarse.
        </p>
      )}

      <button
        onClick={handlePublish}
        disabled={publishing || validRows.length === 0}
        className="mt-5 w-full sm:w-auto px-8 py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 font-black text-slate-900 flex items-center justify-center gap-2 disabled:opacity-50 transition"
      >
        <Upload size={20} />
        {publishing ? 'Publicando...' : `Publicar todas (${validRows.length})`}
      </button>

      {previewCard && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setPreviewCard(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-900">
                {getDisplayName(previewCard)}
              </h3>
              <button
                onClick={() => setPreviewCard(null)}
                className="p-2 rounded-xl hover:bg-slate-100 transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-2xl p-4 flex justify-center min-h-[200px] items-center">
              <CardImage
                src={previewCard.image_url}
                alt={getDisplayName(previewCard)}
                className="max-h-80 object-contain rounded-xl"
                placeholderSize="lg"
              />
            </div>
            <p className="mt-3 text-sm text-slate-500 text-center">
              {bestName(previewCard.setNames, '', previewCard.set_id)} · #{previewCard.localId}
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
}
