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
  /**
   * Inicio de sesión real y seguro contra Supabase Auth
   */
  async signIn(email: string, password: string): Promise<{ user: UserProfile | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error || !data.user) {
        return {
          user: null,
          error: error?.message === 'Invalid login credentials' 
            ? 'Credenciales incorrectas. Verifica tu correo y contraseña.' 
            : (error?.message || 'Error al iniciar sesión.')
        };
      }

      // Obtener el perfil del usuario autenticado en Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const userProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email || email,
        full_name: profile?.full_name || data.user.user_metadata?.full_name || 'Administrador FERREINTER',
        role: (profile?.role as UserRole) || 'admin',
        phone: profile?.phone || data.user.phone,
        avatar_url: profile?.avatar_url,
        created_at: data.user.created_at
      };

      return { user: userProfile, error: null };
    } catch (err: any) {
      console.error('Error in authService.signIn:', err);
      return { user: null, error: err.message || 'Error de conexión con el servicio de autenticación.' };
    }
  },

  /**
   * Cerrar sesión en Supabase y destruir token
   */
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Error signing out from Supabase:', e);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ferre_current_user');
      localStorage.removeItem('ferre_demo_role');
    }
  },

  /**
   * Obtiene la sesión actual verificada por Supabase
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const user = session.user;
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          return {
            id: user.id,
            email: user.email || '',
            full_name: profile?.full_name || user.user_metadata?.full_name || 'Administrador FERREINTER',
            role: (profile?.role as UserRole) || 'admin',
            phone: profile?.phone || user.phone,
            avatar_url: profile?.avatar_url,
            created_at: user.created_at
          };
        }
      } catch (e) {
        console.warn('Supabase auth get user error', e);
      }
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
