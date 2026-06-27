import { useState, useEffect, useMemo } from 'react';
import {
  Package, Edit3, Pause, Play, Trash2, Check, X, Search,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Layout } from '../components/Layout';
import { Metric } from '../components/Metric';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { money } from '../utils/money';
import type { SupabaseCard } from '../hooks/useCards';

const LANG_MAP: Record<string, string> = {
  en: 'Inglés', es: 'Español', fr: 'Français', de: 'Deutsch',
  it: 'Italiano', ja: 'Japonés', pt: 'Português', ko: '한국어',
  'zh-cn': 'Chino simplificado', 'zh-tw': 'Chino tradicional',
  th: 'Tailandés', id: 'Indonesio', nl: 'Holandés', pl: 'Polaco',
  ru: 'Ruso', 'pt-pt': 'Portugués (PT)',
};

const YEAR_NONE = '__none__';

interface SupabaseTx {
  id: string;
  seller_id: string;
  buyer_id: string;
  price: number;
  status: 'pending' | 'shipped' | 'delivered' | 'confirmed' | 'dispute';
  created_at: string;
  card_name?: string;
  buyer_name?: string;
  seller_name?: string;
}

interface DashCard extends SupabaseCard {
  active?: boolean;
  variant?: string;
  year?: number;
}

type DashTab = 'resumen' | 'pedidos' | 'inventario' | 'historial';
type OrderTab = 'pending' | 'shipped' | 'delivered' | 'dispute';
type DateFilter = 'week' | 'month' | 'year';

const DASH_TABS: { key: DashTab; label: string }[] = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'pedidos', label: 'Pedidos' },
  { key: 'inventario', label: 'Inventario' },
  { key: 'historial', label: 'Historial' },
];

const ORDER_TABS: { key: OrderTab; label: string }[] = [
  { key: 'pending', label: 'Por enviar' },
  { key: 'shipped', label: 'Enviados' },
  { key: 'delivered', label: 'Recibidos' },
  { key: 'dispute', label: 'Disputas' },
];

const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: 'week', label: 'Esta semana' },
  { key: 'month', label: 'Este mes' },
  { key: 'year', label: 'Este año' },
];

const CONDITIONS = ['Near Mint', 'Excellent', 'Light Played', 'Played'];

function statusLabel(status: SupabaseTx['status']) {
  const map: Record<SupabaseTx['status'], string> = {
    pending: 'Por enviar',
    shipped: 'Enviado',
    delivered: 'Recibido',
    confirmed: 'Confirmado',
    dispute: 'Disputa',
  };
  return map[status] ?? status;
}

function statusBadge(status: SupabaseTx['status']) {
  if (status === 'pending') return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400';
  if (status === 'shipped') return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400';
  if (status === 'delivered' || status === 'confirmed') return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400';
  if (status === 'dispute') return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400';
  return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
}

function getStartDate(filter: DateFilter): Date {
  const now = new Date();
  if (filter === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (filter === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
  return new Date(now.getFullYear(), 0, 1);
}

function buildChartData(salesTx: SupabaseTx[], buysTx: SupabaseTx[], filter: DateFilter) {
  const now = new Date();
  if (filter === 'week') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return {
        periodo: d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' }),
        ingresos: salesTx.filter(t => t.created_at.startsWith(key)).reduce((s, t) => s + t.price, 0),
        gastos: buysTx.filter(t => t.created_at.startsWith(key)).reduce((s, t) => s + t.price, 0),
      };
    });
  }
  if (filter === 'month') {
    return Array.from({ length: 4 }, (_, w) => {
      const start = new Date(now.getFullYear(), now.getMonth(), 1 + w * 7);
      const end = new Date(now.getFullYear(), now.getMonth(), 7 + w * 7);
      const inRange = (t: SupabaseTx) => { const d = new Date(t.created_at); return d >= start && d <= end; };
      return {
        periodo: `Sem ${w + 1}`,
        ingresos: salesTx.filter(inRange).reduce((s, t) => s + t.price, 0),
        gastos: buysTx.filter(inRange).reduce((s, t) => s + t.price, 0),
      };
    });
  }
  const names = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return Array.from({ length: 12 }, (_, m) => {
    const inMonth = (t: SupabaseTx) => {
      const d = new Date(t.created_at);
      return d.getMonth() === m && d.getFullYear() === now.getFullYear();
    };
    return {
      periodo: names[m],
      ingresos: salesTx.filter(inMonth).reduce((s, t) => s + t.price, 0),
      gastos: buysTx.filter(inMonth).reduce((s, t) => s + t.price, 0),
    };
  });
}

