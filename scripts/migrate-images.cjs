// scripts/migrate-images.cjs
// Migra imágenes de cartas desde TCGDex hacia Supabase Storage (bucket 'card-images').
//
// Uso:
//   SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/migrate-images.cjs
//   (o define las vars en .env — el script las carga automáticamente)
//
// El script es REANUDABLE: al iniciar lista el bucket y salta las imágenes
// ya subidas, por lo que puede interrumpirse y retomarse sin duplicar trabajo.
//
// Al terminar escribe failed-images.json en la raíz del proyecto con las
// imágenes que fallaron (404, timeout, error de red, etc.) para reintentarlas.

'use strict';

const fs   = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ─── Env ──────────────────────────────────────────────────────────────────────

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

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: Se requieren SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.');
  console.error('       Define SUPABASE_SERVICE_ROLE_KEY en .env o como variable de entorno.');
  process.exit(1);
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BUCKET      = 'card-images';
const CONCURRENCY = 8;     // imágenes descargando/subiendo en paralelo
const TIMEOUT_MS  = 30_000; // timeout por descarga individual
const DB_PG_SIZE  = 1_000;  // filas por página al leer catalog_cards
const ST_PG_SIZE  = 1_000;  // archivos por página al listar el bucket
const PROGRESS_N  = 100;    // imprimir progreso cada N imágenes
const FAILED_PATH = path.resolve(__dirname, '..', 'failed-images.json');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Build existing-files set ─────────────────────────────────────────────────

// Lista todos los archivos del bucket y devuelve un Set con sus nombres.
// Esto permite saltar las imágenes ya subidas en O(1) sin llamadas extra.
async function buildExistingSet() {
  const existing = new Set();
  let offset = 0;
  process.stdout.write('Listando archivos existentes en el bucket…\n');

  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list('', { limit: ST_PG_SIZE, offset });

    if (error) throw new Error(`Storage list [offset=${offset}]: ${error.message}`);
    if (!data || data.length === 0) break;

    for (const file of data) existing.add(file.name);
    offset += data.length;
    if (data.length < ST_PG_SIZE) break;
  }

  console.log(`  → ${existing.size} archivos ya en el bucket.\n`);
  return existing;
}

// ─── Fetch all cards ──────────────────────────────────────────────────────────

async function fetchAllCards() {
  const cards = [];
  let offset  = 0;
  process.stdout.write('Leyendo cartas desde catalog_cards…\n');

  while (true) {
    const { data, error } = await supabase
      .from('catalog_cards')
      .select('id, tcgdex_id, image_url')
      .not('image_url', 'is', null)
      .neq('image_url', '')
      .order('id')
      .range(offset, offset + DB_PG_SIZE - 1);

    if (error) throw new Error(`DB fetch [offset=${offset}]: ${error.message}`);
    if (!data || data.length === 0) break;

    cards.push(...data);
    offset += data.length;
    process.stdout.write(`  → ${cards.length} cartas leídas…\r`);
    if (data.length < DB_PG_SIZE) break;
  }

  console.log(`  → ${cards.length} cartas con imagen encontradas.\n`);
  return cards;
}

// ─── Process one card ─────────────────────────────────────────────────────────

async function processCard(card, existingSet, counters) {
  // tcgdex_id tal cual como nombre — soporta puntos (me02.5-001.png)
  const filename = `${card.tcgdex_id}.png`;

  // Ya existe en el bucket → saltar
  if (existingSet.has(filename)) {
    counters.skipped++;
    tick(counters);
    return;
  }

  // Descargar imagen desde TCGDex
  let buffer;
  try {
    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(card.image_url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    buffer = Buffer.from(await res.arrayBuffer());
  } catch (err) {
    const reason = err.name === 'AbortError' ? `Timeout (>${TIMEOUT_MS / 1000}s)` : err.message;
    counters.failed.push({ tcgdex_id: card.tcgdex_id, image_url: card.image_url, reason });
    tick(counters);
    return;
  }

  // Subir a Supabase Storage
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, { contentType: 'image/png', upsert: false });

  if (uploadErr) {
    // Si ya existe (carrera entre dos procesos paralelos) lo contamos como saltado
    if (uploadErr.message?.toLowerCase().includes('already exists')) {
      counters.skipped++;
      existingSet.add(filename);
    } else {
      counters.failed.push({
        tcgdex_id: card.tcgdex_id,
        image_url: card.image_url,
        reason: uploadErr.message,
      });
    }
  } else {
    counters.uploaded++;
    existingSet.add(filename);
  }

  tick(counters);
}

function tick(counters) {
  counters.processed++;
  if (counters.processed % PROGRESS_N === 0 || counters.processed === counters.total) {
    process.stdout.write(
      `Procesadas ${counters.processed}/${counters.total} · ` +
      `subidas: ${counters.uploaded} · ` +
      `saltadas: ${counters.skipped} · ` +
      `fallidas: ${counters.failed.length}\n`,
    );
  }
}

// ─── Concurrency pool (semáforo) ─────────────────────────────────────────────

// Procesa `items` llamando `fn(item)` con máximo `limit` ejecuciones en paralelo.
// Libera el slot tan pronto termina cada tarea (no espera a que el lote completo acabe).
function runPool(items, limit, fn) {
  if (items.length === 0) return Promise.resolve();

  return new Promise((resolve) => {
    let i      = 0;
    let active = 0;

    function next() {
      while (active < limit && i < items.length) {
        active++;
        fn(items[i++]).finally(() => {
          active--;
          if (i >= items.length && active === 0) resolve();
          else next();
        });
      }
    }

    next();
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== migrate-images.cjs ===');
  console.log(`Bucket destino : ${BUCKET}`);
  console.log(`Concurrencia   : ${CONCURRENCY}`);
  console.log(`Timeout/imagen : ${TIMEOUT_MS / 1000}s\n`);

  const existingSet = await buildExistingSet();
  const cards       = await fetchAllCards();

  const counters = {
    processed: 0,
    uploaded:  0,
    skipped:   0,
    failed:    [],
    total:     cards.length,
  };

  if (cards.length === 0) {
    console.log('No hay cartas con imagen para migrar.');
    return;
  }

  console.log(`Iniciando migración (${cards.length} cartas, concurrencia ${CONCURRENCY})…\n`);
  const t0 = Date.now();

  await runPool(cards, CONCURRENCY, (card) => processCard(card, existingSet, counters));

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  console.log('\n=== Migración completada ===');
  console.log(`Tiempo total : ${elapsed}s`);
  console.log(`Subidas      : ${counters.uploaded}`);
  console.log(`Saltadas     : ${counters.skipped}`);
  console.log(`Fallidas     : ${counters.failed.length}`);

  if (counters.failed.length > 0) {
    fs.writeFileSync(FAILED_PATH, JSON.stringify(counters.failed, null, 2), 'utf-8');
    console.log(`\nImágenes fallidas escritas en: ${FAILED_PATH}`);
    console.log('Para reintentarlas, filtra las fallidas y vuelve a correr el script.');
    console.log('El script es reanudable: salta automáticamente las ya subidas.');
    process.exit(1); // exit 1 para señalizar que hubo errores parciales
  } else {
    console.log('\nTodas las imágenes migradas sin errores.');
  }
}

main().catch((err) => {
  console.error('\nERROR FATAL:', err.message);
  process.exit(1);
});
