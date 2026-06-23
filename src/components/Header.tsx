import {
  Home,
  Store,
  Upload,
  History,
  WalletCards,
  MessageCircle,
  Bell,
  User,
} from 'lucide-react';

export function Header({ page, setPage, notifications }) {
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
