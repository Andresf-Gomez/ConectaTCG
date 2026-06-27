import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, ShieldCheck } from 'lucide-react';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type TabStatus = 'pending' | 'approved' | 'rejected';

interface SellerRequest {
  id: number;
  user_id: string;
  status: TabStatus;
  reason: string | null;
  created_at: string;
  profiles: { email: string | null }[] | null;
}

export function AdminPage({ setPage }: { setPage: (page: string) => void }) {
  const { role } = useAuth();
  const [requests, setRequests] = useState<SellerRequest[]>([]);
  const [tab, setTab] = useState<TabStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (role !== 'admin') {
      setPage('home');
      return;
    }
    fetchRequests();
  }, [role, setPage]);

  async function fetchRequests() {
    setLoading(true);
    const { data, error } = await supabase
      .from('seller_requests')
      .select('id, user_id, status, reason, created_at, profiles!seller_requests_user_id_fkey(email)')
      .order('created_at', { ascending: false });
    if (error) console.error('[AdminPage] seller_requests error:', error);
    setRequests((data ?? []) as SellerRequest[]);
    setLoading(false);
  }

  async function approve(req: SellerRequest) {
    setActionLoading(req.id);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('profiles').update({ role: 'seller' }).eq('id', req.user_id);
    await supabase
      .from('seller_requests')
      .update({ status: 'approved', reviewed_by: user?.id, updated_at: new Date().toISOString() })
      .eq('id', req.id);
    await fetchRequests();
    setActionLoading(null);
  }

  async function reject(req: SellerRequest) {
    setActionLoading(req.id);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from('seller_requests')
      .update({ status: 'rejected', reviewed_by: user?.id, updated_at: new Date().toISOString() })
      .eq('id', req.id);
    await fetchRequests();
    setActionLoading(null);
  }

  const filtered = requests.filter((r) => r.status === tab);

  const tabs: { key: TabStatus; label: string; icon: React.ReactNode }[] = [
    { key: 'pending', label: 'Pendientes', icon: <Clock size={15} /> },
    { key: 'approved', label: 'Aprobados', icon: <CheckCircle size={15} /> },
    { key: 'rejected', label: 'Rechazados', icon: <XCircle size={15} /> },
  ];

  if (role !== 'admin') return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Panel Admin</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Solicitudes de vendedor</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {tabs.map((t) => {
            const count = requests.filter((r) => r.status === t.key).length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition ${
                  tab === t.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t.icon}
                {t.label}
                {count > 0 && (
                  <span className={`text-xs rounded-full px-2 py-0.5 ${tab === t.key ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500">
            No hay solicitudes {tab === 'pending' ? 'pendientes' : tab === 'approved' ? 'aprobadas' : 'rechazadas'}.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => (
              <div
                key={req.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">
                      {req.profiles?.[0]?.email ?? req.user_id}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(req.created_at).toLocaleDateString('es-CO', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </p>
                    {req.reason && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                        {req.reason}
                      </p>
                    )}
                  </div>

                  {tab === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => approve(req)}
                        disabled={actionLoading === req.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold transition"
                      >
                        <CheckCircle size={14} />
                        Aprobar
                      </button>
                      <button
                        onClick={() => reject(req)}
                        disabled={actionLoading === req.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-950/40 dark:hover:bg-red-950/60 disabled:opacity-50 text-red-700 dark:text-red-400 text-sm font-semibold transition"
                      >
                        <XCircle size={14} />
                        Rechazar
                      </button>
                    </div>
                  )}

                  {tab !== 'pending' && (
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${
                      tab === 'approved'
                        ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                    }`}>
                      {tab === 'approved' ? 'Aprobado' : 'Rechazado'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
