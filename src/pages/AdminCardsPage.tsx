import { useEffect, useState, useRef } from 'react';
import {
  BookOpen, ChevronLeft, ChevronRight, Plus, Pencil,
  Search, Loader2, CheckCircle, AlertCircle, X, ArrowLeft,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { CardImage } from '../components/ImagePlaceholder';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { bestName, LANG_LABELS, clearCatalogCache } from '../hooks/useCatalog';

const FORM_LANGS = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh-cn', 'zh-tw', 'th', 'id'] as const;
type FormLang = typeof FORM_LANGS[number];

const SEARCH_LANGS = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'th', 'id'];

const PAGE_SIZE = 20;

const CARD_SELECT = 'id, tcgdex_id, names, number, image_url, set_id, sets(id, set_code, names), rarity_id, rarities(id, code, names)';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardRow {
  id: number;
  tcgdex_id: string;
  names: Record<string, string>;
  number: string;
  image_url: string | null;
  set_id: number;
  sets: { id: number; set_code: string; names: Record<string, string> } | null;
  rarity_id: number | null;
  rarities: { id: number; code: string; names: Record<string, string> } | null;
}

interface RarityOption {
  id: number;
  code: string;
  name: string;
}

interface SetDropdownOption {
  id: number;
  set_code: string;
  name: string;
}

type View = 'list' | 'form';

// ─── Shared banners ───────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl">
      <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
    </div>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl">
      <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-green-700 dark:text-green-300">{message}</p>
    </div>
  );
}

// ─── ListView ─────────────────────────────────────────────────────────────────

interface ListViewProps {
  setPage: (page: string) => void;
  onEdit: (card: CardRow) => void;
  onNew: () => void;
}

