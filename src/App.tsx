import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Home, Store, Upload, History, WalletCards, MessageCircle, LayoutDashboard } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { Marketplace } from './pages/Marketplace';
import { DetailPage } from './pages/DetailPage';
import { SellerProfile } from './pages/SellerProfile';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { PublishPage } from './pages/PublishPage';
import { BulkPublishPage } from './pages/BulkPublishPage';
import { PublishSuccess } from './pages/PublishSuccess';
import { SellerSale } from './pages/SellerSale';
import { ShipmentSuccess } from './pages/ShipmentSuccess';
import { PayoutPage } from './pages/PayoutPage';
import { HistoryPage } from './pages/HistoryPage';
import { TransactionDetailPage } from './pages/TransactionDetailPage';
import { CommissionPage } from './pages/CommissionPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RequestSellerPage } from './pages/RequestSellerPage';
import { AdminPage } from './pages/AdminPage';
import { AdminCatalogPage } from './pages/AdminCatalogPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { cards, initialTransactions, type Card } from './data/cards';
import type { GroupedCard } from './hooks/useCards';

const protectedPages = new Set([
  'checkout', 'publish', 'history', 'transactionDetail',
  'payout', 'sellerSale', 'shipmentSuccess', 'publishSuccess', 'orderSuccess',
  'commissions', 'bulkPublish', 'sellerDashboard',
]);

function AppContent() {
  const { user, role } = useAuth();
  const [page, setPage] = useState('home');
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | GroupedCard>(cards[0]);
  const [selectedOffer, setSelectedOffer] = useState(cards[0].offers[0]);
  const [selectedSeller, setSelectedSeller] = useState(cards[0].offers[0]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState(initialTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState(
    initialTransactions[0]
  );
  const notifications = orderPlaced ? 1 : 1;

  const navigate = useCallback((target: string) => {
    if (protectedPages.has(target) && !user) {
      setRedirectAfterLogin(target);
      setPage('login');
    } else if ((target === 'publish' || target === 'bulkPublish') && user && role === 'buyer') {
      setPage('requestSeller');
    } else if ((target === 'admin' || target === 'adminCatalog') && role !== 'admin') {
      setPage('home');
    } else if (target === 'sellerDashboard' && role === 'buyer') {
      setPage('requestSeller');
    } else {
      setRedirectAfterLogin(null);
      setPage(target);
    }
  }, [user, role]);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header page={page} setPage={navigate} notifications={notifications} />
      <AnimatePresence mode="wait">
        <div key={page}>
          {page === 'home' && (
            <HomePage
              setPage={navigate}
              setSelectedCard={setSelectedCard}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          {page === 'market' && (
            <Marketplace
              setPage={navigate}
              setSelectedCard={setSelectedCard}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          {page === 'detail' && (
            <DetailPage
              card={selectedCard as Card}
              setPage={navigate}
              setSelectedOffer={setSelectedOffer}
              setSelectedSeller={setSelectedSeller}
            />
          )}
          {page === 'sellerProfile' && (
            <SellerProfile seller={selectedSeller} setPage={navigate} />
          )}
          {page === 'checkout' && (
            <Checkout
              card={selectedCard as Card}
              offer={selectedOffer}
              setPage={navigate}
              setOrderPlaced={setOrderPlaced}
            />
          )}
          {page === 'orderSuccess' && <OrderSuccess setPage={navigate} />}
          {page === 'publish' && <PublishPage setPage={navigate} />}
          {page === 'bulkPublish' && <BulkPublishPage setPage={navigate} />}
          {page === 'publishSuccess' && <PublishSuccess setPage={navigate} />}
          {page === 'sellerSale' && <SellerSale setPage={navigate} />}
          {page === 'shipmentSuccess' && <ShipmentSuccess setPage={navigate} />}
          {page === 'payout' && <PayoutPage setPage={navigate} />}
          {page === 'history' && (
            <HistoryPage
              transactions={transactions}
              setTransactions={setTransactions}
              setPage={navigate}
              setSelectedTransaction={setSelectedTransaction}
            />
          )}
          {page === 'transactionDetail' && (
            <TransactionDetailPage
              transaction={selectedTransaction}
              setPage={navigate}
              setTransactions={setTransactions}
              setSelectedTransaction={setSelectedTransaction}
            />
          )}
          {page === 'commissions' && <CommissionPage />}
          {page === 'contact' && <ContactPage />}
          {page === 'login' && <LoginPage setPage={navigate} redirectTo={redirectAfterLogin} />}
          {page === 'requestSeller' && <RequestSellerPage setPage={navigate} />}
          {page === 'admin' && role === 'admin' && <AdminPage setPage={navigate} />}
          {page === 'adminCatalog' && role === 'admin' && <AdminCatalogPage setPage={navigate} />}
          {page === 'sellerDashboard' && (role === 'seller' || role === 'admin') && (
            <SellerDashboardPage setPage={navigate} />
          )}
        </div>
      </AnimatePresence>
      <div className="md:hidden fixed bottom-3 left-3 right-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-xl p-2 flex justify-around z-50">
        {[
          { key: 'home', icon: Home, label: 'Inicio', auth: false },
          { key: 'market', icon: Store, label: 'Buscar', auth: false },
          { key: 'publish', icon: Upload, label: 'Vender', auth: true },
          { key: 'sellerDashboard', icon: LayoutDashboard, label: 'Mi tienda', auth: true, sellerOnly: true },
          { key: 'history', icon: History, label: 'Historial', auth: true },
          { key: 'commissions', icon: WalletCards, label: 'Comisión', auth: true },
          { key: 'contact', icon: MessageCircle, label: 'Contacto', auth: false },
        ].filter((item) => (!item.auth || user) && (!item.sellerOnly || role === 'seller' || role === 'admin')).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.key)}
              className={`py-2 px-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                page === item.key ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
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

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
