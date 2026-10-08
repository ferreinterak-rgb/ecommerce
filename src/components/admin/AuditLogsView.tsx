import React, { useState, useEffect } from 'react';
import { ActivityLog } from '../../types';
import { activityLogService } from '../../services/activityLogService';
import { History, Shield, Clock, FileText } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const data = await activityLogService.getLogs();
      setLogs(data);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Registro de Auditoría (Audit Logs)</h2>
        <p className="text-xs text-gray-500 mt-1">Historial cronológico de cambios de inventario, pedidos y permisos en la plataforma.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500 mt-2 font-medium">Cargando registros...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-3">
            <History className="w-12 h-12 mx-auto text-gray-300 stroke-[1.5]" />
            <p className="font-bold text-slate-800 text-sm">No hay registros de auditoría aún</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Las acciones administrativas, como creación de productos, ajustes masivos o cambios de estado de pedidos se registrarán aquí automáticamente.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#031834] text-white uppercase font-bold text-[10px]">
              <tr>
                <th className="p-4">Fecha & Hora</th>
                <th className="p-4">Usuario</th>
                <th className="p-4">Acción Realizada</th>
                <th className="p-4">Entidad Afectada</th>
                <th className="p-4">Detalles Técnicos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4 font-mono text-gray-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>

                  <td className="p-4 font-bold text-slate-900">{log.user_name}</td>

                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-[#f48f25]/15 text-[#d97706] font-bold text-[10px] uppercase">
                      {log.action}
                    </span>
                  </td>

                  <td className="p-4 font-semibold text-slate-800">
                    {log.entity} <span className="font-mono text-gray-400">({log.entity_id})</span>
                  </td>

                  <td className="p-4 text-gray-600 max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
