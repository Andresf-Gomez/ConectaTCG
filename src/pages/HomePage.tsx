import { useState } from 'react';
import { ShieldCheck, Star, Truck } from 'lucide-react';
import { Layout } from '../components/Layout';
import { SearchBar } from '../components/SearchBar';
import { InfoPill } from '../components/InfoPill';
import { OfferMini } from '../components/OfferMini';
import { cards, type Card } from '../data/cards';

export function HomePage({ setPage, setSelectedCard, searchQuery, setSearchQuery }: { setPage: (page: string) => void; setSelectedCard: (card: Card) => void; searchQuery: string; setSearchQuery: (q: string) => void }) {
  const [query, setQuery] = useState(searchQuery || '');
  const goSearch = () => {
    setSearchQuery(query.trim());
    setPage('market');
  };
  return (
    <Layout>
      <section className="grid lg:grid-cols-2 gap-8 items-center min-h-[70vh]">
        <div>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-300 text-slate-900 text-sm font-black mb-5 shadow-sm">
            <ShieldCheck size={17} /> Compra protegida para cartas TCG
          </span>
          <h2 className="text-3xl md:text-6xl font-black text-slate-950 dark:text-white leading-tight">
            Conecta TCG: compra y vende cartas Pokémon TCG con confianza.
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mt-5 max-w-xl">
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
