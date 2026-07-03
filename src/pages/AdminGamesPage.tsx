import { useEffect, useState } from 'react';
import {
  Gamepad2, Plus, Pencil, Loader2, CheckCircle,
  AlertCircle, ArrowLeft, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { clearCatalogCache } from '../hooks/useCatalog';

interface GameRow {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  sets: { count: number }[];
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
  onEdit: (game: GameRow) => void;
  onNew: () => void;
}

function ListView({ setPage, onEdit, onNew }: ListViewProps) {
  const [games, setGames] = useState<GameRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase
        .from('games')
        .select('id, name, slug, active, sets(count)')
        .order('name');
      if (err) throw err;
      setGames((data ?? []) as unknown as GameRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar juegos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage('admin')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Volver al panel admin"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-green-600 flex items-center justify-center flex-shrink-0">
            <Gamepad2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Juegos</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {loading ? '…' : `${games.length} juegos`}
            </p>
          </div>
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition"
        >
          <Plus size={16} />
          Nuevo juego
        </button>
      </div>

      {error && <div className="mb-5"><ErrorBanner message={error} /></div>}

      {loading ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <Loader2 size={28} className="animate-spin text-green-500" />
          <p className="text-sm text-slate-400">Cargando juegos…</p>
        </div>
      ) : games.length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-sm">
          No hay juegos en el catálogo.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden sm:table-cell">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Activo</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">Sets</th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody>
              {games.map((game) => {
                const setCount = game.sets?.[0]?.count ?? 0;
                return (
                  <tr
                    key={game.id}
                    className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{game.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell">
                      {game.slug}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        game.active
                          ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {game.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 tabular-nums hidden md:table-cell">
                      {setCount.toLocaleString('es-CO')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onEdit(game)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-green-100 dark:hover:bg-green-900/30 text-slate-600 dark:text-slate-400 hover:text-green-700 dark:hover:text-green-400 text-xs font-semibold transition"
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
      )}
    </>
  );
}

// ─── FormView ─────────────────────────────────────────────────────────────────

interface FormViewProps {
  editGame: GameRow | null;
  onBack: () => void;
  onSaved: () => void;
}

function FormView({ editGame, onBack, onSaved }: FormViewProps) {
  const isNew = editGame === null;
  const [name, setName] = useState(editGame?.name ?? '');
  const [slug, setSlug] = useState(editGame?.slug ?? '');
  const [active, setActive] = useState(editGame?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    const n = name.trim();
    const s = slug.trim();
    if (!n) { setError('El nombre es obligatorio.'); return; }
    if (!s) { setError('El slug es obligatorio.'); return; }

    setSaving(true);
    setError('');
    try {
      const payload = { name: n, slug: s, active };
      if (isNew) {
        const { error: err } = await supabase.from('games').insert(payload);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('games').update(payload).eq('id', editGame!.id);
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
        <div className="w-10 h-10 rounded-2xl bg-green-600 flex items-center justify-center flex-shrink-0">
          {isNew ? <Plus size={20} className="text-white" /> : <Pencil size={20} className="text-white" />}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isNew ? 'Nuevo juego' : 'Editar juego'}
          </h1>
          {!isNew && (
            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{editGame!.slug}</p>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            Datos del juego
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej. Pokémon TCG"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="ej. pokemon-tcg"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Estado</label>
            <button
              type="button"
              onClick={() => setActive((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                active
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {active ? 'Activo' : 'Inactivo'}
            </button>
          </div>
        </div>

        {error && <ErrorBanner message={error} />}
        {saved && (
          <SuccessBanner
            message={isNew ? 'Juego creado correctamente.' : 'Juego actualizado correctamente.'}
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
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" />Guardando…</>
            ) : saved ? (
              <><CheckCircle size={16} />Guardado</>
            ) : isNew ? 'Crear juego' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AdminGamesPage({ setPage }: { setPage: (page: string) => void }) {
  const { role } = useAuth();
  const [view, setView] = useState<View>('list');
  const [editGame, setEditGame] = useState<GameRow | null>(null);
  const [listKey, setListKey] = useState(0);

  if (role !== 'admin') {
    setPage('home');
    return null;
  }

  function openEdit(game: GameRow) {
    setEditGame(game);
    setView('form');
  }

  function openNew() {
    setEditGame(null);
    setView('form');
  }

  function goBack() {
    setView('list');
    setEditGame(null);
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
          <FormView editGame={editGame} onBack={goBack} onSaved={handleSaved} />
        )}
      </div>
    </Layout>
  );
}
