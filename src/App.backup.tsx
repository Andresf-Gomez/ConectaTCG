import React, { useMemo, useState } from 'react';
import {
  Search,
  Star,
  ShieldCheck,
  AlertTriangle,
  ShoppingCart,
  User,
  Bell,
  Package,
  CreditCard,
  PlusCircle,
  Clock,
  CheckCircle2,
  Truck,
  WalletCards,
  ArrowLeft,
  Eye,
  MessageCircle,
  BadgeCheck,
  Home,
  Store,
  History,
  Upload,
  X,
  Menu,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const cards = [
  {
    id: 1,
    name: 'Charizard ex',
    set: 'Obsidian Flames',
    number: '223/197',
    rarity: 'Special Illustration Rare',
    type: 'Carta single',
    language: 'Inglés',
    image: 'https://images.pokemontcg.io/sv3/223_hires.png',
    marketAvg: 385000,
    low: 345000,
    high: 430000,
    description:
      'Carta coleccionable de alta demanda. Ideal para coleccionistas y jugadores que buscan completar set.',
    offers: [
      {
        id: 101,
        seller: 'Golden Collector',
        price: 365000,
        condition: 'Near Mint',
        rating: 4.9,
        reviews: 128,
        sales: 246,
        city: 'Bogotá',
        shipping: 'Coordinadora / Servientrega',
        verified: true,
      },
      {
        id: 102,
        seller: 'TCG Capital',
        price: 378000,
        condition: 'Light Played',
        rating: 4.7,
        reviews: 89,
        sales: 174,
        city: 'Medellín',
        shipping: 'Interrapidísimo',
        verified: true,
      },
      {
        id: 103,
        seller: 'Poké Singles CO',
        price: 395000,
        condition: 'Near Mint',
        rating: 4.5,
        reviews: 54,
        sales: 91,
        city: 'Cali',
        shipping: 'Servientrega',
        verified: false,
      },
    ],
  },
  {
    id: 2,
    name: 'Pikachu VMAX',
    set: 'Vivid Voltage',
    number: '044/185',
    rarity: 'Ultra Rare',
    type: 'Carta single',
    language: 'Español',
    image: 'https://images.pokemontcg.io/swsh4/44_hires.png',
    marketAvg: 78000,
    low: 65000,
    high: 94000,
    description:
      'Carta popular entre coleccionistas por su personaje y jugabilidad.',
    offers: [
      {
        id: 201,
        seller: 'Rare Cards Bogotá',
        price: 72000,
        condition: 'Near Mint',
        rating: 4.8,
        reviews: 61,
        sales: 117,
        city: 'Bogotá',
        shipping: 'Mensajería local',
        verified: true,
      },
      {
        id: 202,
        seller: 'Arena TCG',
        price: 81000,
        condition: 'Excellent',
        rating: 4.6,
        reviews: 42,
        sales: 83,
        city: 'Barranquilla',
        shipping: 'Servientrega',
        verified: false,
      },
    ],
  },
  {
    id: 3,
    name: 'Booster Box Pokémon 151',
    set: 'Scarlet & Violet 151',
    number: 'Producto sellado',
    rarity: 'Sellado',
    type: 'Producto sellado',
    language: 'Inglés',
    image:
      'https://ae-pic-a1.aliexpress-media.com/kf/S4891cc40b02e45288e0b311a63454aecX.jpg',
    marketAvg: 720000,
    low: 690000,
    high: 780000,
    description: 'Producto sellado para coleccionistas, aperturas y reventa.',
    offers: [
      {
        id: 301,
        seller: 'Hobby Center Norte',
        price: 710000,
        condition: 'Sellado',
        rating: 4.9,
        reviews: 233,
        sales: 510,
        city: 'Bogotá',
        shipping: 'Servientrega',
        verified: true,
      },
      {
        id: 302,
        seller: 'PokéShop Colombia',
        price: 735000,
        condition: 'Sellado',
        rating: 4.7,
        reviews: 140,
        sales: 301,
        city: 'Bucaramanga',
        shipping: 'Coordinadora',
        verified: true,
      },
    ],
  },
  {
    id: 4,
    name: 'Mew ex',
    set: 'Pokémon 151',
    number: '205/165',
    rarity: 'Special Illustration Rare',
    type: 'Carta single',
    language: 'Español',
    image: 'https://images.pokemontcg.io/sv3pt5/205_hires.png',
    marketAvg: 220000,
    low: 190000,
    high: 260000,
    description: 'Carta coleccionable de alta demanda del set Pokémon 151.',
    offers: [
      {
        id: 401,
        seller: 'Golden Collector',
        price: 210000,
        condition: 'Near Mint',
        rating: 4.9,
        reviews: 128,
        sales: 246,
        city: 'Bogotá',
        shipping: 'Servientrega',
        verified: true,
      },
      {
        id: 402,
        seller: 'Poké Singles CO',
        price: 225000,
        condition: 'Excellent',
        rating: 4.6,
        reviews: 54,
        sales: 91,
        city: 'Cali',
        shipping: 'Coordinadora',
        verified: false,
      },
    ],
  },
  {
    id: 5,
    name: 'Blastoise ex',
    set: 'Pokémon 151',
    number: '200/165',
    rarity: 'Special Illustration Rare',
    type: 'Carta single',
    language: 'Español',
    image: 'https://images.pokemontcg.io/sv3pt5/200_hires.png',
    marketAvg: 190000,
    low: 160000,
    high: 230000,
    description:
      'Carta especial de Blastoise ex del set Pokémon 151, popular entre coleccionistas.',
    offers: [
      {
        id: 501,
        seller: 'Rare Cards Bogotá',
        price: 175000,
        condition: 'Near Mint',
        rating: 4.8,
        reviews: 61,
        sales: 117,
        city: 'Bogotá',
        shipping: 'Mensajería local',
        verified: true,
      },
      {
        id: 502,
        seller: 'Arena TCG',
        price: 198000,
        condition: 'Light Played',
        rating: 4.6,
        reviews: 42,
        sales: 83,
        city: 'Barranquilla',
        shipping: 'Servientrega',
        verified: false,
      },
    ],
  },
  {
    id: 6,
    name: 'Venusaur ex',
    set: 'Pokémon 151',
    number: '198/165',
    rarity: 'Special Illustration Rare',
    type: 'Carta single',
    language: 'Inglés',
    image: 'https://images.pokemontcg.io/sv3pt5/198_hires.png',
    marketAvg: 170000,
    low: 145000,
    high: 210000,
    description:
      'Carta especial de Venusaur ex, ideal para completar la línea inicial de Kanto.',
    offers: [
      {
        id: 601,
        seller: 'TCG Capital',
        price: 158000,
        condition: 'Near Mint',
        rating: 4.7,
        reviews: 89,
        sales: 174,
        city: 'Medellín',
        shipping: 'Interrapidísimo',
        verified: true,
      },
      {
        id: 602,
        seller: 'PokéShop Colombia',
        price: 180000,
        condition: 'Excellent',
        rating: 4.7,
        reviews: 140,
        sales: 301,
        city: 'Bucaramanga',
        shipping: 'Coordinadora',
        verified: true,
      },
    ],
  },
  {
    id: 7,
    name: 'Elite Trainer Box Pokémon 151',
    set: 'Scarlet & Violet 151',
    number: 'Producto sellado',
    rarity: 'Sellado',
    type: 'Producto sellado',
    language: 'Inglés',
    image:
      'https://www.pokemon.com/static-assets/content-assets/cms2/img/trading-card-game/series/incrementals/sv035-elite-trainer-box/sv035-elite-trainer-box-169-en.png',
    marketAvg: 330000,
    low: 300000,
    high: 380000,
    description:
      'Producto sellado del set Pokémon 151, atractivo para coleccionistas y aperturas.',
    offers: [
      {
        id: 701,
        seller: 'Hobby Center Norte',
        price: 315000,
        condition: 'Sellado',
        rating: 4.9,
        reviews: 233,
        sales: 510,
        city: 'Bogotá',
        shipping: 'Servientrega',
        verified: true,
      },
      {
        id: 702,
        seller: 'Golden Collector',
        price: 340000,
        condition: 'Sellado',
        rating: 4.9,
        reviews: 128,
        sales: 246,
        city: 'Bogotá',
        shipping: 'Coordinadora',
        verified: true,
      },
    ],
  },
  {
    id: 8,
    name: 'Umbreon VMAX',
    set: 'Evolving Skies',
    number: '215/203',
    rarity: 'Alternate Art Secret',
    type: 'Carta single',
    language: 'Inglés',
    image: 'https://images.pokemontcg.io/swsh7/215_hires.png',
    marketAvg: 4200000,
    low: 3900000,
    high: 4700000,
    description:
      'Carta de alta gama muy buscada por coleccionistas por su arte alternativo.',
    offers: [
      {
        id: 801,
        seller: 'Rare Cards Bogotá',
        price: 4050000,
        condition: 'Near Mint',
        rating: 4.8,
        reviews: 61,
        sales: 117,
        city: 'Bogotá',
        shipping: 'Envío asegurado',
        verified: true,
      },
      {
        id: 802,
        seller: 'TCG Capital',
        price: 4300000,
        condition: 'Near Mint',
        rating: 4.7,
        reviews: 89,
        sales: 174,
        city: 'Medellín',
        shipping: 'Envío asegurado',
        verified: true,
      },
    ],
  },
  {
    id: 9,
    name: 'Elite Trainer Box Destined Rivals',
    set: 'Scarlet & Violet - Destined Rivals',
    number: 'Producto sellado',
    rarity: 'Sellado',
    type: 'Producto sellado',
    language: 'Inglés',
    image: 'https://i.ebayimg.com/images/g/ysoAAeSwQ6Rptslz/s-l1600.webp',
    marketAvg: 320000,
    low: 290000,
    high: 370000,
    description:
      'Elite Trainer Box sellada, ideal para coleccionistas, aperturas y jugadores que buscan sobres del set.',
    offers: [
      {
        id: 901,
        seller: 'Hobby Center Norte',
        price: 305000,
        condition: 'Sellado',
        rating: 4.9,
        reviews: 233,
        sales: 510,
        city: 'Bogotá',
        shipping: 'Servientrega',
        verified: true,
      },
      {
        id: 902,
        seller: 'PokéShop Colombia',
        price: 330000,
        condition: 'Sellado',
        rating: 4.7,
        reviews: 140,
        sales: 301,
        city: 'Bucaramanga',
        shipping: 'Coordinadora',
        verified: true,
      },
    ],
  },
  {
    id: 10,
    name: 'Booster Bundle Pokémon 151',
    set: 'Scarlet & Violet 151',
    number: 'Producto sellado',
    rarity: 'Sellado',
    type: 'Producto sellado',
    language: 'Español',
    image:
      'https://http2.mlstatic.com/D_NQ_NP_608546-MLA99251965464_112025-O.webp',
    marketAvg: 210000,
    low: 185000,
    high: 250000,
    description:
      'Producto sellado con sobres del set Pokémon 151. Muy buscado por coleccionistas de Kanto.',
    offers: [
      {
        id: 1001,
        seller: 'Golden Collector',
        price: 198000,
        condition: 'Sellado',
        rating: 4.9,
        reviews: 128,
        sales: 246,
        city: 'Bogotá',
        shipping: 'Servientrega',
        verified: true,
      },
      {
        id: 1002,
        seller: 'Arena TCG',
        price: 220000,
        condition: 'Sellado',
        rating: 4.6,
        reviews: 42,
        sales: 83,
        city: 'Barranquilla',
        shipping: 'Interrapidísimo',
        verified: false,
      },
    ],
  },
  {
    id: 11,
    name: 'Ultra Premium Collection Pokémon 151',
    set: 'Scarlet & Violet 151',
    number: 'Producto sellado',
    rarity: 'Sellado',
    type: 'Producto sellado',
    language: 'Español',
    image:
      'https://http2.mlstatic.com/D_NQ_NP_723204-MCO72123942037_102023-O.webp',
    marketAvg: 780000,
    low: 720000,
    high: 860000,
    description:
      'Caja premium sellada del set Pokémon 151, atractiva para coleccionistas y aperturas especiales.',
    offers: [
      {
        id: 1101,
        seller: 'Rare Cards Bogotá',
        price: 750000,
        condition: 'Sellado',
        rating: 4.8,
        reviews: 61,
        sales: 117,
        city: 'Bogotá',
        shipping: 'Envío asegurado',
        verified: true,
      },
      {
        id: 1102,
        seller: 'PokéShop Colombia',
        price: 805000,
        condition: 'Sellado',
        rating: 4.7,
        reviews: 140,
        sales: 301,
        city: 'Bucaramanga',
        shipping: 'Coordinadora',
        verified: true,
      },
    ],
  },
  {
    id: 12,
    name: 'Elite Trainer Box Paldean Fates',
    set: 'Scarlet & Violet - Paldean Fates',
    number: 'Producto sellado',
    rarity: 'Sellado',
    type: 'Producto sellado',
    language: 'Inglés',
    image:
      'https://http2.mlstatic.com/D_Q_NP_760786-CBT93284699108_092025-O.webp',
    marketAvg: 295000,
    low: 265000,
    high: 340000,
    description:
      'Elite Trainer Box sellada de Paldean Fates, popular por sus cartas shiny y productos especiales.',
    offers: [
      {
        id: 1201,
        seller: 'TCG Capital',
        price: 280000,
        condition: 'Sellado',
        rating: 4.7,
        reviews: 89,
        sales: 174,
        city: 'Medellín',
        shipping: 'Interrapidísimo',
        verified: true,
      },
      {
        id: 1202,
        seller: 'Hobby Center Norte',
        price: 305000,
        condition: 'Sellado',
        rating: 4.9,
        reviews: 233,
        sales: 510,
        city: 'Bogotá',
        shipping: 'Servientrega',
        verified: true,
      },
    ],
  },
  {
    id: 13,
    name: 'Booster Box Obsidian Flames',
    set: 'Scarlet & Violet - Obsidian Flames',
    number: 'Producto sellado',
    rarity: 'Sellado',
    type: 'Producto sellado',
    language: 'Español',
    image:
      'https://http2.mlstatic.com/D_Q_NP_963536-MLU77948453889_072024-O.webp',
    marketAvg: 620000,
    low: 580000,
    high: 690000,
    description:
      'Booster Box sellada del set Obsidian Flames, atractiva para aperturas y búsqueda de Charizard.',
    offers: [
      {
        id: 1301,
        seller: 'Arena TCG',
        price: 600000,
        condition: 'Sellado',
        rating: 4.6,
        reviews: 42,
        sales: 83,
        city: 'Barranquilla',
        shipping: 'Servientrega',
        verified: false,
      },
      {
        id: 1302,
        seller: 'Golden Collector',
        price: 640000,
        condition: 'Sellado',
        rating: 4.9,
        reviews: 128,
        sales: 246,
        city: 'Bogotá',
        shipping: 'Coordinadora',
        verified: true,
      },
    ],
  },
];

const sellerReviews = {
  'Golden Collector': [
    'Excelente empaque, la carta llegó protegida y en el estado indicado.',
    'Muy cumplido con el envío. Recomendado.',
    'Buena comunicación durante todo el proceso.',
  ],
  'TCG Capital': [
    'Precios justos y envío rápido.',
    'La carta coincidía con las fotos.',
  ],
  'Poké Singles CO': ['Buen vendedor, aunque el envío tardó un poco.'],
  'Rare Cards Bogotá': ['Entrega rápida en Bogotá.', 'Muy buena atención.'],
  'Arena TCG': ['Producto bien empacado.'],
  'Hobby Center Norte': ['Producto sellado y original.', 'Muy buena tienda.'],
  'PokéShop Colombia': ['Todo correcto con la compra.'],
};

const money = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

function Header({ page, setPage, notifications }) {
  const nav = [
    { key: 'home', label: 'Inicio', icon: Home },
    { key: 'market', label: 'Marketplace', icon: Store },
    { key: 'publish', label: 'Publicar', icon: Upload },
    { key: 'history', label: 'Historial', icon: History },
    { key: 'commissions', label: 'Comisiones', icon: WalletCards },
    { key: 'contact', label: 'Contacto', icon: MessageCircle },
  ];
  return (
    <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <button
          onClick={() => setPage('home')}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-sm">
            <span className="font-black text-yellow-300 text-lg">CT</span>
          </div>
          <div className="text-left">
            <h1 className="font-bold text-slate-900 leading-tight">
              Conecta TCG 🃏
            </h1>
            <p className="text-xs text-slate-500 -mt-1">Marketplace especializado</p>
          </div>
        </button>
        <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition ${
                  page === item.key
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage('sellerSale')}
            className="relative p-3 rounded-2xl bg-yellow-100 text-slate-900 hover:bg-yellow-200 transition"
          >
            <Bell size={20} />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>
          <button
            onClick={() => setPage('login')}
            className="hidden sm:flex px-4 py-3 rounded-2xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition items-center gap-2"
          >
            <User size={18} /> Ingresar
          </button>
        </div>
      </div>
    </div>
  );
}

function Layout({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-7xl mx-auto px-4 py-6"
    >
      {children}
    </motion.main>
  );
}

function SearchBar({ query, setQuery, onSearch }) {
  return (
    <div className="bg-white rounded-3xl p-2 shadow-xl shadow-blue-900/10 border border-blue-100 flex flex-col md:flex-row gap-2">
      <div className="flex-1 flex items-center gap-3 px-4 py-3">
        <Search className="text-blue-600" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca una carta específica: Charizard, Pikachu, set o producto sellado"
          className="w-full outline-none text-slate-800 placeholder:text-slate-400"
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
      </div>
      <button
        onClick={onSearch}
        className="px-6 py-3 rounded-2xl bg-yellow-400 text-slate-900 font-bold hover:bg-yellow-300 transition"
      >
        Buscar carta
      </button>
    </div>
  );
}

function HomePage({ setPage, setSelectedCard, searchQuery, setSearchQuery }) {
  const [query, setQuery] = useState(searchQuery || '');
  const goSearch = () => {
    setSearchQuery(query.trim());
    setPage('market');
  };
  return (
    <Layout>
      <section className="grid lg:grid-cols-2 gap-8 items-center min-h-[70vh]">
        <div>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-slate-800 text-sm font-semibold mb-5">
            <ShieldCheck size={17} /> Compra protegida para cartas TCG
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-slate-950 leading-tight">
            Conecta TCG: compra y vende cartas Pokémon TCG con confianza.
          </h2>
          <p className="text-lg text-slate-600 mt-5 max-w-xl">
            Busca cartas singles o producto sellado, compara vendedores, revisa
            reseñas y paga de forma segura hasta confirmar la recepción.
          </p>
          <div className="mt-8">
            <SearchBar query={query} setQuery={setQuery} onSearch={goSearch} />
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mt-6">
            <InfoPill
              icon={ShieldCheck}
              title="Pago protegido"
              text="El dinero se libera al recibir."
            />
            <InfoPill
              icon={Star}
              title="Reputación"
              text="Calificaciones y reseñas."
            />
            <InfoPill icon={Truck} title="Envíos" text="Opciones nacionales." />
          </div>
          <div className="mt-5 bg-white border border-blue-100 rounded-3xl p-5 shadow-sm">
            <p className="text-sm font-black text-blue-700 uppercase">Contáctanos</p>
            <p className="text-slate-700 mt-1">
              Andrés Gómez · Teléfono 3108633831
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-blue-600 rounded-[3rem] rotate-3 opacity-10" />
          <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-[3rem] p-6 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center text-white mb-4">
              <div>
                <p className="text-sm opacity-80">Oferta destacada</p>
                <h3 className="text-2xl font-black">Charizard ex</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-yellow-300 text-slate-900 text-sm font-bold">
                3 vendedores
              </span>
            </div>
            <div className="grid sm:grid-cols-[220px_1fr] gap-4 items-center">
              <img
                src={cards[0].image}
                className="w-full max-w-[220px] mx-auto rounded-2xl shadow-2xl"
              />
              <div className="space-y-3">
                {cards[0].offers.map((offer) => (
                  <OfferMini
                    key={offer.id}
                    offer={offer}
                    onClick={() => {
                      setSelectedCard(cards[0]);
                      setPage('detail');
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function InfoPill({ icon: Icon, title, text }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <Icon className="text-blue-600 mb-2" size={22} />
      <p className="font-bold text-slate-900">{title}</p>
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
}

function OfferMini({ offer, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white/95 hover:bg-white rounded-2xl p-4 text-left transition"
    >
      <div className="flex justify-between gap-3">
        <div>
          <p className="font-bold text-slate-900 flex items-center gap-1">
            {offer.seller}{' '}
            {offer.verified && (
              <BadgeCheck size={16} className="text-blue-600" />
            )}
          </p>
          <p className="text-sm text-slate-500">
            {offer.condition} · {offer.city}
          </p>
        </div>
        <div className="text-right">
          <p className="font-black text-blue-700">{money(offer.price)}</p>
          <p className="text-sm text-slate-600 flex items-center justify-end gap-1">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            {offer.rating}
          </p>
        </div>
      </div>
    </button>
  );
}

function Marketplace({
  setPage,
  setSelectedCard,
  searchQuery,
  setSearchQuery,
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

  const smallButtonClass = (active) =>
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

      <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-5 items-start">
        <aside className="sticky top-24 bg-white border border-slate-200 rounded-3xl p-5 h-fit shadow-sm">
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
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
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

function CardTile({ card, onClick }) {
  const best = Math.min(...card.offers.map((o) => o.price));
  return (
    <button
      onClick={onClick}
      className="group text-left bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
    >
      <div className="bg-gradient-to-br from-blue-50 to-yellow-50 p-5 flex justify-center h-64">
        <img
          src={card.image}
          className="max-h-full object-contain group-hover:scale-105 transition"
        />
      </div>
      <div className="p-5">
        <div className="flex justify-between gap-3">
          <div>
            <h3 className="font-black text-slate-900 text-lg">{card.name}</h3>
            <p className="text-sm text-slate-500">{card.set}</p>
            <p className="text-xs text-slate-400 mt-1">Idioma: {card.language || 'Español'}</p>
          </div>
          <span className="h-fit text-xs bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full">
            {card.offers.length} ofertas
          </span>
        </div>
        <div className="mt-4 flex justify-between items-end">
          <div>
            <p className="text-xs text-slate-500">Desde</p>
            <p className="text-xl font-black text-blue-700">{money(best)}</p>
          </div>
          <p className="text-sm text-slate-500">
            Prom. {money(card.marketAvg)}
          </p>
        </div>
      </div>
    </button>
  );
}

function buildSalesHistory(card) {
  const points = [];
  const base = card.marketAvg || 100000;
  const minLimit = card.low || Math.round(base * 0.85);
  const maxLimit = card.high || Math.round(base * 1.15);

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const wave = Math.sin((30 - i + card.id) / 3.2) * 0.055;
    const secondaryWave = Math.cos((30 - i + card.id) / 5.1) * 0.035;
    const trend = ((30 - i) / 30 - 0.5) * 0.06;
    const rawPrice = base * (1 + wave + secondaryWave + trend);

    const price = Math.min(
      maxLimit,
      Math.max(minLimit, Math.round(rawPrice / 1000) * 1000)
    );

    points.push({
      fecha: date.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
      }),
      precio: price,
    });
  }

  return points;
}

function PriceTrendChart({ card }) {
  const data = useMemo(() => buildSalesHistory(card), [card]);
  const firstPrice = data[0]?.precio || 0;
  const lastPrice = data[data.length - 1]?.precio || 0;
  const variation = firstPrice
    ? ((lastPrice - firstPrice) / firstPrice) * 100
    : 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-5">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="text-2xl font-black text-slate-950">
            Historial de ventas del último mes
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Tendencia estimada de precios de ventas recientes para esta carta o
            producto.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-right">
          <p className="text-xs text-slate-500">Variación mensual</p>
          <p
            className={`font-black text-lg ${
              variation >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {variation >= 0 ? '+' : ''}
            {variation.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 18, left: 8, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" tick={{ fontSize: 11 }} minTickGap={18} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(value) =>
                `$${Number(value).toLocaleString('es-CO')}`
              }
              width={92}
            />
            <Tooltip
              formatter={(value) => [money(Number(value)), 'Precio']}
              labelFormatter={(label) => `Fecha: ${label}`}
            />
            <ReferenceLine
              y={card.marketAvg}
              stroke="#facc15"
              strokeDasharray="5 5"
              label={{
                value: 'Promedio',
                position: 'insideTopRight',
                fill: '#334155',
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="precio"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-5">
        <PriceBox label="Primera venta del mes" value={money(firstPrice)} />
        <PriceBox
          label="Última venta registrada"
          value={money(lastPrice)}
          highlight
        />
        <PriceBox
          label="Promedio de referencia"
          value={money(card.marketAvg)}
        />
      </div>
    </div>
  );
}

function DetailPage({ card, setPage, setSelectedOffer, setSelectedSeller }) {
  if (!card) return null;
  return (
    <Layout>
      <button
        onClick={() => setPage('market')}
        className="mb-5 flex items-center gap-2 text-slate-600 hover:text-blue-700"
      >
        <ArrowLeft size={18} /> Volver al marketplace
      </button>
      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-3xl p-6 border border-slate-200 flex items-center justify-center">
          <img
            src={card.image}
            className="max-h-[520px] object-contain drop-shadow-2xl"
          />
        </div>
        <div>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-5">
            <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
              {card.type}
            </span>
            <h2 className="text-4xl font-black text-slate-950 mt-3">
              {card.name}
            </h2>
            <p className="text-slate-500 mt-1">
              {card.set} · {card.number} · {card.rarity} · {card.language || 'Español'}
            </p>
            <p className="text-slate-700 mt-4">{card.description}</p>
            <div className="grid sm:grid-cols-3 gap-3 mt-5">
              <PriceBox label="Precio mínimo" value={money(card.low)} />
              <PriceBox
                label="Promedio histórico"
                value={money(card.marketAvg)}
                highlight
              />
              <PriceBox label="Precio máximo" value={money(card.high)} />
            </div>
          </div>
          <PriceTrendChart card={card} />

          <h3 className="text-2xl font-black text-slate-950 mb-3">
            Vendedores ofreciendo esta carta
          </h3>
          <div className="space-y-3">
            {card.offers.map((offer) => (
              <OfferRow
                key={offer.id}
                offer={offer}
                onSeller={() => {
                  setSelectedSeller(offer);
                  setPage('sellerProfile');
                }}
                onBuy={() => {
                  setSelectedOffer(offer);
                  setPage('checkout');
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function PriceBox({ label, value, highlight }) {
  return (
    <div
      className={`rounded-2xl p-4 border ${
        highlight
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-slate-50 border-slate-200'
      }`}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-black text-slate-900">{value}</p>
    </div>
  );
}

function OfferRow({ offer, onSeller, onBuy }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
      <div className="flex-1">
        <button
          onClick={onSeller}
          className="font-black text-lg text-slate-900 hover:text-blue-700 flex items-center gap-2"
        >
          {offer.seller}{' '}
          {offer.verified && <BadgeCheck className="text-blue-600" size={19} />}
        </button>
        <p className="text-sm text-slate-500">
          {offer.city} · {offer.condition} · {offer.shipping}
        </p>
        <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <Star size={15} className="fill-yellow-400 text-yellow-400" />{' '}
            {offer.rating} / 5
          </span>
          <span>{offer.reviews} reseñas</span>
          <span>{offer.sales} ventas</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <p className="text-2xl font-black text-blue-700 min-w-[150px] text-right">
          {money(offer.price)}
        </p>
        <button
          onClick={onBuy}
          className="px-5 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 font-black text-slate-900 flex items-center gap-2"
        >
          <ShoppingCart size={18} /> Comprar
        </button>
      </div>
    </div>
  );
}

function SellerProfile({ seller, setPage }) {
  if (!seller) return null;
  const reviews = sellerReviews[seller.seller] || [];
  return (
    <Layout>
      <button
        onClick={() => setPage('detail')}
        className="mb-5 flex items-center gap-2 text-slate-600 hover:text-blue-700"
      >
        <ArrowLeft size={18} /> Volver a la publicación
      </button>
      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm h-fit">
          <div className="w-24 h-24 rounded-3xl bg-blue-600 text-yellow-300 font-black flex items-center justify-center text-3xl mb-4">
            TCG
          </div>
          <h2 className="text-3xl font-black text-slate-950 flex items-center gap-2">
            {seller.seller}{' '}
            {seller.verified && <BadgeCheck className="text-blue-600" />}
          </h2>
          <p className="text-slate-500">Vendedor en {seller.city}</p>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <Metric label="Calificación" value={`${seller.rating}/5`} />
            <Metric label="Ventas" value={seller.sales} />
            <Metric label="Reseñas" value={seller.reviews} />
            <Metric
              label="Verificación"
              value={seller.verified ? 'Sí' : 'Pendiente'}
            />
          </div>
          <button className="mt-5 w-full px-5 py-3 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2">
            <MessageCircle size={18} /> Contactar vendedor
          </button>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-2xl font-black text-slate-950 mb-4">
            Reseñas recientes
          </h3>
          <div className="space-y-3">
            {reviews.map((r, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-4">
                <p className="flex items-center gap-1 mb-2">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                </p>
                <p className="text-slate-700">“{r}”</p>
              </div>
            ))}
          </div>
          <h3 className="text-2xl font-black text-slate-950 mt-8 mb-4">
            Indicadores de confianza
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <InfoPill
              icon={ShieldCheck}
              title="Identidad"
              text="Documento verificado"
            />
            <InfoPill icon={Package} title="Empaque" text="Buenas prácticas" />
            <InfoPill icon={Clock} title="Respuesta" text="Menos de 2 horas" />
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-black text-slate-900 text-xl">{value}</p>
    </div>
  );
}

function Checkout({ card, offer, setPage, setOrderPlaced }) {
  if (!card || !offer) return null;

  const platformBalance = 180000;
  const [usePlatformBalance, setUsePlatformBalance] = useState(false);

  const productTotal = offer.price;
  const balanceUsed = usePlatformBalance
    ? Math.min(platformBalance, productTotal)
    : 0;
  const totalToPay = productTotal - balanceUsed;

  return (
    <Layout>
      <button
        onClick={() => setPage('detail')}
        className="mb-5 flex items-center gap-2 text-slate-600 hover:text-blue-700"
      >
        <ArrowLeft size={18} /> Volver
      </button>
      <div className="grid lg:grid-cols-[1fr_420px] gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-3xl font-black text-slate-950">Pago seguro</h2>
          <p className="text-slate-600 mt-2">
            Tu pago queda protegido hasta que confirmes que recibiste el
            producto en buen estado.
          </p>
          <div className="mt-6 p-5 bg-blue-50 border border-blue-100 rounded-3xl flex gap-3">
            <ShieldCheck className="text-blue-600 shrink-0" />
            <div>
              <p className="font-black text-slate-900">
                Protección de compra activada
              </p>
              <p className="text-sm text-slate-600">
                La plataforma retiene el dinero. El vendedor solo recibe el pago
                cuando confirmes la recepción.
              </p>
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-6 mb-3">
            Selecciona método de pago
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <button className="border-2 border-blue-600 bg-blue-50 rounded-2xl p-4 text-left">
              <CreditCard className="text-blue-600 mb-2" />
              <p className="font-bold">Tarjeta débito/crédito</p>
              <p className="text-sm text-slate-500">Pago inmediato</p>
            </button>
            <button className="border border-slate-200 rounded-2xl p-4 text-left hover:border-blue-300">
              <WalletCards className="text-slate-600 mb-2" />
              <p className="font-bold">PSE / transferencia</p>
              <p className="text-sm text-slate-500">Disponible en Colombia</p>
            </button>
          </div>

          <div className="mt-4 border border-yellow-200 bg-yellow-50 rounded-3xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="font-black text-slate-900 flex items-center gap-2">
                  <WalletCards size={18} className="text-blue-600" />
                  Usar saldo de la plataforma
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Saldo disponible: {money(platformBalance)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Puedes usar tu saldo acumulado por ventas anteriores para
                  pagar esta compra.
                </p>
              </div>
              <button
                onClick={() => setUsePlatformBalance(!usePlatformBalance)}
                className={`px-4 py-2 rounded-2xl text-sm font-black transition ${
                  usePlatformBalance
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {usePlatformBalance ? 'Saldo aplicado' : 'Usar saldo'}
              </button>
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-6 mb-3">
            Dirección de envío
          </h3>
          <div className="grid gap-3">
            <input
              className="border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
              placeholder="Dirección"
              defaultValue="Calle 123 #45-67"
            />
            <input
              className="border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
              placeholder="Ciudad"
              defaultValue="Bogotá"
            />
            <textarea
              className="border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
              placeholder="Observaciones"
            />
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm h-fit">
          <h3 className="text-xl font-black text-slate-950 mb-4">
            Resumen del pedido
          </h3>
          <div className="flex gap-4">
            <img
              src={card.image}
              className="w-24 rounded-xl object-contain bg-slate-50"
            />
            <div>
              <p className="font-black text-slate-900">{card.name}</p>
              <p className="text-sm text-slate-500">
                {offer.condition} · {offer.seller}
              </p>
              <p className="font-black text-blue-700 mt-2">
                {money(offer.price)}
              </p>
            </div>
          </div>
          <div className="border-t border-slate-100 mt-5 pt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Producto</span>
              <b>{money(productTotal)}</b>
            </div>
            {usePlatformBalance && (
              <div className="flex justify-between text-blue-700">
                <span>Saldo usado</span>
                <b>- {money(balanceUsed)}</b>
              </div>
            )}
            <div className="flex justify-between text-lg pt-3 border-t border-slate-100">
              <span className="font-black">Total a pagar</span>
              <b>{money(totalToPay)}</b>
            </div>
          </div>
          <button
            onClick={() => {
              setOrderPlaced(true);
              setPage('orderSuccess');
            }}
            className="mt-6 w-full px-5 py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 font-black text-slate-900 flex items-center justify-center gap-2"
          >
            <ShieldCheck size={20} /> Realizar pedido protegido
          </button>
        </div>
      </div>
    </Layout>
  );
}

function OrderSuccess({ setPage }) {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-slate-200 p-8 text-center shadow-sm">
        <div className="w-20 h-20 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={42} />
        </div>
        <h2 className="text-4xl font-black text-slate-950">Pedido realizado</h2>
        <p className="text-slate-600 mt-3">
          Tu pago quedó protegido. Notificaremos al vendedor para que indique el
          método de envío y despache el producto.
        </p>

        <div className="bg-blue-50 rounded-3xl p-5 mt-6 text-left">
          <p className="font-black text-slate-900">Estado actual</p>
          <p className="text-slate-600">
            Pago retenido por la plataforma hasta que confirmes la recepción
            desde el historial de transacciones.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-5 mt-4 text-left">
          <p className="font-black text-slate-900 flex items-center gap-2">
            <Clock size={20} className="text-blue-600" />
            Confirmación automática en 10 días calendario
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Si en un plazo de 10 días calendario no realizas la confirmación de
            recibido ni reportas un problema, se entenderá que la compra fue
            recibida correctamente y el pago protegido será desembolsado al
            vendedor.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-3xl p-5 mt-4 text-left">
          <p className="font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-600" />
            ¿No recibiste la compra?
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Desde el historial de transacciones puedes abrir un caso. La
            plataforma contactará al vendedor para verificar la información de
            envío y resolver la solicitud.
          </p>
        </div>

        <button
          onClick={() => setPage('history')}
          className="mt-6 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold"
        >
          Ir al historial de transacciones
        </button>
      </div>
    </Layout>
  );
}

function PublishPage({ setPage }) {
  const publishExpansions = Array.from(new Set(cards.map((c) => c.set)));
  const languageOptions = ['Español', 'Inglés', 'Japonés', 'Portugués'];
  const singleConditionOptions = [
    'Near Mint',
    'Excellent',
    'Light Played',
    'Played',
    'Damaged',
  ];
  const sealedConditionOptions = [
    'Sellado nuevo',
    'Sellado con desgaste leve',
    'Sellado con golpe en caja',
    'Sellado con plástico abierto',
    'Producto abierto / incompleto',
  ];

  const [selectedType, setSelectedType] = useState('Carta single');
  const [selectedExpansion, setSelectedExpansion] = useState(cards[0].set);
  const [selectedCard, setSelectedCard] = useState(cards[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(cards[0].language || 'Español');
  const [selectedCondition, setSelectedCondition] = useState('Near Mint');
  const [price, setPrice] = useState(cards[0].marketAvg);

  const filteredPublishCards = cards.filter(
    (c) => c.set === selectedExpansion && c.type === selectedType
  );
  const conditionOptions =
    selectedType === 'Producto sellado' ? sealedConditionOptions : singleConditionOptions;

  function applyCard(card) {
    setSelectedCard(card);
    setSelectedType(card.type);
    setSelectedLanguage(card.language || 'Español');
    setSelectedCondition(
      card.type === 'Producto sellado' ? 'Sellado nuevo' : 'Near Mint'
    );
    setPrice(card.marketAvg);
  }

  function changeType(type) {
    setSelectedType(type);
    const firstCard =
      cards.find((c) => c.type === type && c.set === selectedExpansion) ||
      cards.find((c) => c.type === type) ||
      cards[0];
    setSelectedExpansion(firstCard.set);
    applyCard(firstCard);
  }

  function changeExpansion(expansion) {
    setSelectedExpansion(expansion);
    const firstCard =
      cards.find((c) => c.set === expansion && c.type === selectedType) ||
      cards.find((c) => c.set === expansion) ||
      cards[0];
    applyCard(firstCard);
  }

  function changeCard(id) {
    const c = cards.find((x) => x.id === Number(id));
    if (!c) return;
    applyCard(c);
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-950">
            Publicar producto
          </h2>
          <p className="text-slate-600">
            Selecciona la expansión, el producto, idioma, estado y precio de venta.
          </p>
        </div>
      </div>
      <div className="grid lg:grid-cols-[1fr_420px] gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-4">
            Información de publicación
          </h3>
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-bold text-slate-700">
                Tipo de producto
              </label>
              <select
                value={selectedType}
                onChange={(e) => changeType(e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
              >
                <option>Carta single</option>
                <option>Producto sellado</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Expansión / set
              </label>
              <select
                value={selectedExpansion}
                onChange={(e) => changeExpansion(e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
              >
                {publishExpansions.map((expansion) => (
                  <option key={expansion} value={expansion}>
                    {expansion}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">
                Primero selecciona la expansión para limitar las cartas o productos disponibles.
              </p>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Buscar carta o producto
              </label>
              <select
                value={selectedCard.id}
                onChange={(e) => changeCard(e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
              >
                {filteredPublishCards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.set}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Idioma
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
              >
                {languageOptions.map((language) => (
                  <option key={language}>{language}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Estado</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
              >
                {conditionOptions.map((condition) => (
                  <option key={condition}>{condition}</option>
                ))}
              </select>
              {selectedType === 'Producto sellado' && (
                <p className="text-xs text-slate-400 mt-1">
                  Para producto sellado se valida si está nuevo, con desgaste, golpe,
                  plástico abierto o incompleto.
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Precio de venta
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="mt-2 w-full border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Fotos</label>
              <div className="mt-2 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center bg-slate-50">
                <PlusCircle className="mx-auto text-blue-600 mb-2" />
                <p className="font-bold text-slate-800">
                  Subir fotos del producto
                </p>
                <p className="text-sm text-slate-500">
                  {selectedType === 'Producto sellado'
                    ? 'Frente, laterales, esquinas, sello/plástico y detalle de caja.'
                    : 'Frente, reverso, esquinas y detalle de estado.'}
                </p>
              </div>
            </div>
            <textarea
              className="border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
              placeholder="Observaciones sobre estado, envío o condiciones"
            />
          </div>
        </div>
        <div className="space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-black text-slate-950 text-xl">
              Referencia de precio
            </h3>
            <div className="flex gap-4 mt-4">
              <img
                src={selectedCard.image}
                className="w-20 rounded-xl bg-slate-50 object-contain"
              />
              <div>
                <p className="font-black">{selectedCard.name}</p>
                <p className="text-sm text-slate-500">{selectedCard.set}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedType} · {selectedLanguage}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              <PriceBox label="Bajo" value={money(selectedCard.low)} />
              <PriceBox
                label="Promedio"
                value={money(selectedCard.marketAvg)}
                highlight
              />
              <PriceBox label="Alto" value={money(selectedCard.high)} />
            </div>
            <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <p className="font-black text-slate-900">Precio sugerido</p>
              <p className="text-2xl font-black text-blue-700">
                {money(selectedCard.marketAvg)}
              </p>
              <p className="text-sm text-slate-600">
                Basado en historial de publicaciones y ventas recientes.
              </p>
            </div>
          </div>
          <button
            onClick={() => setPage('publishSuccess')}
            className="w-full px-5 py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 font-black text-slate-900 flex items-center justify-center gap-2"
          >
            <Upload size={20} /> Publicar producto
          </button>
        </div>
      </div>
    </Layout>
  );
}

function PublishSuccess({ setPage }) {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-slate-200 p-8 text-center shadow-sm">
        <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={42} />
        </div>
        <h2 className="text-4xl font-black text-slate-950">
          Publicación activa
        </h2>
        <p className="text-slate-600 mt-3">
          Tu producto ya está visible para compradores. Te notificaremos cuando
          alguien realice una compra.
        </p>
        <button
          onClick={() => setPage('market')}
          className="mt-6 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold"
        >
          Ver en marketplace
        </button>
      </div>
    </Layout>
  );
}

function SellerSale({ setPage }) {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center">
            <Bell className="text-blue-700" size={30} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-950">
              Tienes una nueva venta
            </h2>
            <p className="text-slate-600">
              El comprador ya realizó el pago protegido.
            </p>
          </div>
        </div>
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-3xl p-5">
          <p className="font-black text-slate-900">Charizard ex · Near Mint</p>
          <p className="text-slate-600">
            Pago retenido por la plataforma: {money(365000)}
          </p>
        </div>
        <h3 className="text-xl font-black text-slate-900 mt-6 mb-3">
          Indica método de envío
        </h3>
        <div className="grid gap-3">
          <select className="border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500">
            <option>Servientrega</option>
            <option>Coordinadora</option>
            <option>Interrapidísimo</option>
            <option>Mensajería local</option>
          </select>
          <input
            className="border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
            placeholder="Número de guía"
          />
          <textarea
            className="border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
            placeholder="Observaciones del envío"
          />
        </div>
        <button
          onClick={() => setPage('shipmentSuccess')}
          className="mt-5 w-full px-5 py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 font-black text-slate-900 flex items-center justify-center gap-2"
        >
          <Truck size={20} /> Confirmar envío
        </button>
      </div>
    </Layout>
  );
}

function ShipmentSuccess({ setPage }) {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-slate-200 p-8 text-center shadow-sm">
        <Truck className="mx-auto text-blue-600 mb-4" size={58} />
        <h2 className="text-4xl font-black text-slate-950">Envío registrado</h2>
        <p className="text-slate-600 mt-3">
          El comprador fue notificado. Cuando confirme la recepción, podrás
          solicitar el desembolso.
        </p>
        <button
          onClick={() => setPage('payout')}
          className="mt-6 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold"
        >
          Simular recepción
        </button>
      </div>
    </Layout>
  );
}

function PayoutPage({ setPage }) {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-slate-200 p-8 text-center shadow-sm">
        <WalletCards className="mx-auto text-green-600 mb-4" size={58} />
        <h2 className="text-4xl font-black text-slate-950">
          Recepción confirmada
        </h2>
        <p className="text-slate-600 mt-3">
          El comprador confirmó que recibió el producto. El dinero puede
          desembolsarse al vendedor o mantenerse en saldo de la plataforma.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mt-6">
          <button className="px-5 py-4 rounded-2xl bg-green-600 text-white font-black">
            Desembolsar dinero
          </button>
          <button className="px-5 py-4 rounded-2xl bg-blue-600 text-white font-black">
            Dejar saldo en plataforma
          </button>
        </div>
      </div>
    </Layout>
  );
}

function getCommissionRate(value) {
  if (value <= 100000) return 0.08;
  if (value <= 300000) return 0.06;
  return 0.04;
}

function getCommissionLabel(value) {
  return `${Math.round(getCommissionRate(value) * 100)}%`;
}

function getCommissionValue(value) {
  return Math.round(value * getCommissionRate(value));
}

function CommissionPage() {
  const examples = [72000, 210000, 365000];
  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-950">
            Comisiones de la plataforma
          </h2>
          <p className="text-slate-600">
            La comisión se descuenta únicamente al vendedor cuando la venta se
            completa y el pago puede ser desembolsado.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-slate-500">Ventas entre</p>
          <h3 className="text-xl font-black text-slate-950 mt-1">
            $0 y $100.000
          </h3>
          <p className="text-4xl font-black text-blue-700 mt-4">8%</p>
          <p className="text-sm text-slate-500 mt-2">
            Ideal para cartas de menor valor.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-slate-500">Ventas entre</p>
          <h3 className="text-xl font-black text-slate-950 mt-1">
            $100.001 y $300.000
          </h3>
          <p className="text-4xl font-black text-blue-700 mt-4">6%</p>
          <p className="text-sm text-slate-500 mt-2">
            Para cartas y productos de valor medio.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-slate-500">Ventas superiores a</p>
          <h3 className="text-xl font-black text-slate-950 mt-1">$300.000</h3>
          <p className="text-4xl font-black text-blue-700 mt-4">4%</p>
          <p className="text-sm text-slate-500 mt-2">
            Pensado para ventas de alto valor.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-2xl font-black text-slate-950 mb-4">
          Ejemplos de cálculo
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          {examples.map((value) => {
            const commission = getCommissionValue(value);
            return (
              <div
                key={value}
                className="rounded-2xl bg-slate-50 p-4 border border-slate-100"
              >
                <p className="text-sm text-slate-500">Valor de venta</p>
                <p className="font-black text-slate-950">{money(value)}</p>
                <p className="text-sm text-slate-500 mt-3">
                  Comisión plataforma ({getCommissionLabel(value)})
                </p>
                <p className="font-black text-red-600">- {money(commission)}</p>
                <p className="text-sm text-slate-500 mt-3">Neto vendedor</p>
                <p className="font-black text-blue-700">
                  {money(value - commission)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

const initialTransactions = [
  {
    id: 'T-001',
    date: '2026-05-02',
    type: 'Compra',
    product: 'Charizard ex',
    counterpart: 'Golden Collector',
    gross: 365000,
    status: 'Pago protegido',
  },
  {
    id: 'T-002',
    date: '2026-05-01',
    type: 'Venta',
    product: 'Pikachu VMAX',
    counterpart: 'Rare Cards Bogotá',
    gross: 72000,
    status: 'Desembolsado',
  },
  {
    id: 'T-003',
    date: '2026-04-29',
    type: 'Venta',
    product: 'Booster Box Pokémon 151',
    counterpart: 'Hobby Center Norte',
    gross: 710000,
    status: 'En camino',
  },
  {
    id: 'T-004',
    date: '2026-04-27',
    type: 'Compra',
    product: 'Elite Trainer Box Pokémon 151',
    counterpart: 'Hobby Center Norte',
    gross: 315000,
    status: 'Entregado',
  },
  {
    id: 'T-005',
    date: '2026-04-25',
    type: 'Compra',
    product: 'Mew ex',
    counterpart: 'Poké Singles CO',
    gross: 225000,
    status: 'Pago protegido',
  },
];

function HistoryPage({
  transactions,
  setTransactions,
  setPage,
  setSelectedTransaction,
}) {
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchText, setSearchText] = useState('');

  function clearFilters() {
    setTypeFilter('Todos');
    setStartDate('');
    setEndDate('');
    setSearchText('');
  }

  function viewTransaction(transaction) {
    setSelectedTransaction(transaction);
    setPage('transactionDetail');
  }

  const filteredTransactions = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return transactions.filter((transaction) => {
      const matchesType =
        typeFilter === 'Todos' || transaction.type === typeFilter;
      const matchesStart = !startDate || transaction.date >= startDate;
      const matchesEnd = !endDate || transaction.date <= endDate;
      const matchesSearch =
        !q ||
        `${transaction.product} ${transaction.counterpart} ${transaction.id}`
          .toLowerCase()
          .includes(q);
      return matchesType && matchesStart && matchesEnd && matchesSearch;
    });
  }, [transactions, typeFilter, startDate, endDate, searchText]);

  const totalPurchases = filteredTransactions
    .filter((transaction) => transaction.type === 'Compra')
    .reduce((sum, transaction) => sum + transaction.gross, 0);
  const totalSales = filteredTransactions
    .filter((transaction) => transaction.type === 'Venta')
    .reduce((sum, transaction) => sum + transaction.gross, 0);
  const totalCommissions = filteredTransactions
    .filter((transaction) => transaction.type === 'Venta')
    .reduce(
      (sum, transaction) => sum + getCommissionValue(transaction.gross),
      0
    );
  const netSales = totalSales - totalCommissions;

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-950">
            Historial de transacciones
          </h2>
          <p className="text-slate-600">
            Consulta compras y ventas. Ingresa al detalle de cada transacción
            para gestionar acciones.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Metric label="Compras filtradas" value={money(totalPurchases)} />
        <Metric label="Ventas brutas filtradas" value={money(totalSales)} />
        <Metric label="Comisión plataforma" value={money(totalCommissions)} />
        <Metric label="Ventas netas" value={money(netSales)} />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm mb-5">
        <div className="grid lg:grid-cols-[150px_150px_150px_1fr_130px] gap-3 items-end">
          <div>
            <label className="text-xs font-black text-slate-500 uppercase">
              Desde
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-2 w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 uppercase">
              Hasta
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-2 w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 uppercase">
              Tipo
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="mt-2 w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option>Todos</option>
              <option>Compra</option>
              <option>Venta</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 uppercase">
              Buscar producto o vendedor
            </label>
            <div className="mt-2 flex items-center gap-2 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-blue-500">
              <Search size={18} className="text-blue-600" />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Ej: Charizard, Golden Collector, T-001"
                className="w-full outline-none text-sm"
              />
            </div>
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-black"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-slate-950">
              Detalle de transacciones
            </h3>
            <p className="text-xs text-slate-500">
              Haz clic en “Ver detalle” para confirmar recibido, abrir un caso o
              gestionar desembolsos.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black">
            {filteredTransactions.length} transacciones
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-[11px] text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                <th className="px-2.5 py-3 whitespace-nowrap">Fecha</th>
                <th className="px-2.5 py-3 whitespace-nowrap">ID</th>
                <th className="px-2.5 py-3 whitespace-nowrap">Tipo</th>
                <th className="px-2.5 py-3 whitespace-nowrap">Producto</th>
                <th className="px-2.5 py-3 whitespace-nowrap">
                  Vendedor / Comprador
                </th>
                <th className="px-2.5 py-3 whitespace-nowrap text-right">
                  Valor
                </th>
                <th className="px-2.5 py-3 whitespace-nowrap text-center">
                  % comisión
                </th>
                <th className="px-2.5 py-3 whitespace-nowrap text-right">
                  Comisión
                </th>
                <th className="px-2.5 py-3 whitespace-nowrap text-right">
                  Neto
                </th>
                <th className="px-2.5 py-3 whitespace-nowrap">Estado</th>
                <th className="px-2.5 py-3 whitespace-nowrap">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TransactionTableRow
                    key={transaction.id}
                    transaction={transaction}
                    onView={viewTransaction}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={11}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    No se encontraron transacciones con los filtros
                    seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

function TransactionTableRow({ transaction, onView }) {
  const isSale = transaction.type === 'Venta';
  const commissionRate = isSale
    ? getCommissionLabel(transaction.gross)
    : 'No aplica';
  const commissionValue = isSale ? getCommissionValue(transaction.gross) : 0;
  const netValue = isSale
    ? transaction.gross - commissionValue
    : transaction.gross;

  const statusStyle =
    transaction.status === 'Recibido' ||
    transaction.status === 'Desembolsado' ||
    transaction.status === 'Desembolsado a cuenta' ||
    transaction.status === 'Saldo en plataforma'
      ? 'bg-green-100 text-green-800'
      : transaction.status === 'Pago protegido'
      ? 'bg-blue-100 text-blue-700'
      : transaction.status === 'Caso abierto'
      ? 'bg-red-100 text-red-700'
      : 'bg-slate-100 text-slate-700';

  return (
    <tr className="align-middle hover:bg-slate-50 transition">
      <td className="px-2.5 py-3 whitespace-nowrap text-slate-600">
        {transaction.date}
      </td>
      <td className="px-2.5 py-3 whitespace-nowrap font-bold text-slate-500">
        {transaction.id}
      </td>
      <td className="px-2.5 py-3 whitespace-nowrap">
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black ${
            isSale
              ? 'bg-yellow-100 text-slate-900'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {transaction.type}
        </span>
      </td>
      <td className="px-2.5 py-3 min-w-[180px] max-w-[220px]">
        <p className="font-black text-slate-900 leading-tight">
          {transaction.product}
        </p>
      </td>
      <td className="px-2.5 py-3 whitespace-nowrap text-slate-700">
        {transaction.counterpart}
      </td>
      <td className="px-2.5 py-3 whitespace-nowrap text-right font-black text-slate-900">
        {money(transaction.gross)}
      </td>
      <td className="px-2.5 py-3 whitespace-nowrap text-center">
        <span
          className={isSale ? 'font-black text-blue-700' : 'text-slate-400'}
        >
          {commissionRate}
        </span>
      </td>
      <td className="px-2.5 py-3 whitespace-nowrap text-right">
        <span className={isSale ? 'font-black text-red-600' : 'text-slate-400'}>
          {isSale ? `- ${money(commissionValue)}` : 'No aplica'}
        </span>
      </td>
      <td className="px-2.5 py-3 whitespace-nowrap text-right font-black text-blue-700">
        {money(netValue)}
      </td>
      <td className="px-2.5 py-3 whitespace-nowrap">
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyle}`}
        >
          {transaction.status}
        </span>
      </td>
      <td className="px-2.5 py-3 whitespace-nowrap">
        <button
          onClick={() => onView(transaction)}
          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black flex items-center gap-1"
        >
          <Eye size={12} /> Ver detalle
        </button>
      </td>
    </tr>
  );
}

function TransactionDetailPage({
  transaction,
  setPage,
  setTransactions,
  setSelectedTransaction,
}) {
  const [message, setMessage] = useState('');

  if (!transaction) {
    return (
      <Layout>
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
          <p className="text-xl font-black text-slate-950">
            No hay una transacción seleccionada
          </p>
          <button
            onClick={() => setPage('history')}
            className="mt-5 px-5 py-3 rounded-2xl bg-blue-600 text-white font-black"
          >
            Volver al historial
          </button>
        </div>
      </Layout>
    );
  }

  const isSale = transaction.type === 'Venta';
  const isPurchase = transaction.type === 'Compra';
  const commissionValue = isSale ? getCommissionValue(transaction.gross) : 0;
  const commissionRate = isSale
    ? getCommissionLabel(transaction.gross)
    : 'No aplica';
  const netValue = isSale
    ? transaction.gross - commissionValue
    : transaction.gross;
  const relatedCard = cards.find((card) => card.name === transaction.product);

  function updateSelectedTransaction(nextValues, userMessage) {
    const updatedTransaction = { ...transaction, ...nextValues };
    setTransactions((currentTransactions) =>
      currentTransactions.map((item) =>
        item.id === transaction.id ? updatedTransaction : item
      )
    );
    setSelectedTransaction(updatedTransaction);
    setMessage(userMessage);
  }

  function confirmReceived() {
    updateSelectedTransaction(
      {
        status: 'Recibido',
        releaseMessage:
          'Recepción confirmada. El pago protegido será desembolsado al vendedor.',
      },
      'Recepción confirmada. El pago protegido será desembolsado al vendedor.'
    );
  }

  function openResolutionCase() {
    updateSelectedTransaction(
      {
        status: 'Caso abierto',
        releaseMessage:
          'Solicitud abierta. La plataforma contactará al vendedor para verificar la información de envío y resolver el caso.',
      },
      `Caso abierto. La plataforma contactará a ${transaction.counterpart} para verificar la información de envío y resolver la solicitud.`
    );
  }

  function payoutToBank() {
    updateSelectedTransaction(
      {
        status: 'Desembolsado a cuenta',
        payoutMethod: 'Cuenta bancaria',
        releaseMessage:
          'El dinero neto fue enviado a la cuenta bancaria registrada.',
      },
      `Desembolso solicitado por ${money(
        netValue
      )} a tu cuenta bancaria registrada.`
    );
  }

  function payoutToBalance() {
    updateSelectedTransaction(
      {
        status: 'Saldo en plataforma',
        payoutMethod: 'Saldo de plataforma',
        releaseMessage:
          'El dinero neto quedó disponible como saldo dentro de la plataforma.',
      },
      `El valor neto de ${money(
        netValue
      )} quedó disponible como saldo en la plataforma.`
    );
  }

  const canManagePurchase =
    isPurchase && transaction.status === 'Pago protegido';
  const canManageSale =
    isSale &&
    !['Desembolsado', 'Desembolsado a cuenta', 'Saldo en plataforma'].includes(
      transaction.status
    );

  return (
    <Layout>
      <button
        onClick={() => setPage('history')}
        className="mb-5 flex items-center gap-2 text-slate-600 hover:text-blue-700"
      >
        <ArrowLeft size={18} /> Volver al historial
      </button>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-black ${
                    isSale
                      ? 'bg-yellow-100 text-slate-900'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {transaction.type}
                </span>
                <h2 className="text-3xl font-black text-slate-950 mt-3">
                  {transaction.product}
                </h2>
                <p className="text-slate-500 mt-1">
                  Transacción {transaction.id} · {transaction.date}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
                {transaction.status}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500">
                  {isSale ? 'Comprador' : 'Vendedor'}
                </p>
                <p className="font-black text-slate-950">
                  {transaction.counterpart}
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500">
                  Valor de la transacción
                </p>
                <p className="font-black text-blue-700 text-xl">
                  {money(transaction.gross)}
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500">Estado actual</p>
                <p className="font-black text-slate-950">
                  {transaction.status}
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500">Método de envío</p>
                <p className="font-black text-slate-950">
                  Servientrega / Coordinadora
                </p>
              </div>
            </div>

            {transaction.releaseMessage && (
              <div className="mt-5 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <p className="font-black text-slate-900">
                  Última actualización
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {transaction.releaseMessage}
                </p>
              </div>
            )}
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-3xl p-5 flex items-start gap-3">
              <CheckCircle2 className="text-green-700 shrink-0" size={24} />
              <div>
                <p className="font-black text-green-800">Acción realizada</p>
                <p className="text-sm text-green-700 mt-1">{message}</p>
              </div>
            </div>
          )}

          {isPurchase && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-2xl font-black text-slate-950">
                Gestión de compra
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Si recibiste el producto en buen estado, confirma la recepción
                para liberar el pago al vendedor. Si no lo recibiste, abre un
                caso para que la plataforma verifique la información de envío.
              </p>
              {canManagePurchase ? (
                <div className="grid sm:grid-cols-2 gap-3 mt-5">
                  <button
                    onClick={confirmReceived}
                    className="px-5 py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20} /> Confirmar recibido
                  </button>
                  <button
                    onClick={openResolutionCase}
                    className="px-5 py-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-black flex items-center justify-center gap-2"
                  >
                    <AlertTriangle size={20} /> No recibido / abrir caso
                  </button>
                </div>
              ) : (
                <p className="mt-5 text-sm font-bold text-slate-500">
                  Esta compra ya no tiene acciones pendientes según su estado
                  actual.
                </p>
              )}
            </div>
          )}

          {isSale && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-2xl font-black text-slate-950">
                Gestión de venta
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Selecciona cómo quieres recibir el valor neto de la venta
                después del descuento de comisión de la plataforma.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 mt-5">
                <PriceBox
                  label="Valor venta"
                  value={money(transaction.gross)}
                />
                <PriceBox
                  label={`Comisión (${commissionRate})`}
                  value={`- ${money(commissionValue)}`}
                />
                <PriceBox
                  label="Neto vendedor"
                  value={money(netValue)}
                  highlight
                />
              </div>
              {canManageSale ? (
                <div className="grid sm:grid-cols-2 gap-3 mt-5">
                  <button
                    onClick={payoutToBank}
                    className="px-5 py-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black flex items-center justify-center gap-2"
                  >
                    <WalletCards size={20} /> Desembolsar a mi cuenta
                  </button>
                  <button
                    onClick={payoutToBalance}
                    className="px-5 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black flex items-center justify-center gap-2"
                  >
                    <WalletCards size={20} /> Dejar como saldo
                  </button>
                </div>
              ) : (
                <p className="mt-5 text-sm font-bold text-slate-500">
                  Esta venta ya fue gestionada:{' '}
                  {transaction.payoutMethod || transaction.status}.
                </p>
              )}
            </div>
          )}
        </div>

        <aside className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm h-fit">
          <h3 className="text-xl font-black text-slate-950 mb-4">
            Resumen visual
          </h3>
          {relatedCard ? (
            <div>
              <div className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-3xl p-5 flex items-center justify-center h-64">
                <img
                  src={relatedCard.image}
                  className="max-h-full object-contain"
                />
              </div>
              <p className="font-black text-slate-950 mt-4">
                {relatedCard.name}
              </p>
              <p className="text-sm text-slate-500">
                {relatedCard.set} · {relatedCard.type}
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-6 text-center text-slate-500">
              Sin imagen asociada
            </div>
          )}

          <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <p className="font-black text-slate-900">Regla de protección</p>
            <p className="text-sm text-slate-600 mt-1">
              Si el comprador no confirma ni abre caso en 10 días calendario, la
              compra se entenderá como recibida.
            </p>
          </div>
        </aside>
      </div>
    </Layout>
  );
}

function ContactPage() {
  return (
    <Layout>
      <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <span className="inline-flex px-3 py-1 rounded-full bg-yellow-100 text-slate-900 text-sm font-black">
            Contáctanos
          </span>
          <h2 className="text-4xl font-black text-slate-950 mt-4">
            Conecta TCG
          </h2>
          <p className="text-slate-600 mt-3 max-w-2xl">
            Plataforma especializada para conectar compradores, coleccionistas,
            revendedores y vendedores de cartas TCG y producto sellado en Colombia.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5">
              <p className="text-xs font-black text-blue-700 uppercase">Nombre</p>
              <p className="text-xl font-black text-slate-950 mt-1">Andrés Gómez</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-5">
              <p className="text-xs font-black text-slate-700 uppercase">Teléfono</p>
              <p className="text-xl font-black text-slate-950 mt-1">3108633831</p>
            </div>
          </div>

          <div className="mt-8 bg-slate-50 border border-slate-200 rounded-3xl p-5">
            <p className="font-black text-slate-900">Propósito de contacto</p>
            <p className="text-sm text-slate-600 mt-2">
              Resolver dudas sobre publicaciones, compras protegidas, comisiones,
              estado de transacciones y casos de no recepción.
            </p>
          </div>
        </div>

        <aside className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-xl">
          <MessageCircle size={40} className="text-yellow-300 mb-4" />
          <h3 className="text-2xl font-black">Estamos construyendo confianza</h3>
          <p className="text-blue-50 mt-3">
            Este canal permite centralizar soporte básico durante la validación del
            MVP y recoger dudas frecuentes de usuarios reales.
          </p>
        </aside>
      </div>
    </Layout>
  );
}

function LoginPage({ setPage }) {
  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
        <h2 className="text-3xl font-black text-slate-950">Ingresar</h2>
        <p className="text-slate-600 mt-2">
          Accede para comprar, vender y consultar tu historial.
        </p>
        <div className="grid gap-3 mt-6">
          <input
            className="border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
            placeholder="Correo electrónico"
          />
          <input
            className="border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
            placeholder="Contraseña"
            type="password"
          />
        </div>
        <button
          onClick={() => setPage('home')}
          className="mt-5 w-full px-5 py-4 rounded-2xl bg-blue-600 text-white font-black"
        >
          Ingresar
        </button>
        <button className="mt-3 w-full px-5 py-4 rounded-2xl bg-yellow-400 text-slate-900 font-black">
          Crear cuenta
        </button>
      </div>
    </Layout>
  );
}

export default function App() {
  const [page, setPage] = useState('home');
  const [selectedCard, setSelectedCard] = useState(cards[0]);
  const [selectedOffer, setSelectedOffer] = useState(cards[0].offers[0]);
  const [selectedSeller, setSelectedSeller] = useState(cards[0].offers[0]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState(initialTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState(
    initialTransactions[0]
  );
  const notifications = orderPlaced ? 1 : 1;
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header page={page} setPage={setPage} notifications={notifications} />
      <AnimatePresence mode="wait">
        <div key={page}>
          {page === 'home' && (
            <HomePage
              setPage={setPage}
              setSelectedCard={setSelectedCard}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          {page === 'market' && (
            <Marketplace
              setPage={setPage}
              setSelectedCard={setSelectedCard}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          {page === 'detail' && (
            <DetailPage
              card={selectedCard}
              setPage={setPage}
              setSelectedOffer={setSelectedOffer}
              setSelectedSeller={setSelectedSeller}
            />
          )}
          {page === 'sellerProfile' && (
            <SellerProfile seller={selectedSeller} setPage={setPage} />
          )}
          {page === 'checkout' && (
            <Checkout
              card={selectedCard}
              offer={selectedOffer}
              setPage={setPage}
              setOrderPlaced={setOrderPlaced}
            />
          )}
          {page === 'orderSuccess' && <OrderSuccess setPage={setPage} />}
          {page === 'publish' && <PublishPage setPage={setPage} />}
          {page === 'publishSuccess' && <PublishSuccess setPage={setPage} />}
          {page === 'sellerSale' && <SellerSale setPage={setPage} />}
          {page === 'shipmentSuccess' && <ShipmentSuccess setPage={setPage} />}
          {page === 'payout' && <PayoutPage setPage={setPage} />}
          {page === 'history' && (
            <HistoryPage
              transactions={transactions}
              setTransactions={setTransactions}
              setPage={setPage}
              setSelectedTransaction={setSelectedTransaction}
            />
          )}
          {page === 'transactionDetail' && (
            <TransactionDetailPage
              transaction={selectedTransaction}
              setPage={setPage}
              setTransactions={setTransactions}
              setSelectedTransaction={setSelectedTransaction}
            />
          )}
          {page === 'commissions' && <CommissionPage />}
          {page === 'contact' && <ContactPage />}
          {page === 'login' && <LoginPage setPage={setPage} />}
        </div>
      </AnimatePresence>
      <div className="md:hidden fixed bottom-3 left-3 right-3 bg-white border border-slate-200 rounded-3xl shadow-xl p-2 grid grid-cols-6 gap-1 z-50">
        {[
          { key: 'home', icon: Home, label: 'Inicio' },
          { key: 'market', icon: Store, label: 'Buscar' },
          { key: 'publish', icon: Upload, label: 'Vender' },
          { key: 'history', icon: History, label: 'Historial' },
          { key: 'commissions', icon: WalletCards, label: 'Comisión' },
          { key: 'contact', icon: MessageCircle, label: 'Contacto' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className={`py-2 rounded-2xl text-xs font-bold flex flex-col items-center gap-1 ${
                page === item.key ? 'bg-blue-600 text-white' : 'text-slate-500'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
