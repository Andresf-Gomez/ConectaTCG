import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface SupabaseCard {
  id: string;
  created_at: string;
  seller_id: string;
  name: string;
  set_name: string;
  number: string;
  rarity: string;
  type: string;
  language: string;
  image: string;
  image_url: string;
  condition: string;
  price: number;
  city: string;
  description: string;
  seller_name: string;
}

export interface GroupedCard {
  id: number;
  name: string;
  set: string;
  number: string;
  rarity: string;
  type: string;
  language: string;
  image: string;
  marketAvg: number;
  low: number;
  high: number;
  description: string;
  offers: {
    id: number;
    seller: string;
    price: number;
    condition: string;
    rating: number;
    reviews: number;
    sales: number;
    city: string;
    shipping: string;
    verified: boolean;
  }[];
}

function groupCards(rows: SupabaseCard[]): GroupedCard[] {
  const groups = new Map<string, SupabaseCard[]>();

  for (const row of rows) {
    const key = `${row.name}::${row.set_name}`;
    const group = groups.get(key);
    if (group) {
      group.push(row);
    } else {
      groups.set(key, [row]);
    }
  }

  let idCounter = 100000;
  const result: GroupedCard[] = [];

  for (const [, items] of groups) {
    const first = items[0];
    const prices = items.map((i) => i.price);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

    result.push({
      id: idCounter++,
      name: first.name,
      set: first.set_name,
      number: first.number,
      rarity: first.rarity,
      type: first.type,
      language: first.language,
      image: first.image || first.image_url || '',
      marketAvg: avg,
      low: Math.min(...prices),
      high: Math.max(...prices),
      description: first.description || '',
      offers: items.map((item, i) => ({
        id: idCounter * 100 + i,
        seller: item.seller_name || 'Vendedor',
        price: item.price,
        condition: item.condition,
        rating: 0,
        reviews: 0,
        sales: 0,
        city: item.city || '',
        shipping: '',
        verified: false,
      })),
    });
  }

  return result;
}

export function useCards() {
  const [cards, setCards] = useState<GroupedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
      setCards([]);
    } else {
      setCards(groupCards(data as SupabaseCard[]));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return { cards, loading, error, refetch: fetchCards };
}
