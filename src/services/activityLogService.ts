import { ActivityLog } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_LOGS_KEY = 'ferre_local_activity_logs_v1';

const getInitialLogs = (): ActivityLog[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LOCAL_LOGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
  }
  return [];
};

let localLogs: ActivityLog[] = getInitialLogs();

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

  async logAction(action: string, entity: string, entityId?: string, details?: string, userName: string = 'Admin'): Promise<void> {
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
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(localLogs.slice(0, 100)));
      } catch (_) {}
    }
  }
};
