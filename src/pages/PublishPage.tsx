import { useState } from 'react';
import { Search, LayoutGrid, ArrowLeft, Upload, Loader2, Layers } from 'lucide-react';
import { Layout } from '../components/Layout';
import { CardImage } from '../components/ImagePlaceholder';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  useCatalogSearch,
  useCatalogCascade,
  LANG_LABELS,
  getDisplayName,
  type CatalogCard,
} from '../hooks/useCatalog';

const CONDITIONS = ['Near Mint', 'Excellent', 'Light Played', 'Played'];
const CITIES = [
  'Bogotá',
  'Medellín',
  'Cali',
  'Barranquilla',
  'Bucaramanga',
  'Cartagena',
  'Pereira',
  'Manizales',
  'Santa Marta',
  'Ibagué',
];

export function PublishPage({ setPage }: { setPage: (page: string) => void }) {
  const { user } = useAuth();
  const catalogSearch = useCatalogSearch();
  const cascade = useCatalogCascade();

  const [mode, setMode] = useState<'search' | 'explore' | null>(null);
  const [selectedCard, setSelectedCard] = useState<CatalogCard | null>(null);

  // Search mode
  const [searchTerm, setSearchTerm] = useState('');

  // Explore mode: 5 steps — Idioma → Año → Expansión → Carta → Variante
  const [exploreStep, setExploreStep] = useState(1);
  const [exploreLang, setExploreLang] = useState('');
  const [exploreYear, setExploreYear] = useState<number | null>(null);
  const [exploreSet, setExploreSet] = useState('');
  const [exploreVariant, setExploreVariant] = useState('');

  // Publish form
  const [price, setPrice] = useState(0);
  const [condition, setCondition] = useState('Near Mint');
  const [city, setCity] = useState('Bogotá');
  const [description, setDescription] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');

  // Aliases to keep JSX readable
  const suggestions = catalogSearch.results;
  const availableLanguages = cascade.languages.sort((a, b) =>
    (LANG_LABELS[a] || a).localeCompare(LANG_LABELS[b] || b),
  );
  const availableYears = cascade.years;
  const availableSets = cascade.sets;
  const setCards = cascade.cards;

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
    catalogSearch.search(e.target.value);
  }

  function selectLang(lang: string) {
    setExploreLang(lang);
    setExploreYear(null);
    setExploreSet('');
    cascade.getYears(lang);
    setExploreStep(2);
  }

  function selectYear(year: number) {
    setExploreYear(year);
    setExploreSet('');
    cascade.getSets(year);
    setExploreStep(3);
  }

  function selectSet(setCode: string) {
    setExploreSet(setCode);
    cascade.getCards(setCode, exploreLang);
    setExploreStep(4);
  }

  function selectCard(card: CatalogCard) {
    setSelectedCard(card);
    setExploreStep(5);
  }

  function resetSelection() {
    setSelectedCard(null);
    setExploreVariant('');
    setSearchTerm('');
    setExploreStep(4);
  }

  function resetMode() {
    setMode(null);
    setSelectedCard(null);
    setSearchTerm('');
    setExploreStep(1);
    setExploreLang('');
    setExploreYear(null);
    setExploreSet('');
    setExploreVariant('');
  }

  function goBack() {
    if (exploreStep === 5) {
      setSelectedCard(null);
      setExploreVariant('');
      setExploreStep(4);
    } else if (exploreStep === 4) {
      setExploreSet('');
      setExploreStep(3);
    } else if (exploreStep === 3) {
      setExploreYear(null);
      setExploreStep(2);
    } else if (exploreStep === 2) {
      setExploreLang('');
      setExploreStep(1);
    } else {
      resetMode();
    }
  }

  async function handlePublish() {
    if (!selectedCard) return;
    setPublishError('');
    setPublishing(true);
    const { error } = await supabase.from('cards').insert({
      seller_id: user?.id,
      name: getDisplayName(selectedCard),
      set_name: selectedCard.setNames[exploreLang] || selectedCard.set_id,
      number: selectedCard.id,
      rarity: selectedCard.rarity,
      type: 'Carta single',
      language: exploreLang || selectedCard.languages[0] || 'en',
      image: selectedCard.image_url,
      condition,
      price,
      city,
      description,
      seller_name: user?.email ?? 'Vendedor',
      variant: exploreVariant,
      year: selectedCard.year,
    });
    setPublishing(false);
    if (error) {
      setPublishError(error.message);
    } else {
      setPage('publishSuccess');
    }
  }

  // --- Card + variant selected → publish form ---
  if (selectedCard && exploreVariant) {
    return (
      <Layout>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-black text-slate-950">
              Publicar producto
            </h2>
            <p className="text-slate-600">
              Completa los detalles de tu publicación.
            </p>
          </div>
        </div>
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-5">
              Detalles de venta
            </h3>
            <div className="grid gap-5">
              <div>
                <label className="text-sm font-bold text-slate-700">
                  Precio (COP)
                </label>
                <input
                  type="number"
                  value={price || ''}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="Ej: 150000"
                  className="mt-2 w-full border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">
                  Condición
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCondition(c)}
                      className={`px-4 py-2.5 rounded-2xl text-sm font-bold border transition ${
                        condition === c
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">Ciudad</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-2 w-full border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
                >
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 w-full border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500 min-h-[100px]"
                  placeholder="Estado de la carta, detalles de envío, condiciones..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-black text-slate-950 text-xl mb-4">
                Carta seleccionada
              </h3>
              <div className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-2xl p-4 flex justify-center min-h-[200px] items-center">
                <CardImage
                  src={selectedCard.image_url}
                  alt={getDisplayName(selectedCard)}
                  className="max-h-64 object-contain rounded-xl"
                />
              </div>
              <div className="mt-4">
                <p className="font-black text-lg text-slate-900">
                  {getDisplayName(selectedCard)}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedCard.setNames[exploreLang] || selectedCard.set_id}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {LANG_LABELS[exploreLang] || exploreLang} · {exploreVariant}
                </p>
              </div>
              <button
                onClick={resetSelection}
                className="mt-4 w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cambiar variante
              </button>
            </div>

            {publishError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">
                {publishError}
              </p>
            )}
            <button
              onClick={handlePublish}
              disabled={publishing || price <= 0}
              className="w-full px-5 py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 font-black text-slate-900 flex items-center justify-center gap-2 disabled:opacity-50 transition"
            >
              <Upload size={20} />
              {publishing ? 'Publicando...' : 'Publicar producto'}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // --- Mode selector ---
  if (!mode) {
    return (
      <Layout>
        <div className="mb-6">
          <h2 className="text-3xl font-black text-slate-950">
            Publicar producto
          </h2>
          <p className="text-slate-600 mt-1">
            Elige cómo quieres encontrar tu carta.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl">
          <button
            onClick={() => setMode('search')}
            className="group bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition text-left"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Search size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-black text-slate-950">Buscar carta</h3>
            <p className="text-sm text-slate-500 mt-2">
              Escribe el nombre y encuentra tu carta al instante. Busca en todos
              los idiomas.
            </p>
          </button>
          <button
            onClick={() => setMode('explore')}
            className="group bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition text-left"
          >
            <div className="w-14 h-14 rounded-2xl bg-yellow-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <LayoutGrid size={28} className="text-slate-900" />
            </div>
            <h3 className="text-xl font-black text-slate-950">
              Explorar catálogo
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Navega paso a paso: idioma, año, set y carta. Ideal si no recuerdas
              el nombre exacto.
            </p>
          </button>
          <button
            onClick={() => setPage('bulkPublish')}
            className="group bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition text-left"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Layers size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-black text-slate-950">
              Publicación masiva
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Agrega varias cartas a la vez en una tabla y publícalas con un
              solo clic.
            </p>
          </button>
        </div>
      </Layout>
    );
  }

  // --- Mode A: Search ---
  if (mode === 'search') {
    return (
      <Layout>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={resetMode}
            className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-950">Buscar carta</h2>
            <p className="text-slate-600">
              Escribe al menos 2 caracteres para ver sugerencias.
            </p>
          </div>
        </div>

        <div className="max-w-2xl">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Ej: Charizard, Pikachu VMAX, リザードン..."
              className="w-full border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-blue-500 text-lg"
              autoFocus
            />
          </div>

          {suggestions.length > 0 && (
            <div className="mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
              {suggestions.map((card) => (
                <button
                  key={card.id}
                  onClick={() => {
                    setSelectedCard(card);
                    setExploreStep(5);
                  }}
                  className="w-full flex items-center gap-4 p-4 hover:bg-blue-50 transition text-left border-b border-slate-100 last:border-0"
                >
                  <div className="w-12 h-16 rounded-lg bg-slate-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <CardImage
                      src={card.image_url}
                      alt={getDisplayName(card)}
                      className="w-full h-full object-contain"
                      placeholderSize="sm"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 truncate">
                      {getDisplayName(card)}
                    </p>
                    <p className="text-sm text-slate-500">
                      #{card.localId} · {card.set_id}
                    </p>
                    <p className="text-xs text-slate-400">
                      {card.languages
                        .map((l) => LANG_LABELS[l] || l)
                        .join(', ')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchTerm.length >= 2 && !catalogSearch.loading && suggestions.length === 0 && (
            <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-6 text-center">
              <p className="font-black text-slate-900">
                No se encontraron cartas
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Intenta con otro nombre o prueba el modo "Explorar catálogo".
              </p>
            </div>
          )}
        </div>

        {/* Variant step reached from search */}
        {selectedCard && !exploreVariant && (
          <div className="mt-6 max-w-2xl">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-20 rounded-xl bg-slate-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <CardImage
                    src={selectedCard.image_url}
                    alt={getDisplayName(selectedCard)}
                    className="w-full h-full object-contain"
                    placeholderSize="sm"
                  />
                </div>
                <div>
                  <p className="font-black text-slate-900">{getDisplayName(selectedCard)}</p>
                  <p className="text-sm text-slate-500">{selectedCard.set_id} · {selectedCard.year}</p>
                </div>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-3">
                Selecciona la variante
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedCard.variants.length > 0 ? (
                  selectedCard.variants.map((v) => (
                    <button
                      key={v}
                      onClick={() => setExploreVariant(v)}
                      className="px-5 py-3 rounded-2xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-300 transition"
                    >
                      {v}
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() => setExploreVariant('standard')}
                    className="px-5 py-3 rounded-2xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-300 transition"
                  >
                    standard
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Layout>
    );
  }

  // --- Mode B: Explore (5 steps) ---
  const stepLabels = ['Idioma', 'Año', 'Expansión', 'Carta', 'Variante'];

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={goBack}
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-black text-slate-950">
            Explorar catálogo
          </h2>
          <p className="text-slate-600">
            Paso {exploreStep} de {stepLabels.length} — {stepLabels[exploreStep - 1]}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {stepLabels.map((label, i) => (
          <div
            key={label}
            className={`flex-1 h-2 rounded-full ${
              i < exploreStep ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Idioma */}
      {exploreStep === 1 && (
        <div className="max-w-3xl">
          <h3 className="text-xl font-black text-slate-900 mb-4">
            Selecciona el idioma de la carta
          </h3>
          <div className="flex flex-wrap gap-3">
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => selectLang(lang)}
                className="px-6 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-300 transition shadow-sm"
              >
                {LANG_LABELS[lang] || lang}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Año */}
      {exploreStep === 2 && (
        <div className="max-w-3xl">
          <h3 className="text-xl font-black text-slate-900 mb-1">
            Selecciona el año de lanzamiento
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            {availableYears.length} años disponibles en{' '}
            {LANG_LABELS[exploreLang] || exploreLang}
          </p>
          {cascade.loading ? (
            <Loader2 className="animate-spin text-blue-600" size={28} />
          ) : (
            <div className="flex flex-wrap gap-3">
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => selectYear(year)}
                  className="px-6 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-300 transition shadow-sm"
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Expansión */}
      {exploreStep === 3 && (
        <div className="max-w-4xl">
          <h3 className="text-xl font-black text-slate-900 mb-1">
            Selecciona la expansión
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            {availableSets.length} expansiones de {exploreYear} en{' '}
            {LANG_LABELS[exploreLang] || exploreLang}
          </p>
          {cascade.loading ? (
            <Loader2 className="animate-spin text-blue-600" size={28} />
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableSets.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectSet(s.id)}
                  className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-300 transition"
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Carta */}
      {exploreStep === 4 && (
        <div>
          <h3 className="text-xl font-black text-slate-900 mb-1">
            Selecciona la carta
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            {setCards.length} cartas en{' '}
            {availableSets.find((s) => s.id === exploreSet)?.name || exploreSet}{' '}
            · {LANG_LABELS[exploreLang] || exploreLang}
          </p>
          {cascade.loading && (
            <Loader2 className="animate-spin text-blue-600 mb-4" size={28} />
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {setCards.map((card) => (
              <button
                key={card.id}
                onClick={() => selectCard(card)}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
              >
                <div className="bg-gradient-to-br from-blue-50 to-yellow-50 p-3 flex justify-center items-center h-40">
                  <CardImage
                    src={card.image_url}
                    alt={getDisplayName(card)}
                    className="max-h-full object-contain group-hover:scale-105 transition"
                    placeholderSize="sm"
                  />
                </div>
                <div className="p-3">
                  <p className="font-bold text-sm text-slate-900 truncate">
                    <span className="text-slate-400 font-normal">#{card.localId}</span>{' '}
                    {getDisplayName(card)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Variante */}
      {exploreStep === 5 && selectedCard && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-20 rounded-xl bg-slate-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                <CardImage
                  src={selectedCard.image_url}
                  alt={getDisplayName(selectedCard)}
                  className="w-full h-full object-contain"
                  placeholderSize="sm"
                />
              </div>
              <div>
                <p className="font-black text-slate-900">{getDisplayName(selectedCard)}</p>
                <p className="text-sm text-slate-500">
                  {availableSets.find((s) => s.id === exploreSet)?.name || exploreSet}
                </p>
                <p className="text-xs text-slate-400">
                  {LANG_LABELS[exploreLang] || exploreLang} · {exploreYear}
                </p>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-4">
              Selecciona la variante
            </h3>
            <div className="flex flex-wrap gap-3">
              {selectedCard.variants.length > 0 ? (
                selectedCard.variants.map((v) => (
                  <button
                    key={v}
                    onClick={() => setExploreVariant(v)}
                    className="px-6 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-300 transition shadow-sm"
                  >
                    {v}
                  </button>
                ))
              ) : (
                <button
                  onClick={() => setExploreVariant('standard')}
                  className="px-6 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-300 transition shadow-sm"
                >
                  standard
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
