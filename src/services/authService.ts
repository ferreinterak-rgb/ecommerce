import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_USERS_KEY = 'ferre_users_store_v1';

const getStoredUsers = (): UserProfile[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_USERS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (_) {}
  }
  return [];
};

let localUsersStore: UserProfile[] = getStoredUsers();

export const authService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (profile) {
            return {
              id: profile.id,
              email: profile.email || user.email || '',
              full_name: profile.full_name || 'Usuario FERREINTER',
              role: profile.role || 'customer',
              phone: profile.phone,
              avatar_url: profile.avatar_url,
              created_at: profile.created_at || new Date().toISOString()
            };
          }
        }
      } catch (e) {
        console.warn('Supabase auth get user error', e);
      }
    }

    // Si hay una sesión guardada en localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedSession = localStorage.getItem('ferre_current_user');
        if (savedSession) return JSON.parse(savedSession);
      } catch (_) {}
    }

    return null;
  },

  async getAllUsers(): Promise<UserProfile[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('profiles').select('*');
        if (data && data.length > 0) {
          return data.map((p: any) => ({
            id: p.id,
            email: p.email || '',
            full_name: p.full_name || 'Usuario',
            role: p.role || 'customer',
            phone: p.phone,
            avatar_url: p.avatar_url,
            created_at: p.created_at || new Date().toISOString()
          }));
        }
      } catch (e) {
        console.warn('Supabase fetch users error', e);
      }
    }
    return localUsersStore;
  },

  async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      } catch (e) {
        console.warn('Supabase update role error', e);
      }
    }
    const target = localUsersStore.find(u => u.id === userId);
    if (target) {
      target.role = newRole;
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsersStore));
      }
      return true;
    }
    return false;
  }
};
