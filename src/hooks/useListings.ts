import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { GroupedCard } from './useCards';
import { bestName } from './useCatalog';

const LISTING_SELECT = `
  id, price, condition, quantity, language, variant, status,
  description, city, created_at, seller_id, catalog_card_id,
  catalog_cards (
    id, tcgdex_id, names, number, image_url,
    sets ( set_code, names, year ),
    rarities ( code, names )
  ),
  profiles ( full_name, city, rating )
`.trim();

interface CatalogCardJoin {
  id: number;
  tcgdex_id: string;
  names: Record<string, string>;
  number: string;
  image_url: string | null;
  sets: { set_code: string; names: Record<string, string>; year: number | null } | null;
  rarities: { code: string; names: Record<string, string> } | null;
}

interface ProfileJoin {
  full_name: string | null;
  city: string | null;
  rating: number | null;
}

interface ListingRow {
  id: string;
  price: number;
  condition: string;
  quantity: number;
  language: string;
  variant: string | null;
  status: string;
  description: string | null;
  city: string | null;
  created_at: string;
  seller_id: string;
  catalog_card_id: number;
  catalog_cards: CatalogCardJoin | null;
  profiles: ProfileJoin | null;
}

function groupListings(rows: ListingRow[]): GroupedCard[] {
  const groups = new Map<number, ListingRow[]>();
  for (const row of rows) {
    const group = groups.get(row.catalog_card_id);
    if (group) group.push(row);
    else groups.set(row.catalog_card_id, [row]);
  }

  let idCounter = 200000;
  const result: GroupedCard[] = [];

  for (const [, items] of groups) {
    const first = items[0];
    const cc = first.catalog_cards;
    if (!cc) continue;
    const lang = first.language;
    const prices = items.map((i) => i.price);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

    result.push({
      id: idCounter++,
      name: bestName(cc.names, lang, cc.tcgdex_id),
      set: bestName(cc.sets?.names ?? {}, lang, cc.sets?.set_code ?? ''),
      number: cc.number,
      rarity: cc.rarities?.names?.en ?? cc.rarities?.code ?? '',
      type: 'Carta single',
      language: lang,
      image: cc.image_url ?? '',
      marketAvg: avg,
      low: Math.min(...prices),
      high: Math.max(...prices),
      description: first.description ?? '',
      offers: items.map((item, i) => ({
        id: idCounter * 100 + i,
        seller: item.profiles?.full_name ?? 'Vendedor',
        price: item.price,
        condition: item.condition,
        rating: item.profiles?.rating ?? 0,
        reviews: 0,
        sales: 0,
        city: item.profiles?.city ?? item.city ?? '',
        shipping: '',
        verified: false,
      })),
    });
  }

  return result;
}

export function useListings() {
  const [cards, setCards] = useState<GroupedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('listings')
      .select(LISTING_SELECT)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
      setCards([]);
    } else {
      setCards(groupListings((data as unknown as ListingRow[]) ?? []));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { cards, loading, error, refetch: fetchListings };
}
