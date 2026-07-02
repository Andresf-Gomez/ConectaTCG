import { useCallback, useRef, useState } from 'react';
import { Upload, FileJson, BarChart2, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const EDGE_FN_URL  = 'https://uuzejzgmrvrznnrmrnej.supabase.co/functions/v1/upload-catalog';
const CHUNK_SIZE   = 2000;

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawCardSource {
  set?: { id?: string };
  data?: Record<string, { rarity?: string }>;
}

interface PreviewResult {
  mode: 'preview';
  total_cards: number;
  sets: { total_in_file: number; new: number; existing: number };
  cards: { new: number; existing: number };
  rarities: { total_in_file: number; new: number; existing: number };
}

interface ChunkResult {
  cards: { inserted: number; updated: number; skipped: number };
}

interface CommitTotals {
  inserted: number;
  updated: number;
  skipped: number;
}

interface CommitProgress {
  done: number;
  total: number;
  chunkIndex: number;
  totalChunks: number;
}

// Phases:
//   idle         → drop zone
//   file-error   → file parsing failed (drop zone + error)
//   file-ready   → file OK, Analizar button (+ optional retry error)
//   previewing   → spinner
//   preview-done → preview table + Confirmar button (+ optional retry error)
//   committing   → progress bar
//   commit-done  → success
type Phase = 'idle' | 'file-error' | 'file-ready' | 'previewing' | 'preview-done' | 'committing' | 'commit-done';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function callEdgeFn(payload: Record<string, unknown>): Promise<unknown> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Sesión expirada. Vuelve a iniciar sesión.');

  const res = await fetch(EDGE_FN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.error ?? `Error ${res.status}`);
  return json;
}

