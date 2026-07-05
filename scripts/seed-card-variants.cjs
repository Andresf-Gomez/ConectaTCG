// scripts/seed-card-variants.cjs
// Populates catalog_card_variants from the boolean variant flags in base_depurada.json.
//
// Source: data.<lang>.variants — object with 5 boolean keys:
//   { holo, normal, reverse, firstEdition, wPromo }
// A row is inserted for each (catalog_card_id, language, variant_id) where the flag is true.
//
// Limitation: metal and lenticular variants (18 cards total) come from variants_detailed
// and are NOT captured here. They remain in the `variants` table but will have no
// catalog_card_variants rows.
//
// Idempotent: ON CONFLICT DO NOTHING — safe to re-run at any time.
// Resumable: progress is printed per batch; partial runs leave valid rows.
//
// Usage:
//   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed-card-variants.cjs

'use strict';

const fs   = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// --- Load .env ---
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
const BATCH_SIZE  = 1000;
const GAME_SLUG   = 'pokemon';

// The 5 canonical boolean variant keys — order matches TCGDex schema.
const BOOL_VARIANTS = ['holo', 'normal', 'reverse', 'firstEdition', 'wPromo'];

// --- Helpers ---
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// --- Parse source ---
// Returns [{ tcgdex_id, langVariants: [{ lang, code }] }]
function parseSource(raw) {
  return Object.values(raw.cards).map(card => {
    const langVariants = [];
    for (const [lang, d] of Object.entries(card.data || {})) {
      const v = d.variants;
      if (!v || typeof v !== 'object' || Array.isArray(v)) continue;
      for (const code of BOOL_VARIANTS) {
        if (v[code] === true) langVariants.push({ lang, code });
      }
    }
    return { tcgdex_id: card.id, langVariants };
  });
}

// --- Main ---
async function main() {
  console.log(`Reading ${SOURCE_PATH}...`);
  const raw    = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf-8'));
  const parsed = parseSource(raw);
  console.log(`  ${parsed.length} cards parsed`);

  // [1] Resolve game_id
  console.log('\n[1/4] Resolving game_id...');
  const { data: gameData, error: gameErr } = await supabase
    .from('games')
    .select('id')
    .eq('slug', GAME_SLUG)
    .single();
  if (gameErr) throw gameErr;
  const gameId = gameData.id;
  console.log(`  game_id: ${gameId}`);

  // [2] Load variant code → id map
  console.log('\n[2/4] Loading variants...');
  const { data: variantRows, error: variantErr } = await supabase
    .from('variants')
    .select('id, code')
    .eq('game_id', gameId);
  if (variantErr) throw variantErr;
  const variantMap = Object.fromEntries(variantRows.map(r => [r.code, r.id]));
  const knownCodes = Object.keys(variantMap);
  console.log(`  ${knownCodes.length} variants loaded: ${knownCodes.join(', ')}`);

  // Warn if any canonical code is missing from the variants table
  const missingCodes = BOOL_VARIANTS.filter(c => !(c in variantMap));
  if (missingCodes.length > 0) {
    console.warn(`  WARNING: missing variant codes in DB: ${missingCodes.join(', ')}`);
    console.warn('  Run seed-catalog.cjs first to populate the variants table.');
  }

  // [3] Load tcgdex_id → catalog_cards.id map (batch to avoid huge IN clauses)
  console.log('\n[3/4] Loading catalog_cards id map...');
  const allTcgdexIds = parsed.map(c => c.tcgdex_id);
  const cardIdMap = {};
  let loaded = 0;
  for (const batch of chunk(allTcgdexIds, 500)) {
    const { data, error } = await supabase
      .from('catalog_cards')
      .select('id, tcgdex_id')
      .in('tcgdex_id', batch);
    if (error) throw error;
    for (const r of data) cardIdMap[r.tcgdex_id] = r.id;
    loaded += data.length;
    process.stdout.write(`  ${loaded}/${allTcgdexIds.length}\r`);
  }
  process.stdout.write('\n');
  console.log(`  ${Object.keys(cardIdMap).length} catalog_cards resolved`);

  // [4] Build and upsert bridge rows
  console.log('\n[4/4] Upserting catalog_card_variants...');
  const bridgeRows = [];
  let skippedCard    = 0;
  let skippedVariant = 0;
  let allFalse       = 0;

  for (const { tcgdex_id, langVariants } of parsed) {
    const catalogCardId = cardIdMap[tcgdex_id];
    if (!catalogCardId) { skippedCard++; continue; }
    if (langVariants.length === 0) { allFalse++; continue; }

    for (const { lang, code } of langVariants) {
      const variantId = variantMap[code];
      if (!variantId) { skippedVariant++; continue; }
      bridgeRows.push({ catalog_card_id: catalogCardId, language: lang, variant_id: variantId });
    }
  }

  console.log(`  ${bridgeRows.length} rows to upsert`);
  if (skippedCard    > 0) console.log(`  (${skippedCard} cards skipped — not found in catalog_cards)`);
  if (skippedVariant > 0) console.log(`  (${skippedVariant} (lang,code) pairs skipped — code not in variants table)`);
  if (allFalse       > 0) console.log(`  (${allFalse} cards skipped — all variant flags are false)`);

  let done = 0;
  for (const batch of chunk(bridgeRows, BATCH_SIZE)) {
    const { error } = await supabase
      .from('catalog_card_variants')
      .upsert(batch, { onConflict: 'catalog_card_id,language,variant_id', ignoreDuplicates: true });
    if (error) {
      console.error('Error upserting batch:', error.message);
      throw error;
    }
    done += batch.length;
    process.stdout.write(`  ${done}/${bridgeRows.length}\r`);
  }
  process.stdout.write('\n');

  console.log('\nDone.');
  console.log(`  Rows upserted: ${done}`);
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  process.exit(1);
});
