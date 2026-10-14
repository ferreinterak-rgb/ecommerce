import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { FerreInterLogo } from '../components/FerreInterLogo';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/admin');
    } else {
      setErrorMessage(res.error || 'Credenciales no autorizadas en Supabase.');
    }
  };

  return (
    <div className="min-h-screen bg-[#010e21] flex items-center justify-center p-4 relative overflow-hidden text-white">
      {/* Background glow elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#f48f25]/15 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[#031834]/95 backdrop-blur-xl p-8 rounded-3xl border border-[#f48f25]/30 shadow-2xl space-y-6 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <FerreInterLogo size="md" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono uppercase tracking-wider">
            <Lock className="w-3 h-3 text-red-400" />
            <span>Acceso Privado &bull; Solo Autorizados</span>
          </div>
          <p className="text-xs text-gray-400">
            Ingresa con las credenciales registradas en Supabase para gestionar la administración.
          </p>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form con Supabase Auth */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-300 mb-1">Correo Electrónico Autorizado</label>
            <input
              type="email"
              required
              placeholder="tu-correo@dominio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 text-white placeholder-gray-500 rounded-xl border border-white/15 p-3 focus:outline-none focus:border-[#f48f25] transition-colors"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-300 mb-1">Contraseña</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 text-white placeholder-gray-500 rounded-xl border border-white/15 p-3 focus:outline-none focus:border-[#f48f25] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#f48f25] text-black font-extrabold text-sm hover:bg-[#d97706] disabled:opacity-50 transition-all shadow-lg shadow-[#f48f25]/30 flex items-center justify-center gap-2"
          >
            {loading ? 'Verificando Credenciales...' : 'Iniciar Sesión'}
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
          <Link to="/" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Volver a la Tienda
          </Link>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Supabase Auth</span>
          </div>
        </div>

      </div>
    </div>
  );
};
