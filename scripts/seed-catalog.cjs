// scripts/seed-catalog.cjs
// Populates normalized catalog tables from base_depurada.json (raw source)
//
// Actual Supabase schema this script targets:
//   games:         id(bigint auto), slug(text unique), name(text), active(bool)
//   sets:          id(bigint auto), game_id(bigint), set_code(text), names(jsonb), year(int), serie(text), logo_url(text)
//   rarities:      id(bigint auto), game_id(bigint), code(text), names(jsonb)   -- unique(game_id, code)
//   variants:      id(bigint auto), game_id(bigint), code(text), names(jsonb)   -- unique(game_id, code)
//   catalog_cards: id(bigint auto), set_id(bigint FK), rarity_id(bigint FK),
//                  tcgdex_id(text unique), names(jsonb), number(text),
//                  image_url(text), languages(jsonb)
//
// Usage:
//   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed-catalog.cjs

'use strict';

const fs   = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// --- Load .env manually ---
function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnv();

// --- Config ---
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY    ||
  process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: Missing SUPABASE_URL / SUPABASE_KEY.');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('WARNING: Using anon key — upserts may fail if RLS is enabled.');
}

const supabase    = createClient(SUPABASE_URL, SUPABASE_KEY);
const SOURCE_PATH = 'C:/Users/ANDRI/Documentos/Dev/PokemonTCG_BaseDatos/base_depurada.json';
const BATCH_SIZE  = 500;
const GAME_SLUG   = 'pokemon';
const GAME_NAME   = 'Pokémon TCG';

// --- Parse raw source (same logic as process-catalog.cjs) ---
const KNOWN_VARIANTS    = ['holo', 'normal', 'reverse', 'firstEdition', 'wPromo'];
const VARIANT_LOWER_MAP = Object.fromEntries(KNOWN_VARIANTS.map(v => [v.toLowerCase(), v]));

function normalizeVariantType(type) {
  const lower = type.toLowerCase().replace(/\s+/g, '');
  return VARIANT_LOWER_MAP[lower] || lower;
}

function parseSource(raw) {
  return Object.values(raw.cards).map(card => {
    const dataLangs = card.data ? Object.keys(card.data) : [];

    let image_url = '';
    if (card.data?.en?.image) {
      image_url = card.data.en.image + '/high.png';
    } else if (dataLangs.length > 0) {
      const img = card.data[dataLangs[0]]?.image;
      if (img) image_url = img + '/high.png';
    }

    let rarity = '';
    if (card.data?.en?.rarity)       rarity = card.data.en.rarity;
    else if (dataLangs.length > 0)   rarity = card.data[dataLangs[0]]?.rarity || '';

    const seen = new Map();
    const orderedLangs = dataLangs.includes('en')
      ? ['en', ...dataLangs.filter(l => l !== 'en')]
      : dataLangs;
    for (const lang of orderedLangs) {
      for (const v of card.data[lang]?.variants_detailed || []) {
        if (!v.type) continue;
        const canonical = normalizeVariantType(v.type);
        const lower = canonical.toLowerCase();
        if (!seen.has(lower)) seen.set(lower, canonical);
      }
    }

    return {
      id:        card.id,
      localId:   card.localId || '',
      names:     card.names    || {},
      setNames:  card.setNames || {},
      set_id:    card.set?.id  || '',
      year:      card.year ?? null,
      image_url,
      languages: card.languages || [],
      rarity,
      variants:  Array.from(seen.values()),
    };
  });
}

// --- Helpers ---
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function upsertBatch(table, rows, onConflict) {
  for (const batch of chunk(rows, BATCH_SIZE)) {
    const { error } = await supabase.from(table).upsert(batch, { onConflict });
    if (error) {
      console.error(`Error upserting ${table}:`, error.message);
      throw error;
    }
  }
}

// --- Steps ---

