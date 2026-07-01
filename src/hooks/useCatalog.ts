import { useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CatalogCard {
  id: string;                      // tcgdex_id  e.g. 'base1-1'
  localId: string;                 // card number within set
  names: Record<string, string>;
  setNames: Record<string, string>;
  set_id: string;                  // set_code  e.g. 'base1'
  year: number | null;
  image_url: string;
  languages: string[];
  rarity: string;
  variants: string[];              // TODO: populate from variants relation
}

export interface SetOption {
  id: string;    // set_code
  name: string;  // best available name (en or first)
  names: Record<string, string>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const LANG_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  ja: '日本語',
  pt: 'Português',
  ko: '한국어',
  'zh-cn': '中文简体',
  'zh-tw': '中文繁體',
  th: 'ไทย',
  id: 'Indonesia',
};

const POKEMON_GAME_ID = 6;

const CARD_SELECT = `
  id, tcgdex_id, names, number, image_url, languages,
  set_id, sets ( set_code, names, year ),
  rarity_id, rarities ( code, names )
`.trim();

// ─── Internal row type ────────────────────────────────────────────────────────

interface SupabaseCatalogRow {
  id: number;
  tcgdex_id: string;
  names: Record<string, string>;
  number: string;
  image_url: string | null;
  languages: string[];
  set_id: number;
  sets: { set_code: string; names: Record<string, string>; year: number | null } | null;
  rarity_id: number | null;
  rarities: { code: string; names: Record<string, string> } | null;
}

function mapRow(row: SupabaseCatalogRow): CatalogCard {
  return {
    id: row.tcgdex_id,
    localId: row.number ?? '',
    names: row.names ?? {},
    setNames: row.sets?.names ?? {},
    set_id: row.sets?.set_code ?? '',
    year: row.sets?.year ?? null,
    image_url: row.image_url ?? '',
    languages: Array.isArray(row.languages) ? row.languages : [],
    rarity: row.rarities?.names?.en ?? row.rarities?.code ?? '',
    variants: [],
  };
}

// ─── Module-level caches ──────────────────────────────────────────────────────

const yearsCache = new Map<string, number[]>();
const setsCache = new Map<number, SetOption[]>();
const cardsCache = new Map<string, CatalogCard[]>();
const setCodeToDbId = new Map<string, number>();

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Resolves a multilingual names object to the best available string.
// Priority: requested lang → English → first available → fallback code.
export function bestName(
  names: Record<string, string>,
  lang: string,
  fallback: string,
): string {
  return (lang && names[lang]) || names.en || Object.values(names)[0] || fallback;
}

export function getDisplayName(card: CatalogCard, lang = ''): string {
  return bestName(card.names, lang, card.id);
}

export function getLanguages(): string[] {
  return Object.keys(LANG_LABELS);
}

// ─── Async fetch functions (exported for direct use in BulkPublishPage) ───────

export async function fetchYears(lang: string): Promise<number[]> {
  if (yearsCache.has(lang)) return yearsCache.get(lang)!;
  const { data, error } = await supabase.rpc('get_years_for_language', { lang });
  if (error) throw error;
  const years = (data as { year: number }[]).map((r) => r.year);
  yearsCache.set(lang, years);
  return years;
}

export async function fetchSets(year: number): Promise<SetOption[]> {
  if (setsCache.has(year)) return setsCache.get(year)!;
  const { data, error } = await supabase
    .from('sets')
    .select('id, set_code, names')
    .eq('game_id', POKEMON_GAME_ID)
    .eq('year', year)
    .order('set_code');
  if (error) throw error;
  const sets: SetOption[] = (
    data as { id: number; set_code: string; names: Record<string, string> }[]
  )
    .map((s) => {
      setCodeToDbId.set(s.set_code, s.id);
      const names = s.names ?? {};
      return {
        id: s.set_code,
        name: names.en || Object.values(names)[0] || s.set_code,
        names,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  setsCache.set(year, sets);
  return sets;
}

export async function fetchCards(setCode: string, lang: string): Promise<CatalogCard[]> {
  const cacheKey = `${setCode}:${lang}`;
  if (cardsCache.has(cacheKey)) return cardsCache.get(cacheKey)!;

  let dbId = setCodeToDbId.get(setCode);
  if (dbId === undefined) {
    const { data, error } = await supabase
      .from('sets')
      .select('id')
      .eq('set_code', setCode)
      .single();
    if (error) throw error;
    dbId = (data as { id: number }).id;
    setCodeToDbId.set(setCode, dbId);
  }

  const { data, error } = await supabase
    .from('catalog_cards')
    .select(CARD_SELECT)
    .eq('set_id', dbId)
    .filter('languages', 'cs', JSON.stringify([lang]))
    .order('number');
  if (error) throw error;

  const cards = (data ?? []).map((row) => mapRow(row as SupabaseCatalogRow));
  cardsCache.set(cacheKey, cards);
  return cards;
}

export async function searchCards(query: string): Promise<CatalogCard[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const { data, error } = await supabase
    .from('catalog_cards')
    .select(CARD_SELECT)
    .or(`names->>en.ilike.%${q}%,names->>es.ilike.%${q}%`)
    .limit(20);
  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as SupabaseCatalogRow));
}

// ─── useCatalogSearch — for PublishPage search mode ───────────────────────────

export function useCatalogSearch() {
  const [results, setResults] = useState<CatalogCard[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((query: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await searchCards(query));
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  return { results, loading, search };
}

// ─── useCatalogCascade — for PublishPage explore mode ─────────────────────────

export function useCatalogCascade() {
  const [years, setYears] = useState<number[]>([]);
  const [sets, setSets] = useState<SetOption[]>([]);
  const [cards, setCards] = useState<CatalogCard[]>([]);
  const [loading, setLoading] = useState(false);

  const getYears = useCallback(async (lang: string) => {
    setLoading(true);
    setYears([]);
    setSets([]);
    setCards([]);
    try {
      setYears(await fetchYears(lang));
    } finally {
      setLoading(false);
    }
  }, []);

  const getSets = useCallback(async (year: number) => {
    setLoading(true);
    setSets([]);
    setCards([]);
    try {
      setSets(await fetchSets(year));
    } finally {
      setLoading(false);
    }
  }, []);

  const getCards = useCallback(async (setCode: string, lang: string) => {
    setLoading(true);
    setCards([]);
    try {
      setCards(await fetchCards(setCode, lang));
    } finally {
      setLoading(false);
    }
  }, []);

  const findCard = useCallback(
    (id: string) => cards.find((c) => c.id === id),
    [cards],
  );

  return {
    languages: getLanguages(),
    years,
    sets,
    cards,
    loading,
    getYears,
    getSets,
    getCards,
    findCard,
  };
}
