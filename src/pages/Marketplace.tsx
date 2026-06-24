import { useMemo, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Layout } from '../components/Layout';
import { SearchBar } from '../components/SearchBar';
import { CardTile } from '../components/CardTile';
import { cards, type Card } from '../data/cards';
import { money } from '../utils/money';

export function Marketplace({
  setPage,
  setSelectedCard,
  searchQuery,
  setSearchQuery,
}: {
  setPage: (page: string) => void;
  setSelectedCard: (card: Card) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}) {
  const query = searchQuery;
  const setQuery = setSearchQuery;

  const cities = [
    'Todas',
    'Bogotá',
    'Medellín',
    'Cali',
    'Barranquilla',
    'Bucaramanga',
    'Cartagena',
    'Pereira',
  ];
  const expansions = ['Todas', ...Array.from(new Set(cards.map((c) => c.set)))];
  const languages = ['Todos', ...Array.from(new Set(cards.map((c) => c.language || 'Español')))];
  const lowestPrice = Math.min(
    ...cards.flatMap((c) => c.offers.map((o) => o.price))
  );
  const highestPrice = Math.max(
    ...cards.flatMap((c) => c.offers.map((o) => o.price))
  );

  const [segmentFilter, setSegmentFilter] = useState('Todos');
  const [cityFilter, setCityFilter] = useState('Todas');
  const [expansionFilter, setExpansionFilter] = useState('Todas');
  const [languageFilter, setLanguageFilter] = useState('Todos');
  const [minPrice, setMinPrice] = useState(lowestPrice);
  const [maxPrice, setMaxPrice] = useState(highestPrice);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return cards.filter((c) => {
      const bestPrice = Math.min(...c.offers.map((o) => o.price));
      const matchesSearch =
        !q ||
        `${c.name} ${c.set} ${c.type} ${c.number} ${c.rarity} ${c.language}`
          .toLowerCase()
          .includes(q);
      const matchesCity =
        cityFilter === 'Todas' || c.offers.some((o) => o.city === cityFilter);
      const matchesExpansion =
        expansionFilter === 'Todas' || c.set === expansionFilter;
      const matchesLanguage =
        languageFilter === 'Todos' || (c.language || 'Español') === languageFilter;
      const effectiveMinPrice = Math.min(
        minPrice || 0,
        maxPrice || highestPrice
      );
      const effectiveMaxPrice = Math.max(
        maxPrice || highestPrice,
        effectiveMinPrice
      );
      const matchesPrice =
        bestPrice >= effectiveMinPrice && bestPrice <= effectiveMaxPrice;

      return (
        matchesSearch &&
        matchesCity &&
        matchesExpansion &&
        matchesLanguage &&
        matchesPrice
      );
    });
  }, [query, cityFilter, expansionFilter, languageFilter, minPrice, maxPrice]);

  const resetFilters = () => {
    setSegmentFilter('Todos');
    setCityFilter('Todas');
    setExpansionFilter('Todas');
    setLanguageFilter('Todos');
    setMinPrice(lowestPrice);
    setMaxPrice(highestPrice);
    setQuery('');
  };

  const smallButtonClass = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-[11px] font-bold border transition whitespace-nowrap ${
      active
        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
        : 'bg-white text-slate-700 border-slate-200 hover:bg-yellow-50 hover:border-yellow-300'
    }`;

  const singles = filtered.filter((card) => card.type === 'Carta single');
  const sealed = filtered.filter((card) => card.type === 'Producto sellado');
  const visibleFiltered = segmentFilter === 'Carta single' ? singles : segmentFilter === 'Producto sellado' ? sealed : filtered;
  const visibleGroups = [
    {
      type: 'Carta single',
      title: 'Cartas singles',
      description: 'Cartas individuales disponibles por varios vendedores, con estado, idioma y reputación.',
      items: singles,
      icon: '🃏',
      accent: 'blue',
    },
    {
      type: 'Producto sellado',
      title: 'Producto sellado',
      description: 'ETB, Booster Box, Booster Bundle y colecciones selladas para colección, apertura o reventa.',
      items: sealed,
      icon: '📦',
      accent: 'yellow',
    },
  ].filter((group) => segmentFilter === 'Todos' || segmentFilter === group.type);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-950">Marketplace Conecta TCG</h2>
          <p className="text-slate-600">
            Compara cartas, productos sellados, vendedores, precios, idioma y reputación.
          </p>
        </div>
        <div className="md:w-[460px]">
          <SearchBar query={query} setQuery={setQuery} onSearch={() => {}} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['Todos', 'Carta single', 'Producto sellado'].map((type) => (
          <button
            key={type}
            onClick={() => setSegmentFilter(type)}
            className={`px-5 py-2.5 rounded-2xl text-sm font-black border transition ${
              segmentFilter === type
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden mb-4 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-black text-slate-700 flex items-center gap-2 shadow-sm"
      >
        {showFilters ? <X size={18} /> : <SlidersHorizontal size={18} />}
        {showFilters ? 'Cerrar filtros' : 'Filtros'}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-5 items-start">
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block sticky top-24 bg-white border border-slate-200 rounded-3xl p-5 h-fit shadow-sm`}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-black text-slate-900">Filtros</h3>
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-blue-700 hover:text-blue-900"
            >
              Limpiar
            </button>
          </div>

          <div className="py-3 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-700 mb-3">Idioma</p>
            <div className="flex flex-wrap gap-2">
              {languages.map((language) => (
                <button
                  key={language}
                  onClick={() => setLanguageFilter(language)}
                  className={smallButtonClass(languageFilter === language)}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>

          <div className="py-3 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-700 mb-3">Ciudad</p>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setCityFilter(city)}
                  className={smallButtonClass(cityFilter === city)}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="py-3 border-b border-slate-100">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-sm font-bold text-slate-700">
                Rango de precio
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-500">
                  Mínimo
                </label>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold outline-none focus:border-blue-500"
                  placeholder="Ej: 50000"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500">
                  Máximo
                </label>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(Number(e.target.value) || highestPrice)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold outline-none focus:border-blue-500"
                  placeholder="Ej: 300000"
                />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Rango disponible: {money(lowestPrice)} - {money(highestPrice)}
            </p>
          </div>

          <div className="py-3 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-700 mb-3">Expansión</p>
            <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto pr-1">
              {expansions.map((expansion) => (
                <button
                  key={expansion}
                  onClick={() => setExpansionFilter(expansion)}
                  className={smallButtonClass(expansionFilter === expansion)}
                >
                  {expansion}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 text-xs text-slate-500">
            Mostrando <b className="text-slate-900">{visibleFiltered.length}</b>{' '}
            producto(s)
          </div>
        </aside>

        <section className="space-y-8">
          {visibleFiltered.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center">
              <p className="text-xl font-black text-slate-900">
                No encontramos productos con esos filtros
              </p>
              <p className="text-slate-500 mt-2">
                Limpia los filtros o amplía el rango de precio para ver más
                opciones.
              </p>
            </div>
          ) : (
            visibleGroups.map((group) =>
              group.items.length > 0 ? (
                <div key={group.title} className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className={`mb-4 rounded-3xl p-5 ${group.accent === 'blue' ? 'bg-blue-50 border border-blue-100' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${group.accent === 'blue' ? 'bg-blue-600' : 'bg-yellow-400'}`}>
                          {group.icon}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-950">{group.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">{group.description}</p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-black ${group.accent === 'blue' ? 'bg-blue-600 text-white' : 'bg-yellow-400 text-slate-950'}`}>
                        {group.items.length} producto(s)
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {group.items.map((card) => (
                      <CardTile
                        key={card.id}
                        card={card}
                        onClick={() => {
                          setSelectedCard(card);
                          setPage('detail');
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : null
            )
          )}
        </section>
      </div>
    </Layout>
  );
}
