import React from 'react';
import { LayoutDashboard, PackagePlus, ShoppingBag, Users, History, Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FerreInterLogo } from '../FerreInterLogo';

export type AdminTab = 'analytics' | 'products' | 'orders' | 'team' | 'logs';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, role, setDemoRole } = useAuth();

  const NAV_ITEMS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'analytics', label: 'Métricas & KPIs', icon: LayoutDashboard },
    { id: 'orders', label: 'Tablero Kanban Pedidos', icon: ShoppingBag },
    { id: 'products', label: 'Gestión de Productos', icon: PackagePlus },
    { id: 'team', label: 'Equipo & Permisos', icon: Users },
    { id: 'logs', label: 'Auditoría & Logs', icon: History }
  ];

  return (
    <aside className="w-full lg:w-64 bg-white text-slate-900 p-6 border-r border-gray-200 flex flex-col justify-between shrink-0 shadow-sm">
      <div>
        {/* Top Header */}
        <div className="pb-6 mb-6 border-b border-gray-100">
          <Link to="/" className="block">
            <FerreInterLogo size="sm" />
          </Link>
          <span className="inline-block text-[9px] font-mono font-bold text-[#f48f25] uppercase tracking-wider mt-2">
            PANEL DE CONTROL ADMIN
          </span>
        </div>

        {/* User Profile Box */}
        <div className="mb-6 p-3 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center gap-3">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
            alt="User"
            className="w-10 h-10 rounded-full object-cover border border-[#f48f25]"
          />
          <div className="overflow-hidden">
            <p className="font-extrabold text-xs text-slate-900 truncate">{user?.full_name}</p>
            <span className="inline-block text-[9px] font-black text-black bg-[#f48f25] px-2 py-0.5 rounded-full uppercase mt-0.5">
              {role}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
                  isActive
                    ? 'bg-[#111111] text-white shadow-md font-black'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#f48f25]' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Return Link & Role Switcher */}
      <div className="pt-6 border-t border-gray-100 space-y-3">
        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-[10px]">
          <p className="text-gray-500 font-bold mb-1">Simular Vista de Rol:</p>
          <div className="flex gap-1">
            <button
              onClick={() => setDemoRole('admin')}
              className={`flex-1 py-1 rounded-lg font-bold ${role === 'admin' ? 'bg-[#111111] text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Admin
            </button>
            <button
              onClick={() => setDemoRole('collaborator')}
              className={`flex-1 py-1 rounded-lg font-bold ${role === 'collaborator' ? 'bg-[#111111] text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Colab
            </button>
            <button
              onClick={() => setDemoRole('customer')}
              className={`flex-1 py-1 rounded-lg font-bold ${role === 'customer' ? 'bg-[#111111] text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Cliente
            </button>
          </div>
        </div>

        <Link
          to="/"
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-slate-900 text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a la Tienda
        </Link>
      </div>
    </aside>
  );
};
