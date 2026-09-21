import { ActivityLog } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const MOCK_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    user_name: 'Ing. Alejandro Silva',
    action: 'Actualización de Inventario',
    entity: 'Producto',
    entity_id: 'DCD996B-20V',
    details: 'Aumentó el stock de DeWalt 20V de 15 a 24 unidades.',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    id: 'log-2',
    user_name: 'Sistema FERRE INTER',
    action: 'Creación de Pedido',
    entity: 'Pedido',
    entity_id: 'FI-89210',
    details: 'Pedido registrado correctamente por un monto de $426.25 USD.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'log-3',
    user_name: 'Dra. Patricia Ortiz',
    action: 'Cambio de Estado de Pedido',
    entity: 'Pedido',
    entity_id: 'FI-89211',
    details: 'Cambió el estado del pedido de "pendiente" a "procesando".',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  }
];

let localLogs: ActivityLog[] = [...MOCK_LOGS];

export const activityLogService = {
  async getLogs(): Promise<ActivityLog[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as ActivityLog[];
      } catch (e) {
        console.warn('Supabase activity logs fetch error', e);
      }
    }
    return localLogs;
  },

  async logAction(action: string, entity: string, entityId?: string, details?: string, userName: string = 'Usuario Logueado'): Promise<void> {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      user_name: userName,
      action,
      entity,
      entity_id: entityId,
      details,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('activity_logs').insert(newLog);
      } catch (e) {
        console.warn('Supabase log insertion error', e);
      }
    }
    localLogs.unshift(newLog);
  }
};
