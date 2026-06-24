const fs = require('fs');
const path = require('path');

const INPUT = path.resolve('D:/Users/ANDRI/Downloads/pokemon_tcg_tcgdex.json');
const OUTPUT = path.resolve(__dirname, '..', 'src', 'data', 'catalog.json');

console.log('Leyendo archivo fuente...');
const raw = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));
const entries = Object.values(raw.cards);

console.log(`Procesando ${entries.length} cartas...`);

const catalog = entries.map((card) => {
  const dataLangs = card.data ? Object.keys(card.data) : [];
  let imageUrl = '';

  if (card.data?.en?.image) {
    imageUrl = card.data.en.image + '/high.png';
  } else if (dataLangs.length > 0) {
    const firstLang = dataLangs[0];
    if (card.data[firstLang]?.image) {
      imageUrl = card.data[firstLang].image + '/high.png';
    }
  }

  return {
    id: card.id,
    names: card.names || {},
    set_id: card.set?.id || '',
    image_url: imageUrl,
    languages: card.languages || [],
  };
});

const json = JSON.stringify(catalog);
fs.writeFileSync(OUTPUT, json, 'utf-8');

const sizeMB = (Buffer.byteLength(json, 'utf-8') / (1024 * 1024)).toFixed(2);
console.log(`Cartas procesadas: ${catalog.length}`);
console.log(`Archivo generado: ${OUTPUT}`);
console.log(`Tamaño: ${sizeMB} MB`);