async function step1_game() {
  const { data, error } = await supabase
    .from('games')
    .upsert({ slug: GAME_SLUG, name: GAME_NAME, active: true }, { onConflict: 'slug' })
    .select('id')
    .single();
  if (error) throw error;
  console.log(`  game_id: ${data.id}`);
  return data.id;
}

async function step2_sets(catalog, gameId) {
  const seen = new Map();
  for (const card of catalog) {
    if (!card.set_id || seen.has(card.set_id)) continue;
    seen.set(card.set_id, {
      game_id:  gameId,
      set_code: card.set_id,
      names:    card.setNames || {},
      year:     card.year ?? null,
    });
  }
  const rows = Array.from(seen.values());
  console.log(`  ${rows.length} sets`);
  await upsertBatch('sets', rows, 'game_id,set_code');

  // Fetch back to build set_code → bigint id map
  const { data, error } = await supabase
    .from('sets')
    .select('id, set_code')
    .eq('game_id', gameId);
  if (error) throw error;
  return Object.fromEntries(data.map(r => [r.set_code, r.id]));
}

async function step3_rarities(catalog, gameId) {
  const uniqueNames = [...new Set(catalog.map(c => c.rarity).filter(Boolean))];
  console.log(`  ${uniqueNames.length} rarities`);
  const rows = uniqueNames.map(name => ({
    game_id: gameId,
    code:    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    names:   { en: name },
  }));
  await upsertBatch('rarities', rows, 'game_id,code');

  // Fetch back to build English rarity name → bigint id map
  const { data, error } = await supabase
    .from('rarities')
    .select('id, names')
    .eq('game_id', gameId);
  if (error) throw error;
  return Object.fromEntries(
    data.filter(r => r.names?.en).map(r => [r.names.en, r.id])
  );
}

async function step4_variants(catalog, gameId) {
  const uniqueVariants = [...new Set(catalog.flatMap(c => c.variants || []).filter(Boolean))];
  console.log(`  ${uniqueVariants.length} variants`);
  const rows = uniqueVariants.map(name => ({
    game_id: gameId,
    code:    name,
    names:   { en: name },
  }));
  await upsertBatch('variants', rows, 'game_id,code');
}

async function step5_catalogCards(catalog, setMap, rarityMap) {
  const rows = catalog
    .filter(card => card.set_id && setMap[card.set_id])
    .map(card => ({
      tcgdex_id: card.id,
      set_id:    setMap[card.set_id],
      rarity_id: card.rarity ? (rarityMap[card.rarity] ?? null) : null,
      number:    card.localId || '',
      names:     card.names   || {},
      image_url: card.image_url || null,
      languages: card.languages || [],
    }));

  const skipped = catalog.length - rows.length;
  if (skipped > 0) console.log(`  (${skipped} cards skipped — unknown set_id)`);

  let done = 0;
  for (const batch of chunk(rows, BATCH_SIZE)) {
    const { error } = await supabase
      .from('catalog_cards')
      .upsert(batch, { onConflict: 'tcgdex_id' });
    if (error) {
      console.error('Error upserting catalog_cards:', error.message);
      throw error;
    }
    done += batch.length;
    process.stdout.write(`  ${done}/${rows.length}\r`);
  }
  process.stdout.write('\n');
}

// --- Main ---
async function main() {
  console.log(`Reading ${SOURCE_PATH}...`);
  const raw     = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf-8'));
  const catalog = parseSource(raw);
  console.log(`  ${catalog.length} cards`);

  console.log('\n[1/5] Game...');
  const gameId = await step1_game();

  console.log('\n[2/5] Sets...');
  const setMap = await step2_sets(catalog, gameId);

  console.log('\n[3/5] Rarities...');
  const rarityMap = await step3_rarities(catalog, gameId);

  console.log('\n[4/5] Variants...');
  await step4_variants(catalog, gameId);

  console.log('\n[5/5] Catalog cards...');
  await step5_catalogCards(catalog, setMap, rarityMap);

  console.log('\nSeed complete.');
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  process.exit(1);
});
