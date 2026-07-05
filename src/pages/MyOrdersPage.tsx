import { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, AlertCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { CardImage } from '../components/ImagePlaceholder';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { money } from '../utils/money';
import { bestName } from '../hooks/useCatalog';

interface Order {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  catalog_card_id: number;
  quantity: number;
  unit_price: number;
  platform_fee: number;
  seller_payout: number;
  status: 'pending' | 'paid' | 'shipped' | 'received' | 'closed' | 'disputed';
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  received_at: string | null;
  closed_at: string | null;
  disputed_at: string | null;
  catalog_cards: {
    names: Record<string, string>;
    image_url: string | null;
    sets: { set_code: string; names: Record<string, string> } | null;
  } | null;
  seller: { email: string } | null;
}

type FilterTab = 'all' | 'active' | 'completed' | 'disputed';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: 'Todos' },
  { key: 'active',    label: 'En proceso' },
  { key: 'completed', label: 'Completados' },
  { key: 'disputed',  label: 'Disputas' },
];

const ACTIVE_STATUSES  = new Set(['pending', 'paid', 'shipped']);
const DONE_STATUSES    = new Set(['received', 'closed']);

function statusLabel(status: Order['status']) {
  const map: Record<Order['status'], string> = {
    pending:  'Pendiente',
    paid:     'Pagado',
    shipped:  'Enviado',
    received: 'Recibido',
    closed:   'Cerrado',
    disputed: 'Disputa',
  };
  return map[status] ?? status;
}

function statusBadge(status: Order['status']) {
  if (status === 'pending')  return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';
  if (status === 'paid')     return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400';
  if (status === 'shipped')  return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400';
  if (status === 'received' || status === 'closed') return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400';
  if (status === 'disputed') return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400';
  return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
}

const ORDERS_SELECT = `
  id, listing_id, buyer_id, seller_id, catalog_card_id,
  quantity, unit_price, platform_fee, seller_payout, status,
  created_at, paid_at, shipped_at, received_at, closed_at, disputed_at,
  catalog_cards ( names, image_url, sets ( set_code, names ) ),
  seller:profiles!seller_id ( email )
`;

export function MyOrdersPage({ setPage }: { setPage: (p: string) => void }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from('orders')
      .select(ORDERS_SELECT)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as unknown as Order[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  const filtered = useMemo(() => {
    if (filterTab === 'active')    return orders.filter(o => ACTIVE_STATUSES.has(o.status));
    if (filterTab === 'completed') return orders.filter(o => DONE_STATUSES.has(o.status));
    if (filterTab === 'disputed')  return orders.filter(o => o.status === 'disputed');
    return orders;
  }, [orders, filterTab]);

  async function confirmReceived(id: string) {
    setActionLoading(id);
    setActionError(null);
    const { error } = await supabase.rpc('update_order_status', {
      p_order_id: id,
      p_new_status: 'received',
    });
    if (error) {
      setActionError('No se pudo confirmar la recepción. Intenta de nuevo.');
    } else {
      setOrders(prev => prev.map(o =>
        o.id === id ? { ...o, status: 'received' as const, received_at: new Date().toISOString() } : o,
      ));
    }
    setActionLoading(null);
  }

  async function openDispute(id: string) {
    setActionLoading(id);
    setActionError(null);
    const { error } = await supabase.rpc('update_order_status', {
      p_order_id: id,
      p_new_status: 'disputed',
    });
    if (error) {
      setActionError('No se pudo abrir la disputa. Intenta de nuevo.');
    } else {
      setOrders(prev => prev.map(o =>
        o.id === id ? { ...o, status: 'disputed' as const, disputed_at: new Date().toISOString() } : o,
      ));
    }
    setActionLoading(null);
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Mis compras</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Historial de pedidos y seguimiento de envíos
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit mb-6">
        {FILTER_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setFilterTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filterTab === t.key
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {actionError && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-red-700 dark:text-red-400 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40 text-slate-400">Cargando pedidos…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <ShoppingBag size={28} className="text-slate-400" />
          </div>
          <p className="font-black text-slate-900 dark:text-white text-lg">
            {filterTab === 'all' ? 'Aún no has realizado compras' : 'No hay pedidos en esta categoría'}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {filterTab === 'all' && 'Explora el marketplace para encontrar cartas'}
          </p>
          {filterTab === 'all' && (
            <button
              onClick={() => setPage('market')}
              className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-sm transition"
            >
              Ir al marketplace
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => {
            const cardName = bestName(o.catalog_cards?.names ?? {}, 'es', String(o.catalog_card_id));
            const setName  = bestName(o.catalog_cards?.sets?.names ?? {}, 'es', o.catalog_cards?.sets?.set_code ?? '');
            const total    = o.unit_price * o.quantity;
            const canConfirm = o.status === 'shipped';
            const canDispute = o.status !== 'closed' && o.status !== 'disputed';

            return (
              <div
                key={o.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm"
              >
                <div className="flex gap-4">
                  {/* Card image */}
                  <div className="w-14 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    <CardImage
                      src={o.catalog_cards?.image_url ?? null}
                      size="thumb"
                      alt={cardName}
                      className="w-full h-full object-cover"
                      placeholderSize="sm"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-black text-slate-900 dark:text-white leading-tight line-clamp-2">
                          {cardName}
                          {o.quantity > 1 && (
                            <span className="ml-1 font-normal text-slate-400"> ×{o.quantity}</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{setName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Vendedor: {o.seller?.email ?? `${o.seller_id.slice(0, 8)}…`}
                        </p>
                      </div>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black whitespace-nowrap ${statusBadge(o.status)}`}>
                        {statusLabel(o.status)}
                      </span>
                    </div>

                    {/* Price row */}
                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(o.created_at).toLocaleDateString('es-CO', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                        {o.shipped_at && (
                          <span className="ml-2">
                            · Enviado {new Date(o.shipped_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                      <p className="font-black text-blue-700 dark:text-blue-400">{money(total)}</p>
                    </div>

                    {/* Actions */}
                    {(canConfirm || canDispute) && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {canConfirm && (
                          <button
                            onClick={() => confirmReceived(o.id)}
                            disabled={actionLoading === o.id}
                            className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-black transition"
                          >
                            {actionLoading === o.id ? '…' : 'Confirmar recepción'}
                          </button>
                        )}
                        {canDispute && (
                          <button
                            onClick={() => openDispute(o.id)}
                            disabled={actionLoading === o.id}
                            className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50 text-red-600 dark:text-red-400 text-xs font-black border border-red-200 dark:border-red-800 transition"
                          >
                            {actionLoading === o.id ? '…' : 'Abrir disputa'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
