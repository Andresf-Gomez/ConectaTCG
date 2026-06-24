import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Home, Store, Upload, History, WalletCards, MessageCircle } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { Marketplace } from './pages/Marketplace';
import { DetailPage } from './pages/DetailPage';
import { SellerProfile } from './pages/SellerProfile';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { PublishPage } from './pages/PublishPage';
import { PublishSuccess } from './pages/PublishSuccess';
import { SellerSale } from './pages/SellerSale';
import { ShipmentSuccess } from './pages/ShipmentSuccess';
import { PayoutPage } from './pages/PayoutPage';
import { HistoryPage } from './pages/HistoryPage';
import { TransactionDetailPage } from './pages/TransactionDetailPage';
import { CommissionPage } from './pages/CommissionPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { cards, initialTransactions } from './data/cards';

const protectedPages = new Set([
  'checkout', 'publish', 'history', 'transactionDetail',
  'payout', 'sellerSale', 'shipmentSuccess', 'publishSuccess', 'orderSuccess',
  'commissions',
]);

function AppContent() {
  const { user } = useAuth();
  const [page, setPage] = useState('home');
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);
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

  const navigate = useCallback((target: string) => {
    if (protectedPages.has(target) && !user) {
      setRedirectAfterLogin(target);
      setPage('login');
    } else {
      setRedirectAfterLogin(null);
      setPage(target);
    }
  }, [user]);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
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
              card={selectedCard}
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
              card={selectedCard}
              offer={selectedOffer}
              setPage={navigate}
              setOrderPlaced={setOrderPlaced}
            />
          )}
          {page === 'orderSuccess' && <OrderSuccess setPage={navigate} />}
          {page === 'publish' && <PublishPage setPage={navigate} />}
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
        </div>
      </AnimatePresence>
      <div className="md:hidden fixed bottom-3 left-3 right-3 bg-white border border-slate-200 rounded-3xl shadow-xl p-2 flex justify-around z-50">
        {[
          { key: 'home', icon: Home, label: 'Inicio', auth: false },
          { key: 'market', icon: Store, label: 'Buscar', auth: false },
          { key: 'publish', icon: Upload, label: 'Vender', auth: true },
          { key: 'history', icon: History, label: 'Historial', auth: true },
          { key: 'commissions', icon: WalletCards, label: 'Comisión', auth: true },
          { key: 'contact', icon: MessageCircle, label: 'Contacto', auth: false },
        ].filter((item) => !item.auth || user).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.key)}
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
