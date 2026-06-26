import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, XCircle, CheckCircle, Send } from 'lucide-react';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface SellerRequest {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  reason: string | null;
  created_at: string;
}

export function RequestSellerPage({ setPage }: { setPage: (page: string) => void }) {
  const { user } = useAuth();
  const [request, setRequest] = useState<SellerRequest | null | undefined>(undefined);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('seller_requests')
      .select('id, status, reason, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        setRequest(data as SellerRequest | null);
        if (data?.status === 'approved') setPage('publish');
      });
  }, [user, setPage]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !reason.trim()) return;
    setSubmitting(true);
    setError('');

    let err;
    if (request) {
      ({ error: err } = await supabase
        .from('seller_requests')
        .update({ reason: reason.trim(), status: 'pending', updated_at: new Date().toISOString() })
        .eq('id', request.id));
    } else {
      ({ error: err } = await supabase
        .from('seller_requests')
        .insert({ user_id: user.id, reason: reason.trim() }));
    }

    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      setRequest({ ...(request ?? { id: 0, reason: null, created_at: '' }), status: 'pending', reason: reason.trim() });
    }
    setSubmitting(false);
  }

  const pending = request?.status === 'pending';
  const rejected = request?.status === 'rejected';
  const showForm = !pending && !success;

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-10">
        <button
          onClick={() => setPage('home')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white mb-8 transition"
        >
          <ArrowLeft size={18} /> Volver al inicio
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Conviértete en vendedor
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
            Para publicar cartas en Conecta TCG necesitas activar tu cuenta de vendedor.
            Un administrador revisará tu solicitud.
          </p>

          {(pending || success) && (
            <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-6">
              <Clock size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-800 dark:text-blue-300 text-sm">
                  Tu solicitud está siendo revisada
                </p>
                <p className="text-blue-600 dark:text-blue-400 text-xs mt-0.5">
                  Te notificaremos cuando un administrador la apruebe.
                </p>
              </div>
            </div>
          )}

          {rejected && (
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6">
              <XCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-300 text-sm">
                  Tu solicitud anterior fue rechazada
                </p>
                <p className="text-red-600 dark:text-red-400 text-xs mt-0.5">
                  Puedes enviar una nueva solicitud con más detalles.
                </p>
              </div>
            </div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  ¿Por qué quieres vender en Conecta TCG?
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={5}
                  placeholder="Cuéntanos sobre tu colección, experiencia vendiendo cartas, o qué tipo de productos planeas ofrecer..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting || !reason.trim()}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl px-6 py-3 transition"
              >
                <Send size={16} />
                {submitting ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </form>
          )}

          {success && !pending && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm mt-4">
              <CheckCircle size={16} />
              Solicitud enviada correctamente.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
