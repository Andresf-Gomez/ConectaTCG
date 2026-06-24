import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  setPage: (page: string) => void;
  redirectTo?: string | null;
}

export function LoginPage({ setPage, redirectTo }: LoginPageProps) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setError('');
    setSuccess('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setPage(redirectTo ?? 'home');
    }
  }

  async function handleSignUp() {
    setError('');
    setSuccess('');
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setSuccess('¡Cuenta creada! Revisa tu correo para confirmar tu cuenta.');
    }
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
        <h2 className="text-3xl font-black text-slate-950">Ingresar</h2>
        <p className="text-slate-600 mt-2">
          Accede para comprar, vender y consultar tu historial.
        </p>
        <div className="grid gap-3 mt-6">
          <input
            className="border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
            placeholder="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <input
            className="border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>
        )}
        {success && (
          <p className="mt-3 text-sm text-green-600 bg-green-50 rounded-xl p-3">{success}</p>
        )}
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="mt-5 w-full px-5 py-4 rounded-2xl bg-blue-600 text-white font-black disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Ingresar'}
        </button>
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="mt-3 w-full px-5 py-4 rounded-2xl bg-yellow-400 text-slate-900 font-black disabled:opacity-50"
        >
          Crear cuenta
        </button>
      </div>
    </Layout>
  );
}
