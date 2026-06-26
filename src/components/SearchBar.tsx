import { Search } from 'lucide-react';

export function SearchBar({ query, setQuery, onSearch }: { query: string; setQuery: (q: string) => void; onSearch: () => void }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-2 shadow-xl shadow-blue-900/10 dark:shadow-none border border-blue-100 dark:border-slate-700 flex flex-col md:flex-row gap-2">
      <div className="flex-1 flex items-center gap-3 px-4 py-3">
        <Search className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca una carta específica: Charizard, Pikachu, set o producto sellado"
          className="w-full outline-none text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent"
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
      </div>
      <button
        onClick={onSearch}
        className="px-6 py-3 rounded-2xl bg-yellow-400 text-slate-900 font-black hover:bg-yellow-300 transition"
      >
        Buscar carta
      </button>
    </div>
  );
}
