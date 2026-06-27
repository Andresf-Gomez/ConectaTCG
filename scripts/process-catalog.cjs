const fs = require('fs');
const path = require('path');

const INPUT = path.resolve('C:/Users/ANDRI/Documentos/Dev/PokemonTCG_BaseDatos/base_depurada.json');
const OUTPUT = path.resolve(__dirname, '..', 'public', 'catalog.json');

console.log('Leyendo archivo fuente...');
const raw = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));
const entries = Object.values(raw.cards);

console.log(`Procesando ${entries.length} cartas...`);

// Maps localized variant names (any language) to canonical English keys.
const VARIANT_MAP = {
  // English
  'holo': 'holo',
  'normal': 'normal',
  'reverse': 'reverse',
  'firstEdition': 'firstEdition',
  'wPromo': 'wPromo',
  'metal': 'metal',
  'Metal': 'metal',
  'lenticular': 'lenticular',
  // French
  'Holo': 'holo',
  'Normale': 'normal',
  'Reverse': 'reverse',
  'Métal': 'metal',
  'métal': 'metal',
  // German
  'Reverse Holo': 'reverse',
  'Metall': 'metal',
  'metall': 'metal',
  // Italian
  'Olografica': 'holo',
  'Metallo': 'metal',
  'metallo': 'metal',
  // Spanish
  'Holográfica': 'holo',
  'Reversa': 'reverse',
  'reversa': 'reverse',
  'Normal': 'normal',
  'Básico': 'normal',
  'básico': 'normal',
};

function normalizeVariantType(type) {
  if (type in VARIANT_MAP) return VARIANT_MAP[type];
  // Fallback: lowercase
  return type.toLowerCase();
}

const catalog = entries.map((card) => {
  const dataLangs = card.data ? Object.keys(card.data) : [];

  // image_url: prefer English, fall back to first available language
  let imageUrl = '';
  if (card.data?.en?.image) {
    imageUrl = card.data.en.image + '/high.png';
  } else if (dataLangs.length > 0) {
    const img = card.data[dataLangs[0]]?.image;
    if (img) imageUrl = img + '/high.png';
  }

  // year: top-level field in source data
  const year = card.year ?? null;

  // rarity: English first, then first available lang
  let rarity = '';
  if (card.data?.en?.rarity) {
    rarity = card.data.en.rarity;
  } else if (dataLangs.length > 0) {
    rarity = card.data[dataLangs[0]]?.rarity || '';
  }

  // variants: unique types from variants_detailed across ALL languages,
  // normalized to canonical camelCase form (English as reference).
  // English entries are collected first to give them priority in dedup.
  const seen = new Map(); // normalized_lower → canonical
  const orderedLangs = dataLangs.includes('en')
    ? ['en', ...dataLangs.filter((l) => l !== 'en')]
    : dataLangs;

  for (const lang of orderedLangs) {
    const detailed = card.data[lang]?.variants_detailed || [];
    for (const v of detailed) {
      if (!v.type) continue;
      const canonical = normalizeVariantType(v.type);
      const lower = canonical.toLowerCase();
      if (!seen.has(lower)) seen.set(lower, canonical);
    }
  }
  const variants = Array.from(seen.values());

  return {
    id: card.id,
    localId: card.localId || '',
    names: card.names || {},
    setNames: card.setNames || {},
    set_id: card.set?.id || '',
    year,
    image_url: imageUrl,
    languages: card.languages || [],
    rarity,
    variants,
  };
});

const json = JSON.stringify(catalog);
fs.writeFileSync(OUTPUT, json, 'utf-8');

const sizeMB = (Buffer.byteLength(json, 'utf-8') / (1024 * 1024)).toFixed(2);
console.log(`Cartas procesadas: ${catalog.length}`);
console.log(`Archivo generado: ${OUTPUT}`);
console.log(`Tamaño: ${sizeMB} MB`);

// Quick sanity stats
const withYear = catalog.filter((c) => c.year !== null).length;
const withVariants = catalog.filter((c) => c.variants.length > 0).length;
console.log(`Con año: ${withYear} / ${catalog.length}`);
console.log(`Con variantes: ${withVariants} / ${catalog.length}`);
