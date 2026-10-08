import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../../types';
import { authService } from '../../services/authService';
import { Users, Shield, UserCheck, ShieldAlert } from 'lucide-react';

export const TeamManagementView: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      const data = await authService.getAllUsers();
      setTeamMembers(data);
      setLoading(false);
    };
    fetchTeam();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    await authService.updateUserRole(userId, newRole);
    setTeamMembers(prev => prev.map(m => m.id === userId ? { ...m, role: newRole } : m));
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Gestión de Equipo & Permisos</h2>
        <p className="text-xs text-gray-500 mt-1">Asigna roles de Administrador, Colaborador o Cliente a los miembros del sistema.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500 mt-2 font-medium">Cargando usuarios...</p>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-3">
            <Users className="w-12 h-12 mx-auto text-gray-300 stroke-[1.5]" />
            <p className="font-bold text-slate-800 text-sm">No hay usuarios registrados aún en el sistema</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Cuando los usuarios creen cuentas o inicien sesión a través de Supabase Auth, aparecerán aquí para gestionar sus permisos comerciales.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#031834] text-white uppercase font-bold text-[10px]">
              <tr>
                <th className="p-4">Usuario / Colaborador</th>
                <th className="p-4">Email</th>
                <th className="p-4">Teléfono</th>
                <th className="p-4">Rol Asignado</th>
                <th className="p-4 text-center">Acciones de Permisos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.full_name}
                        className="w-9 h-9 rounded-full object-cover border border-[#f48f25]"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                        {(member.full_name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{member.full_name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">ID: {member.id}</span>
                    </div>
                  </td>

                  <td className="p-4 font-medium text-slate-700">{member.email}</td>
                  <td className="p-4 text-gray-500">{member.phone || 'No registrado'}</td>

                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      member.role === 'admin'
                        ? 'bg-[#f48f25]/20 text-[#d97706] border border-[#f48f25]'
                        : member.role === 'collaborator'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {member.role}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                      className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 font-bold text-xs focus:border-[#f48f25] focus:outline-none cursor-pointer"
                    >
                      <option value="admin">Administrador (Control Total)</option>
                      <option value="collaborator">Colaborador (Ventas / Kanban)</option>
                      <option value="customer">Cliente (Solo Compras)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
