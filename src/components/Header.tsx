import {
  Home,
  Store,
  Upload,
  History,
  WalletCards,
  MessageCircle,
  Bell,
  LogOut,
  User,
  Sun,
  Moon,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function Header({ page, setPage, notifications }: { page: string; setPage: (page: string) => void; notifications: number }) {
  const { user, role, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const allNav = [
    { key: 'home', label: 'Inicio', icon: Home },
    { key: 'market', label: 'Marketplace', icon: Store },
    { key: 'publish', label: 'Publicar', icon: Upload, auth: true },
    { key: 'history', label: 'Historial', icon: History, auth: true },
    { key: 'commissions', label: 'Comisiones', icon: WalletCards, auth: true },
    { key: 'contact', label: 'Contacto', icon: MessageCircle },
    { key: 'admin', label: 'Admin', icon: ShieldCheck, adminOnly: true },
  ];
  const nav = allNav.filter((item) => (!item.auth || user) && (!item.adminOnly || role === 'admin'));
  return (
    <div className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <button
          onClick={() => setPage('home')}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-sm">
            <span className="font-black text-yellow-300 text-lg">CT</span>
          </div>
          <div className="text-left">
            <h1 className="font-bold text-slate-900 dark:text-white leading-tight">
              Conecta TCG 🃏
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">Marketplace especializado</p>
          </div>
        </button>
        <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition ${
                  page === item.key
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setPage('sellerSale')}
            className="relative p-3 rounded-2xl bg-yellow-100 dark:bg-yellow-900/40 text-slate-900 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/60 transition"
          >
            <Bell size={20} />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                {user.email?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <button
                onClick={() => signOut()}
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                title="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setPage('login')}
              className="flex px-4 py-3 rounded-2xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition items-center gap-2"
            >
              <User size={18} /> <span className="hidden sm:inline">Ingresar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
