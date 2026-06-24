import { useEffect, useState } from 'react';

export interface CatalogCard {
  id: string;
  names: Record<string, string>;
  set_id: string;
  image_url: string;
  languages: string[];
}

let cache: CatalogCard[] | null = null;

export function useCatalog() {
  const [catalog, setCatalog] = useState<CatalogCard[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    fetch('/catalog.json')
      .then((r) => r.json())
      .then((data: CatalogCard[]) => {
        cache = data;
        setCatalog(data);
        setLoading(false);
      });
  }, []);

  return { catalog, loading };
}

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

export function getDisplayName(card: CatalogCard): string {
  return card.names.es || card.names.en || Object.values(card.names)[0] || card.id;
}
