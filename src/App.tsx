import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Home, Store, Upload, History, WalletCards, MessageCircle } from 'lucide-react';
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