function ListView({ setPage, onEdit, onNew }: ListViewProps) {
  const [cards, setCards] = useState<CardRow[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasSearched = debouncedQuery.trim().length >= 2;

  function handleSearch(val: string) {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(val);
      setCurrentPage(0);
    }, 300);
  }

  useEffect(() => {
    if (!hasSearched) {
      setCards([]);
      setTotal(0);
      return;
    }
    fetchCards();
  }, [currentPage, debouncedQuery]);

  async function fetchCards() {
    setLoading(true);
    setError('');
    try {
      const q = debouncedQuery.trim();
      const langFilters = SEARCH_LANGS.map((l) => `names->>${l}.ilike.%${q}%`).join(',');

      const { data, error: err, count } = await supabase
        .from('catalog_cards')
        .select(CARD_SELECT, { count: 'exact' })
        .or(`tcgdex_id.ilike.%${q}%,${langFilters}`)
        .order('tcgdex_id')
        .range(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE - 1);

      if (err) throw err;
      setCards((data ?? []) as unknown as CardRow[]);
      setTotal(count ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar cartas.');
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage('admin')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Volver al panel admin"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center flex-shrink-0">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cartas</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {hasSearched
                ? (loading ? '…' : `${total.toLocaleString('es-CO')} resultados`)
                : '30.618 cartas · busca para filtrar'}
            </p>
          </div>
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition"
        >
          <Plus size={16} />
          Nueva carta
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nombre (cualquier idioma) o tcgdex_id… (mínimo 2 caracteres)"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setDebouncedQuery('');
              setCards([]);
              setCurrentPage(0);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {error && <div className="mb-5"><ErrorBanner message={error} /></div>}

      {/* Empty state — before search */}
      {!hasSearched && (
        <div className="text-center py-24">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-orange-500" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-semibold">Busca una carta para empezar</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Filtra por nombre en cualquier idioma o por su tcgdex_id (ej. base1-1)
          </p>
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 size={28} className="animate-spin text-orange-500" />
            <p className="text-sm text-slate-400">Buscando…</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-sm">
            Sin resultados para "{debouncedQuery}"
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="w-14 px-4 py-3" />
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nombre</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden sm:table-cell">tcgdex_id</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">Set</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">Nº</th>
                    <th className="w-24" />
                  </tr>
                </thead>
                <tbody>
                  {cards.map((card) => (
                    <tr
                      key={card.id}
                      className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                    >
                      <td className="px-4 py-2">
                        <div className="w-8 h-11 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <CardImage
                            src={card.image_url}
                            alt={bestName(card.names, 'en', card.tcgdex_id)}
                            className="w-full h-full object-cover"
                            placeholderSize="sm"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-white max-w-[180px] truncate">
                        {bestName(card.names, 'en', card.tcgdex_id)}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell whitespace-nowrap">
                        {card.tcgdex_id}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden md:table-cell">
                        {card.sets?.set_code ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 tabular-nums hidden lg:table-cell">
                        {card.number ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onEdit(card)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-slate-600 dark:text-slate-400 hover:text-orange-700 dark:hover:text-orange-400 text-xs font-semibold transition"
                        >
                          <Pencil size={12} />
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-orange-400 dark:hover:border-orange-600 transition"
                >
                  <ChevronLeft size={15} />
                  Anterior
                </button>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Página{' '}
                  <span className="font-semibold text-slate-800 dark:text-white">{currentPage + 1}</span>
                  {' '}de{' '}
                  <span className="font-semibold text-slate-800 dark:text-white">{totalPages}</span>
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-orange-400 dark:hover:border-orange-600 transition"
                >
                  Siguiente
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )
      )}
    </>
  );
}

// ─── FormView ─────────────────────────────────────────────────────────────────

interface FormViewProps {
  editCard: CardRow | null;
  onBack: () => void;
  onSaved: () => void;
}

function FormView({ editCard, onBack, onSaved }: FormViewProps) {
  const isNew = editCard === null;

  const [tcgdexId, setTcgdexId] = useState(editCard?.tcgdex_id ?? '');
  const [names, setNames] = useState<Partial<Record<FormLang, string>>>(
    (editCard?.names ?? {}) as Partial<Record<FormLang, string>>,
  );
  const [cardNumber, setCardNumber] = useState(editCard?.number ?? '');
  const [imageUrl, setImageUrl] = useState(editCard?.image_url ?? '');
  const [setId, setSetId] = useState<number | ''>(editCard?.set_id ?? '');
  const [rarityId, setRarityId] = useState<number | ''>(editCard?.rarity_id ?? '');

  const [rarities, setRarities] = useState<RarityOption[]>([]);
  const [sets, setSets] = useState<SetDropdownOption[]>([]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('rarities')
      .select('id, code, names')
      .order('code')
      .then(({ data }) => {
        if (data) {
          setRarities(
            (data as { id: number; code: string; names: Record<string, string> }[]).map((r) => ({
              id: r.id,
              code: r.code,
              name: r.names?.en ?? r.code,
            })),
          );
        }
      });

    supabase
      .from('sets')
      .select('id, set_code, names')
      .order('set_code')
      .then(({ data }) => {
        if (data) {
          setSets(
            (data as { id: number; set_code: string; names: Record<string, string> }[]).map((s) => ({
              id: s.id,
              set_code: s.set_code,
              name: bestName(s.names, 'en', s.set_code),
            })),
          );
        }
      });
  }, []);

  async function handleSave() {
    const builtNames: Record<string, string> = {};
    for (const lang of FORM_LANGS) {
      const val = (names[lang] ?? '').trim();
      if (val) builtNames[lang] = val;
    }
    if (Object.keys(builtNames).length === 0) {
      setError('Agrega al menos un nombre.');
      return;
    }
    if (isNew && !tcgdexId.trim()) {
      setError('El tcgdex_id es obligatorio.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = {
        names: builtNames,
        number: cardNumber.trim() || null,
        image_url: imageUrl.trim() || null,
        set_id: setId !== '' ? setId : null,
        rarity_id: rarityId !== '' ? rarityId : null,
      };

      if (isNew) {
        payload.tcgdex_id = tcgdexId.trim();
        const { error: err } = await supabase.from('catalog_cards').insert(payload);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from('catalog_cards')
          .update(payload)
          .eq('id', editCard!.id);
        if (err) throw err;
      }

      clearCatalogCache();
      setSaved(true);
      setTimeout(onSaved, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          disabled={saving}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-40"
          title="Volver a la lista"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center flex-shrink-0">
          {isNew ? <Plus size={20} className="text-white" /> : <Pencil size={20} className="text-white" />}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isNew ? 'Nueva carta' : 'Editar carta'}
          </h1>
          {!isNew && (
            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{editCard!.tcgdex_id}</p>
          )}
        </div>
      </div>

      <div className="space-y-5">

        {/* Identificación — solo al crear */}
        {isNew && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Identificación
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                tcgdex_id <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={tcgdexId}
                onChange={(e) => setTcgdexId(e.target.value)}
                placeholder="ej. base1-1"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        )}

        {/* Nombres por idioma */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            Nombres <span className="text-red-400 font-normal normal-case ml-1">— agrega al menos uno</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FORM_LANGS.map((lang) => (
              <div key={lang}>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {LANG_LABELS[lang]}
                  {lang === 'en' && <span className="text-red-400 font-normal">(recomendado)</span>}
                </label>
                <input
                  type="text"
                  value={names[lang] ?? ''}
                  onChange={(e) => setNames((prev) => ({ ...prev, [lang]: e.target.value }))}
                  placeholder={`Nombre en ${LANG_LABELS[lang].toLowerCase()}…`}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Metadatos */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            Metadatos
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Número (localId)
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="ej. 1 o SWSH001"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Set</label>
              <select
                value={setId}
                onChange={(e) => setSetId(e.target.value ? parseInt(e.target.value, 10) : '')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Sin seleccionar</option>
                {sets.map((s) => (
                  <option key={s.id} value={s.id}>{s.set_code} — {s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Rareza</label>
              <select
                value={rarityId}
                onChange={(e) => setRarityId(e.target.value ? parseInt(e.target.value, 10) : '')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Sin rareza</option>
                {rarities.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                URL de imagen
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {imageUrl && (
            <div className="mt-4 flex items-center gap-3">
              <div className="w-16 h-24 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center">
                <CardImage
                  src={imageUrl}
                  alt="preview"
                  className="w-full h-full object-cover"
                  placeholderSize="sm"
                />
              </div>
              <p className="text-xs text-slate-400">Vista previa de imagen</p>
            </div>
          )}
        </div>

        {error && <ErrorBanner message={error} />}
        {saved && (
          <SuccessBanner
            message={isNew ? 'Carta creada correctamente.' : 'Carta actualizada correctamente.'}
          />
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onBack}
            disabled={saving || saved}
            className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" />Guardando…</>
            ) : saved ? (
              <><CheckCircle size={16} />Guardado</>
            ) : isNew ? 'Crear carta' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AdminCardsPage({ setPage }: { setPage: (page: string) => void }) {
  const { role } = useAuth();
  const [view, setView] = useState<View>('list');
  const [editCard, setEditCard] = useState<CardRow | null>(null);
  const [listKey, setListKey] = useState(0);

  if (role !== 'admin') {
    setPage('home');
    return null;
  }

  function openEdit(card: CardRow) {
    setEditCard(card);
    setView('form');
  }

  function openNew() {
    setEditCard(null);
    setView('form');
  }

  function goBack() {
    setView('list');
    setEditCard(null);
  }

  function handleSaved() {
    setListKey((k) => k + 1);
    goBack();
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        {view === 'list' ? (
          <ListView key={listKey} setPage={setPage} onEdit={openEdit} onNew={openNew} />
        ) : (
          <FormView editCard={editCard} onBack={goBack} onSaved={handleSaved} />
        )}
      </div>
    </Layout>
  );
}