// Extracts lightweight preview data client-side — avoids sending 34 MB to the server
function extractPreviewData(raw: { cards: Record<string, RawCardSource> }) {
  const tcgdex_ids: string[] = [];
  const set_codes  = new Set<string>();
  const rarities   = new Set<string>();

  for (const [id, card] of Object.entries(raw.cards)) {
    tcgdex_ids.push(id);
    if (card.set?.id) set_codes.add(card.set.id);
    const dataLangs = Object.keys(card.data || {});
    const rawRarity =
      card.data?.en?.rarity ??
      (dataLangs.length > 0 ? card.data?.[dataLangs[0]]?.rarity : undefined) ??
      '';
    if (rawRarity) rarities.add(rawRarity);
  }

  return { total_in_file: tcgdex_ids.length, tcgdex_ids, set_codes: [...set_codes], rarities: [...rarities] };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatRow({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${accent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </span>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl">
      <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminCatalogPage({ setPage }: { setPage: (page: string) => void }) {
  const { role } = useAuth();

  const [phase, setPhase]           = useState<Phase>('idle');
  const [dragOver, setDragOver]     = useState(false);
  const [fileName, setFileName]     = useState('');
  const [cardCount, setCardCount]   = useState(0);
  const [rawPayload, setRawPayload] = useState<{ cards: Record<string, RawCardSource> } | null>(null);
  const [preview, setPreview]       = useState<PreviewResult | null>(null);
  const [commitTotals, setCommitTotals] = useState<CommitTotals | null>(null);
  const [progress, setProgress]     = useState<CommitProgress>({ done: 0, total: 0, chunkIndex: 0, totalChunks: 0 });
  const [errorMsg, setErrorMsg]     = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  if (role !== 'admin') {
    setPage('home');
    return null;
  }

  // ── File handling ──────────────────────────────────────────────────────────

  function resetToIdle() {
    setPhase('idle');
    setFileName('');
    setCardCount(0);
    setRawPayload(null);
    setPreview(null);
    setCommitTotals(null);
    setErrorMsg('');
    if (inputRef.current) inputRef.current.value = '';
  }

  function processFile(file: File) {
    setErrorMsg('');
    if (!file.name.endsWith('.json')) {
      setErrorMsg('El archivo debe ser un .json');
      setPhase('file-error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!parsed || typeof parsed !== 'object' || !('cards' in parsed)) {
          throw new Error('El JSON no tiene el campo "cards" esperado.');
        }
        const count = Object.keys(parsed.cards as object).length;
        if (count === 0) throw new Error('El archivo no contiene cartas.');
        setFileName(file.name);
        setCardCount(count);
        setRawPayload(parsed as { cards: Record<string, RawCardSource> });
        setPreview(null);
        setCommitTotals(null);
        setPhase('file-ready');
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Archivo inválido.');
        setPhase('file-error');
      }
    };
    reader.readAsText(file);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // ── Edge Function calls ────────────────────────────────────────────────────

  async function runPreview() {
    if (!rawPayload) return;
    setPhase('previewing');
    setErrorMsg('');
    try {
      const previewData = extractPreviewData(rawPayload);
      const result = await callEdgeFn({ preview: true, ...previewData }) as PreviewResult;
      setPreview(result);
      setPhase('preview-done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido al analizar.');
      setPhase('file-ready');
    }
  }

  async function runCommit() {
    if (!rawPayload) return;

    const allIds      = Object.keys(rawPayload.cards);
    const total       = allIds.length;
    const totalChunks = Math.ceil(total / CHUNK_SIZE);

    setPhase('committing');
    setErrorMsg('');
    setProgress({ done: 0, total, chunkIndex: 0, totalChunks });

    let inserted = 0, updated = 0, skipped = 0;

    try {
      for (let i = 0; i < allIds.length; i += CHUNK_SIZE) {
        const chunkIds   = allIds.slice(i, i + CHUNK_SIZE);
        const chunkCards: Record<string, unknown> = {};
        for (const id of chunkIds) chunkCards[id] = rawPayload.cards[id];

        const result = await callEdgeFn({ preview: false, cards: chunkCards }) as ChunkResult;

        inserted += result.cards.inserted;
        updated  += result.cards.updated;
        skipped  += result.cards.skipped;

        setProgress({
          done:        Math.min(i + CHUNK_SIZE, total),
          total,
          chunkIndex:  Math.floor(i / CHUNK_SIZE) + 1,
          totalChunks,
        });
      }

      setCommitTotals({ inserted, updated, skipped });
      setPhase('commit-done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido al actualizar.');
      setPhase('preview-done');
    }
  }

  // ── Render flags ───────────────────────────────────────────────────────────

  const showDropZone   = phase === 'idle' || phase === 'file-error';
  const showFileCard   = phase !== 'idle' && phase !== 'file-error';
  const showAnalizar   = phase === 'file-ready';
  const showPreviewing = phase === 'previewing';
  const showPreview    = phase === 'preview-done' || phase === 'committing' || phase === 'commit-done';
  const showConfirmar  = phase === 'preview-done';
  const showCommitting = phase === 'committing';
  const showCommitDone = phase === 'commit-done';

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <FileJson size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de catálogo</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sube base_depurada.json para actualizar el catálogo de cartas
            </p>
          </div>
        </div>

        {/* Drop zone */}
        {showDropZone && (
          <>
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition
                ${dragOver
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                  : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                }`}
            >
              <input ref={inputRef} type="file" accept=".json" className="hidden" onChange={onFileChange} />
              <Upload size={36} className="mx-auto mb-3 text-slate-400 dark:text-slate-500" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                {dragOver ? 'Suelta el archivo aquí' : 'Arrastra base_depurada.json aquí'}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">o haz clic para seleccionar</p>
            </div>
            {phase === 'file-error' && errorMsg && <ErrorBanner message={errorMsg} />}
          </>
        )}

        {/* File card */}
        {showFileCard && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-950/40 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{fileName}</p>
                  <p className="text-xs text-slate-400">{cardCount.toLocaleString('es-CO')} cartas detectadas</p>
                </div>
              </div>
              {phase !== 'committing' && phase !== 'commit-done' && (
                <button
                  onClick={resetToIdle}
                  title="Cambiar archivo"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex-shrink-0"
                >
                  <RefreshCw size={16} />
                </button>
              )}
            </div>

            {showAnalizar && (
              <>
                {errorMsg && <ErrorBanner message={errorMsg} />}
                <button
                  onClick={runPreview}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition"
                >
                  <BarChart2 size={16} />
                  Analizar
                </button>
              </>
            )}
          </div>
        )}

        {/* Spinner — previewing */}
        {showPreviewing && (
          <div className="mt-6 flex flex-col items-center gap-3 py-10">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Analizando archivo...</p>
          </div>
        )}

        {/* Preview result */}
        {showPreview && preview && (
          <div className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Resumen del análisis
            </p>
            <StatRow label="Total de cartas en el archivo" value={preview.total_cards.toLocaleString('es-CO')} />
            <StatRow label="Sets en el archivo"            value={preview.sets.total_in_file} />
            <StatRow label="Sets nuevos"                   value={preview.sets.new}      accent={preview.sets.new > 0} />
            <StatRow label="Sets ya existentes"            value={preview.sets.existing} />
            <StatRow label="Cartas nuevas"                 value={preview.cards.new.toLocaleString('es-CO')}      accent={preview.cards.new > 0} />
            <StatRow label="Cartas ya existentes"          value={preview.cards.existing.toLocaleString('es-CO')} />
            <StatRow label="Rarezas en el archivo"         value={preview.rarities.total_in_file} />
            <StatRow label="Rarezas nuevas"                value={preview.rarities.new} accent={preview.rarities.new > 0} />

            {showConfirmar && (
              <>
                {errorMsg && <ErrorBanner message={errorMsg} />}
                <button
                  onClick={runCommit}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition"
                >
                  <CheckCircle size={16} />
                  Confirmar y actualizar catálogo
                </button>
              </>
            )}
          </div>
        )}

        {/* Progress bar — committing */}
        {showCommitting && (
          <div className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 size={18} className="animate-spin text-green-500 flex-shrink-0" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Actualizando catálogo...</p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mb-3 overflow-hidden">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 tabular-nums">
              <span>
                Tanda {progress.chunkIndex} de {progress.totalChunks}
              </span>
              <span>
                {progress.done.toLocaleString('es-CO')} / {progress.total.toLocaleString('es-CO')} cartas · {pct}%
              </span>
            </div>
          </div>
        )}

        {/* Commit result */}
        {showCommitDone && commitTotals && (
          <div className="mt-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
              <p className="font-semibold text-green-800 dark:text-green-300 text-sm">
                Catálogo actualizado con éxito
              </p>
            </div>
            <StatRow label="Cartas insertadas"              value={commitTotals.inserted.toLocaleString('es-CO')} accent />
            <StatRow label="Cartas actualizadas"            value={commitTotals.updated.toLocaleString('es-CO')} />
            {preview && (
              <>
                <StatRow label="Sets en el catálogo"       value={preview.sets.total_in_file} />
                <StatRow label="Rarezas en el catálogo"    value={preview.rarities.total_in_file} />
              </>
            )}
            {commitTotals.skipped > 0 && (
              <StatRow label="Cartas omitidas (set desconocido)" value={commitTotals.skipped} />
            )}
            <button
              onClick={resetToIdle}
              className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition"
            >
              <RefreshCw size={15} />
              Subir otro archivo
            </button>
          </div>
        )}

      </div>
    </Layout>
  );
}
