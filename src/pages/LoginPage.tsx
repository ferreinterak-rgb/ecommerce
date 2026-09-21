import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Wrench, Shield, ArrowRight, Lock, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setDemoRole } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('admin@ferreinter.com');
  const [password, setPassword] = useState('••••••••••••');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoRole(selectedRole);
    if (selectedRole === 'admin' || selectedRole === 'collaborator') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#010e21] flex items-center justify-center p-4 relative overflow-hidden text-white">
      {/* Background glow elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#f48f25]/15 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[#031834]/90 backdrop-blur-xl p-8 rounded-3xl border border-[#f48f25]/30 shadow-2xl space-y-6 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#f48f25] flex items-center justify-center text-black font-black shadow-lg shadow-[#f48f25]/30">
            <Wrench className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white">
            FERRE <span className="text-[#f48f25]">INTER</span>
          </h1>
          <p className="text-xs text-gray-400">Acceso al Sistema E-Commerce & Administración</p>
        </div>

        {/* Demo Role Selector */}
        <div className="space-y-2">
          <label className="block text-[11px] font-mono uppercase text-[#f48f25] font-bold text-center">
            Seleccionar Perfil / Rol para Demo:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'admin', label: 'Admin', email: 'admin@ferreinter.com' },
              { id: 'collaborator', label: 'Colaborador', email: 'colaborador@ferreinter.com' },
              { id: 'customer', label: 'Cliente', email: 'cliente@gmail.com' }
            ].map((r) => (
              <button
                type="button"
                key={r.id}
                onClick={() => {
                  setSelectedRole(r.id as UserRole);
                  setEmail(r.email);
                }}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition-all border ${
                  selectedRole === r.id
                    ? 'bg-[#f48f25] text-black border-[#f48f25] shadow-md'
                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-300 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 text-white rounded-xl border border-white/15 p-3 focus:outline-none focus:border-[#f48f25]"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-300 mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 text-white rounded-xl border border-white/15 p-3 focus:outline-none focus:border-[#f48f25]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#f48f25] text-black font-extrabold text-sm hover:bg-[#d97706] transition-all shadow-lg shadow-[#f48f25]/30 flex items-center justify-center gap-2"
          >
            Ingresar al Sistema <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[11px] text-gray-400">
            Modo demostración activo. Puedes probar cualquier rol directamente.
          </p>
        </div>

      </div>
    </div>
  );
};
