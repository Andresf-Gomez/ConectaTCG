import { useEffect, useState, useRef } from 'react';
import {
  Database, ChevronLeft, ChevronRight, Plus, Pencil,
  Search, Loader2, CheckCircle, AlertCircle, X, ArrowLeft,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { bestName, LANG_LABELS, clearCatalogCache } from '../hooks/useCatalog';

// Languages shown in the form
const FORM_LANGS = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh-cn', 'zh-tw', 'th', 'id'] as const;
type FormLang = typeof FORM_LANGS[number];

// Languages safe to use in PostgREST filter syntax (no hyphens)
const SEARCH_LANGS = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'th', 'id'];

const PAGE_SIZE = 20;

// ─── Types ────────────────────────────────────────────────────────────────────

interface SetRow {
  id: number;
  set_code: string;
  names: Record<string, string>;
  year: number | null;
  serie: string | null;
  game_id: number | null;
  catalog_cards: { count: number }[];
}

interface GameOption {
  id: number;
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
  onEdit: (set: SetRow) => void;
  onNew: () => void;
}

function ListView({ setPage, onEdit, onNew }: ListViewProps) {
  const [sets, setSets] = useState<SetRow[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearch(val: string) {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(val);
      setCurrentPage(0);
    }, 300);
  }

  useEffect(() => {
    fetchSets();
  }, [currentPage, debouncedQuery]);

  async function fetchSets() {
    setLoading(true);
    setError('');
    try {
      const q = debouncedQuery.trim();
      const isSearching = q.length > 0;

      let qb = supabase
        .from('sets')
        .select('id, set_code, names, year, serie, game_id, catalog_cards(count)', { count: 'exact' })
        .order('set_code');

      if (isSearching) {
        const langFilters = SEARCH_LANGS.map((l) => `names->>${l}.ilike.%${q}%`).join(',');
        qb = qb.or(`set_code.ilike.%${q}%,${langFilters}`);
      } else {
        qb = qb.range(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE - 1);
      }

      const { data, error: err, count } = await qb;
      if (err) throw err;
      setSets((data ?? []) as unknown as SetRow[]);
      setTotal(count ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar sets.');
    } finally {
      setLoading(false);
    }
  }

  const isSearching = debouncedQuery.trim().length > 0;
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
          <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center flex-shrink-0">
            <Database size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Editar catálogo</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sets · {loading ? '…' : `${total} registros`}
            </p>
          </div>
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition"
        >
          <Plus size={16} />
          Nuevo set
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nombre (cualquier idioma) o código…"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setDebouncedQuery(''); setCurrentPage(0); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {error && <div className="mb-5"><ErrorBanner message={error} /></div>}

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <Loader2 size={28} className="animate-spin text-violet-500" />
          <p className="text-sm text-slate-400">Cargando sets…</p>
        </div>
      ) : sets.length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-sm">
          {isSearching ? `Sin resultados para "${debouncedQuery}"` : 'No hay sets en el catálogo.'}
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Código</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden sm:table-cell">Año</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">Serie</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">Cartas</th>
                  <th className="w-24" />
                </tr>
              </thead>
              <tbody>
                {sets.map((set) => {
                  const cardCount = set.catalog_cards?.[0]?.count ?? 0;
                  return (
                    <tr
                      key={set.id}
                      className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-white max-w-[180px] truncate">
                        {bestName(set.names, 'en', set.set_code)}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                        {set.set_code}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell tabular-nums">
                        {set.year ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden md:table-cell max-w-[160px] truncate">
                        {set.serie ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 tabular-nums hidden lg:table-cell">
                        {cardCount.toLocaleString('es-CO')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onEdit(set)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 dark:hover:bg-violet-900/30 text-slate-600 dark:text-slate-400 hover:text-violet-700 dark:hover:text-violet-400 text-xs font-semibold transition"
                        >
                          <Pencil size={12} />
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isSearching && totalPages > 1 && (
            <div className="flex items-center justify-between mt-5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-400 dark:hover:border-violet-600 transition"
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-400 dark:hover:border-violet-600 transition"
              >
                Siguiente
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

// ─── FormView ─────────────────────────────────────────────────────────────────

interface FormViewProps {
  editSet: SetRow | null;
  onBack: () => void;
  onSaved: () => void;
}

function FormView({ editSet, onBack, onSaved }: FormViewProps) {
  const isNew = editSet === null;

  const [names, setNames] = useState<Partial<Record<FormLang, string>>>(
    (editSet?.names ?? {}) as Partial<Record<FormLang, string>>,
  );
  const [year, setYear] = useState(editSet?.year?.toString() ?? '');
  const [serie, setSerie] = useState(editSet?.serie ?? '');
  const [setCode, setSetCode] = useState(editSet?.set_code ?? '');
  const [gameId, setGameId] = useState<number | ''>(editSet?.game_id ?? '');
  const [games, setGames] = useState<GameOption[]>([]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) {
      supabase
        .from('games')
        .select('id, name')
        .eq('active', true)
        .order('name')
        .then(({ data }) => { if (data) setGames(data as GameOption[]); });
    }
  }, [isNew]);

  async function handleSave() {
    const code = setCode.trim();
    if (!code) { setError('El código del set es obligatorio.'); return; }

    const builtNames: Record<string, string> = {};
    for (const lang of FORM_LANGS) {
      const val = (names[lang] ?? '').trim();
      if (val) builtNames[lang] = val;
    }
    if (Object.keys(builtNames).length === 0) {
      setError('Agrega al menos un nombre.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload: Record<string, unknown> = {
        names: builtNames,
        year: year.trim() ? parseInt(year.trim(), 10) : null,
        serie: serie.trim() || null,
      };

      if (isNew) {
        payload.set_code = code;
        if (gameId !== '') payload.game_id = gameId;
        const { error: err } = await supabase.from('sets').insert(payload);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('sets').update(payload).eq('id', editSet!.id);
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
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          disabled={saving}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-40"
          title="Volver a la lista"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center flex-shrink-0">
          {isNew ? <Plus size={20} className="text-white" /> : <Pencil size={20} className="text-white" />}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isNew ? 'Nuevo set' : 'Editar set'}
          </h1>
          {!isNew && (
            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{editSet!.set_code}</p>
          )}
        </div>
      </div>

      <div className="space-y-5">

        {/* Identificación (solo al crear) */}
        {isNew && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Identificación
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Código del set <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={setCode}
                  onChange={(e) => setSetCode(e.target.value)}
                  placeholder="ej. swsh1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Juego
                </label>
                <select
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Sin seleccionar</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Metadatos */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            Metadatos
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Año
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="ej. 2020"
                min={1996}
                max={2099}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Serie
              </label>
              <input
                type="text"
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                placeholder="ej. Sword & Shield"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>

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
                  onChange={(e) =>
                    setNames((prev) => ({ ...prev, [lang]: e.target.value }))
                  }
                  placeholder={`Nombre en ${LANG_LABELS[lang].toLowerCase()}…`}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Feedback */}
        {error && <ErrorBanner message={error} />}
        {saved && (
          <SuccessBanner
            message={isNew ? 'Set creado correctamente.' : 'Set actualizado correctamente.'}
          />
        )}

        {/* Actions */}
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
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Guardando…
              </>
            ) : saved ? (
              <>
                <CheckCircle size={16} />
                Guardado
              </>
            ) : isNew ? (
              'Crear set'
            ) : (
              'Guardar cambios'
            )}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AdminSetsPage({ setPage }: { setPage: (page: string) => void }) {
  const { role } = useAuth();
  const [view, setView] = useState<View>('list');
  const [editSet, setEditSet] = useState<SetRow | null>(null);
  const [listKey, setListKey] = useState(0);

  if (role !== 'admin') {
    setPage('home');
    return null;
  }

  function openEdit(set: SetRow) {
    setEditSet(set);
    setView('form');
  }

  function openNew() {
    setEditSet(null);
    setView('form');
  }

  function goBack() {
    setView('list');
    setEditSet(null);
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
          <FormView editSet={editSet} onBack={goBack} onSaved={handleSaved} />
        )}
      </div>
    </Layout>
  );
}