// ── Inventory table section ─────────────────────────────────────────────────

function InventorySection({
  inventory,
  setInventory,
  setPage,
}: {
  inventory: DashCard[];
  setInventory: React.Dispatch<React.SetStateAction<DashCard[]>>;
  setPage: (p: string) => void;
}) {
  // Cascade filter state
  const [invLang, setInvLang] = useState('');
  const [invSet, setInvSet] = useState('');
  const [invYear, setInvYear] = useState('');
  const [invSearch, setInvSearch] = useState('');
  const [invCondition, setInvCondition] = useState('');
  const [invStatus, setInvStatus] = useState<'' | 'active' | 'paused'>('');

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Image modal
  const [modalSrc, setModalSrc] = useState<string | null>(null);

  // Cascade: derive available options from inventory
  const availableLangs = useMemo(
    () => [...new Set(inventory.map(c => c.language).filter(Boolean))].sort(),
    [inventory],
  );

  const availableSets = useMemo(
    () => [...new Set(
      inventory
        .filter(c => !invLang || c.language === invLang)
        .map(c => c.set_name)
        .filter(Boolean),
    )].sort(),
    [inventory, invLang],
  );

  const availableYears = useMemo(() => {
    const base = inventory.filter(
      c => (!invLang || c.language === invLang) && (!invSet || c.set_name === invSet),
    );
    const years = [...new Set(base.map(c => c.year).filter((y): y is number => y != null))].sort(
      (a, b) => b - a,
    );
    const hasNone = base.some(c => c.year == null);
    return { years, hasNone };
  }, [inventory, invLang, invSet]);

  // Reset downstream when upstream changes
  function handleLangChange(v: string) {
    setInvLang(v);
    setInvSet('');
    setInvYear('');
  }
  function handleSetChange(v: string) {
    setInvSet(v);
    setInvYear('');
  }

  // Apply all filters in cascade order
  const filtered = useMemo(() => inventory.filter(c => {
    if (invLang && c.language !== invLang) return false;
    if (invSet && c.set_name !== invSet) return false;
    if (invYear) {
      if (invYear === YEAR_NONE && c.year != null) return false;
      if (invYear !== YEAR_NONE && String(c.year) !== invYear) return false;
    }
    if (invSearch && !c.name.toLowerCase().includes(invSearch.toLowerCase())) return false;
    if (invCondition && c.condition !== invCondition) return false;
    if (invStatus === 'active' && c.active === false) return false;
    if (invStatus === 'paused' && c.active !== false) return false;
    return true;
  }), [inventory, invLang, invSet, invYear, invSearch, invCondition, invStatus]);

  async function savePrice(card: DashCard) {
    const p = parseFloat(editPrice);
    if (isNaN(p) || p <= 0) return;
    setActionLoading(card.id);
    await supabase.from('cards').update({ price: p }).eq('id', card.id);
    setInventory(prev => prev.map(c => c.id === card.id ? { ...c, price: p } : c));
    setEditingId(null);
    setActionLoading(null);
  }

  async function toggleActive(card: DashCard) {
    const newActive = card.active === false ? true : false;
    setActionLoading(card.id);
    await supabase.from('cards').update({ active: newActive }).eq('id', card.id);
    setInventory(prev => prev.map(c => c.id === card.id ? { ...c, active: newActive } : c));
    setActionLoading(null);
  }

  async function deleteCard(id: string) {
    setActionLoading(id);
    await supabase.from('cards').delete().eq('id', id);
    setInventory(prev => prev.filter(c => c.id !== id));
    setDeletingId(null);
    setActionLoading(null);
  }

  const activeCount = inventory.filter(c => c.active !== false).length;

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {activeCount} activa{activeCount !== 1 ? 's' : ''} · {inventory.length} total
        </p>
        <button
          onClick={() => setPage('publish')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition"
        >
          + Publicar
        </button>
      </div>

      {/* Cascade filters */}
      <div className="flex flex-wrap gap-2">
        {/* Idioma */}
        <select
          value={invLang}
          onChange={e => handleLangChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium"
        >
          <option value="">Idioma: Todos</option>
          {availableLangs.map(l => (
            <option key={l} value={l}>{LANG_MAP[l] || l}</option>
          ))}
        </select>

        {/* Expansión */}
        <select
          value={invSet}
          onChange={e => handleSetChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium"
        >
          <option value="">Expansión: Todas</option>
          {availableSets.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Año */}
        <select
          value={invYear}
          onChange={e => setInvYear(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium"
        >
          <option value="">Año: Todos</option>
          {availableYears.years.map(y => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
          {availableYears.hasNone && (
            <option value={YEAR_NONE}>Sin año</option>
          )}
        </select>

        {/* Nombre */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar carta..."
            value={invSearch}
            onChange={e => setInvSearch(e.target.value)}
            className="pl-7 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium w-40"
          />
        </div>

        {/* Condición */}
        <select
          value={invCondition}
          onChange={e => setInvCondition(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium"
        >
          <option value="">Condición: Todas</option>
          {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Estado */}
        <select
          value={invStatus}
          onChange={e => setInvStatus(e.target.value as '' | 'active' | 'paused')}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium"
        >
          <option value="">Estado: Todos</option>
          <option value="active">Activa</option>
          <option value="paused">Pausada</option>
        </select>

        {/* Clear filters */}
        {(invLang || invSet || invYear || invSearch || invCondition || invStatus) && (
          <button
            onClick={() => { setInvLang(''); setInvSet(''); setInvYear(''); setInvSearch(''); setInvCondition(''); setInvStatus(''); }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-1"
          >
            <X size={11} /> Limpiar
          </button>
        )}
      </div>

      {/* Empty state */}
      {inventory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Package size={28} className="text-slate-400" />
          </div>
          <p className="font-black text-slate-900 dark:text-white text-lg">No tienes cartas publicadas aún</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Publica tu primera carta para empezar a vender</p>
          <button
            onClick={() => setPage('publish')}
            className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-sm transition"
          >
            Publicar carta
          </button>
        </div>
      ) : (
        <>
          {/* Inventory table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-[11px] text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                    <th className="px-3 py-2.5 w-14">Img</th>
                    <th className="px-3 py-2.5">Nombre</th>
                    <th className="px-3 py-2.5">Condición</th>
                    <th className="px-3 py-2.5">Variante</th>
                    <th className="px-3 py-2.5 text-right">Precio</th>
                    <th className="px-3 py-2.5 text-center">Estado</th>
                    <th className="px-3 py-2.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filtered.length > 0 ? filtered.map(card => {
                    const isActive = card.active !== false;
                    const imgSrc = card.image_url || card.image;
                    return (
                      <tr
                        key={card.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition align-middle ${!isActive ? 'opacity-60' : ''}`}
                      >
                        {/* Thumbnail */}
                        <td className="px-3 py-2">
                          <button
                            onClick={() => imgSrc && setModalSrc(imgSrc)}
                            className="w-10 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 hover:ring-2 hover:ring-blue-400 transition"
                            title="Ver imagen"
                          >
                            {imgSrc ? (
                              <img
                                src={imgSrc}
                                alt={card.name}
                                className="w-full h-full object-cover"
                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : (
                              <Package size={16} className="text-slate-300 dark:text-slate-600" />
                            )}
                          </button>
                        </td>

                        {/* Name + set */}
                        <td className="px-3 py-2 min-w-[160px] max-w-[220px]">
                          <p className="font-black text-slate-900 dark:text-white leading-tight line-clamp-2">{card.name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{card.set_name}</p>
                        </td>

                        {/* Condition */}
                        <td className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-slate-400">
                          {card.condition}
                        </td>

                        {/* Variant */}
                        <td className="px-3 py-2 whitespace-nowrap text-slate-500 dark:text-slate-400">
                          {card.variant ?? '—'}
                        </td>

                        {/* Price / inline edit */}
                        <td className="px-3 py-2 text-right whitespace-nowrap">
                          {editingId === card.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                value={editPrice}
                                onChange={e => setEditPrice(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') savePrice(card); if (e.key === 'Escape') setEditingId(null); }}
                                className="w-24 px-2 py-1 rounded-lg border border-blue-400 dark:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-black text-right"
                                autoFocus
                              />
                              <button
                                onClick={() => savePrice(card)}
                                disabled={actionLoading === card.id}
                                className="p-1 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 transition"
                              >
                                <Check size={11} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ) : (
                            <span className="font-black text-slate-900 dark:text-white">{money(card.price)}</span>
                          )}
                        </td>

                        {/* Status badge */}
                        <td className="px-3 py-2 text-center whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isActive
                              ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                            {isActive ? 'Activa' : 'Pausada'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-2">
                          {deletingId === card.id ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">¿Eliminar?</span>
                              <button
                                onClick={() => deleteCard(card.id)}
                                disabled={actionLoading === card.id}
                                className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-black disabled:opacity-50 transition"
                              >
                                {actionLoading === card.id ? '…' : 'Sí'}
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-black transition hover:bg-slate-200 dark:hover:bg-slate-600"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              {/* Edit price */}
                              <button
                                onClick={() => { setEditingId(card.id); setEditPrice(String(card.price)); }}
                                title="Editar precio"
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition"
                              >
                                <Edit3 size={13} />
                              </button>
                              {/* Pause / Activate */}
                              <button
                                onClick={() => toggleActive(card)}
                                disabled={actionLoading === card.id}
                                title={isActive ? 'Pausar' : 'Activar'}
                                className={`p-1.5 rounded-lg transition disabled:opacity-50 ${
                                  isActive
                                    ? 'bg-yellow-100 dark:bg-yellow-900/40 hover:bg-yellow-200 dark:hover:bg-yellow-900/60 text-yellow-700 dark:text-yellow-400'
                                    : 'bg-green-100 dark:bg-green-900/40 hover:bg-green-200 dark:hover:bg-green-900/60 text-green-700 dark:text-green-400'
                                }`}
                              >
                                {isActive ? <Pause size={13} /> : <Play size={13} />}
                              </button>
                              {/* Delete */}
                              <button
                                onClick={() => setDeletingId(card.id)}
                                title="Eliminar"
                                className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={7} className="px-3 py-10 text-center text-slate-400 dark:text-slate-500">
                        No hay cartas que coincidan con los filtros
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Result count */}
          {filtered.length !== inventory.length && (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Mostrando {filtered.length} de {inventory.length} cartas
            </p>
          )}
        </>
      )}

      {/* Image modal */}
      {modalSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setModalSrc(null)}
        >
          <div
            className="relative max-w-sm w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setModalSrc(null)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <X size={16} />
            </button>
            <img
              src={modalSrc}
              alt="Vista previa"
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────

export function SellerDashboardPage({ setPage }: { setPage: (page: string) => void }) {
  const { user } = useAuth();
  const [tab, setTab] = useState<DashTab>('resumen');
  const [orderTab, setOrderTab] = useState<OrderTab>('pending');
  const [dateFilter, setDateFilter] = useState<DateFilter>('month');

  const [inventory, setInventory] = useState<DashCard[]>([]);
  const [salesTx, setSalesTx] = useState<SupabaseTx[]>([]);
  const [buysTx, setBuysTx] = useState<SupabaseTx[]>([]);
  const [allSalesTx, setAllSalesTx] = useState<SupabaseTx[]>([]);
  const [allBuysTx, setAllBuysTx] = useState<SupabaseTx[]>([]);
  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Initial load: all seller cards + this-month transactions
  useEffect(() => {
    if (!user) return;
    const uid = user.id;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    async function fetchAll() {
      setLoading(true);
      const [invRes, salesRes, buysRes] = await Promise.all([
        supabase.from('cards').select('*').eq('seller_id', uid),
        supabase.from('transactions').select('*').eq('seller_id', uid).gte('created_at', startOfMonth.toISOString()),
        supabase.from('transactions').select('*').eq('buyer_id', uid).gte('created_at', startOfMonth.toISOString()),
      ]);
      setInventory((invRes.data as DashCard[]) ?? []);
      setSalesTx((salesRes.data as SupabaseTx[]) ?? []);
      setBuysTx((buysRes.data as SupabaseTx[]) ?? []);
      setLoading(false);
    }
    fetchAll();
  }, [user]);

  // Historial: reload when tab or date filter changes
  useEffect(() => {
    if (!user || tab !== 'historial') return;
    const uid = user.id;
    const start = getStartDate(dateFilter).toISOString();
    Promise.all([
      supabase.from('transactions').select('*').eq('seller_id', uid).gte('created_at', start),
      supabase.from('transactions').select('*').eq('buyer_id', uid).gte('created_at', start),
    ]).then(([s, b]) => {
      setAllSalesTx((s.data as SupabaseTx[]) ?? []);
      setAllBuysTx((b.data as SupabaseTx[]) ?? []);
    });
  }, [user, tab, dateFilter]);

  // Metrics (computed from active cards only)
  const ventasMes = salesTx.reduce((s, t) => s + t.price, 0);
  const comprasMes = buysTx.reduce((s, t) => s + t.price, 0);
  const activeInventory = inventory.filter(c => c.active !== false);
  const pedidosPorEnviar = salesTx.filter(t => t.status === 'pending').length;

  // Orders filtered by tab
  const filteredOrders = useMemo(() => {
    if (orderTab === 'delivered') {
      return salesTx.filter(t => t.status === 'delivered' || t.status === 'confirmed');
    }
    return salesTx.filter(t => t.status === orderTab);
  }, [salesTx, orderTab]);

  const chartData = useMemo(
    () => buildChartData(allSalesTx, allBuysTx, dateFilter),
    [allSalesTx, allBuysTx, dateFilter],
  );

  const historyRows = useMemo(() => {
    const sales = allSalesTx.map(t => ({ ...t, txType: 'Venta' as const }));
    const buys = allBuysTx.map(t => ({ ...t, txType: 'Compra' as const }));
    return [...sales, ...buys].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [allSalesTx, allBuysTx]);

  async function markShipped(id: string) {
    setActionLoading(id);
    await supabase.from('transactions').update({ status: 'shipped' }).eq('id', id);
    setSalesTx(prev => prev.map(t => t.id === id ? { ...t, status: 'shipped' as const } : t));
    setActionLoading(null);
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Mi tienda</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Panel de control del vendedor</p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit mb-6">
        {DASH_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              tab === t.key
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-slate-400">Cargando datos...</div>
      ) : (
        <>
          {/* ── RESUMEN ──────────────────────────────── */}
          {tab === 'resumen' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Metric label="Ventas del mes" value={money(ventasMes)} />
                <Metric label="Compras del mes" value={money(comprasMes)} />
                <Metric label="Inventario activo" value={`${activeInventory.length} carta${activeInventory.length !== 1 ? 's' : ''}`} />
                <Metric label="Pedidos por enviar" value={pedidosPorEnviar} />
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setPage('publish')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-sm transition"
                >
                  + Publicar carta
                </button>
                <button
                  onClick={() => setTab('pedidos')}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-2xl font-semibold text-sm transition"
                >
                  Ver pedidos
                </button>
              </div>
            </div>
          )}

          {/* ── PEDIDOS ──────────────────────────────── */}
          {tab === 'pedidos' && (
            <div className="space-y-4">
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit">
                {ORDER_TABS.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setOrderTab(t.key)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                      orderTab === t.key
                        ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t.label}
                    {t.key === 'pending' && pedidosPorEnviar > 0 && (
                      <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-blue-600 text-white rounded-full text-[10px] font-black">
                        {pedidosPorEnviar}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-[11px] text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <tr className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                        <th className="px-3 py-3">Carta</th>
                        <th className="px-3 py-3">Comprador</th>
                        <th className="px-3 py-3">Fecha</th>
                        <th className="px-3 py-3 text-right">Precio</th>
                        <th className="px-3 py-3 text-center">Estado</th>
                        <th className="px-3 py-3">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {filteredOrders.length > 0 ? filteredOrders.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition align-middle">
                          <td className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200">{tx.card_name ?? '—'}</td>
                          <td className="px-3 py-3 text-slate-600 dark:text-slate-400">
                            {tx.buyer_name ?? `${tx.buyer_id.slice(0, 8)}…`}
                          </td>
                          <td className="px-3 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {new Date(tx.created_at).toLocaleDateString('es-CO')}
                          </td>
                          <td className="px-3 py-3 text-right font-black text-slate-900 dark:text-white whitespace-nowrap">
                            {money(tx.price)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black ${statusBadge(tx.status)}`}>
                              {statusLabel(tx.status)}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            {tx.status === 'pending' ? (
                              <button
                                onClick={() => markShipped(tx.id)}
                                disabled={actionLoading === tx.id}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[10px] font-black transition"
                              >
                                {actionLoading === tx.id ? '…' : 'Marcar enviado'}
                              </button>
                            ) : (
                              <button
                                onClick={() => setPage('transactionDetail')}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-[10px] font-black transition"
                              >
                                Ver detalle
                              </button>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-3 py-10 text-center text-slate-400 dark:text-slate-500">
                            No hay pedidos en esta categoría
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── INVENTARIO ───────────────────────────── */}
          {tab === 'inventario' && (
            <InventorySection
              inventory={inventory}
              setInventory={setInventory}
              setPage={setPage}
            />
          )}

          {/* ── HISTORIAL ────────────────────────────── */}
          {tab === 'historial' && (
            <div className="space-y-6">
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit">
                {DATE_FILTERS.map(f => (
                  <button
                    key={f.key}
                    onClick={() => setDateFilter(f.key)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-medium transition ${
                      dateFilter === f.key
                        ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Ingresos vs Gastos</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 18, left: 8, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickFormatter={v => `$${Number(v).toLocaleString('es-CO')}`}
                        width={92}
                      />
                      <Tooltip
                        formatter={(value, name) => [money(Number(value)), name === 'ingresos' ? 'Ingresos' : 'Gastos']}
                      />
                      <Legend formatter={name => name === 'ingresos' ? 'Ingresos' : 'Gastos'} />
                      <Bar dataKey="ingresos" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-[11px] text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <tr className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                        <th className="px-3 py-3">Fecha</th>
                        <th className="px-3 py-3">Tipo</th>
                        <th className="px-3 py-3">Carta</th>
                        <th className="px-3 py-3 text-right">Precio</th>
                        <th className="px-3 py-3 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {historyRows.length > 0 ? historyRows.map(tx => (
                        <tr
                          key={`${tx.txType}-${tx.id}`}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition align-middle"
                        >
                          <td className="px-3 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {new Date(tx.created_at).toLocaleDateString('es-CO')}
                          </td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black ${
                              tx.txType === 'Venta'
                                ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400'
                                : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                            }`}>
                              {tx.txType}
                            </span>
                          </td>
                          <td className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200">{tx.card_name ?? '—'}</td>
                          <td className="px-3 py-3 text-right font-black text-slate-900 dark:text-white whitespace-nowrap">
                            {money(tx.price)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black ${statusBadge(tx.status)}`}>
                              {statusLabel(tx.status)}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="px-3 py-10 text-center text-slate-400 dark:text-slate-500">
                            No hay transacciones en este período
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
