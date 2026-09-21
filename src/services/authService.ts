import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'usr-admin-1',
    email: 'admin@ferreinter.com',
    full_name: 'Ing. Alejandro Silva',
    phone: '+57 300 123 4567',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    created_at: new Date().toISOString()
  },
  {
    id: 'usr-collab-1',
    email: 'colaborador@ferreinter.com',
    full_name: 'Dra. Patricia Ortiz (Ventas Industriales)',
    phone: '+57 312 987 6543',
    role: 'collaborator',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    created_at: new Date().toISOString()
  },
  {
    id: 'usr-cust-1',
    email: 'cliente@gmail.com',
    full_name: 'Santiago Ramirez',
    phone: '+57 318 555 1234',
    role: 'customer',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    created_at: new Date().toISOString()
  }
];

export const authService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
          if (profile) return profile as UserProfile;
        }
      } catch (e) {
        console.warn('Supabase auth get user error', e);
      }
    }
    // Return saved demo user or default admin
    const savedRole = localStorage.getItem('ferre_demo_role') as UserRole || 'admin';
    return MOCK_USERS.find(u => u.role === savedRole) || MOCK_USERS[0];
  },

  async getAllUsers(): Promise<UserProfile[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('user_profiles').select('*');
        if (data && data.length > 0) return data as UserProfile[];
      } catch (e) {
        console.warn('Supabase fetch users error', e);
      }
    }
    return MOCK_USERS;
  },

  async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('user_profiles').update({ role: newRole }).eq('id', userId);
      } catch (e) {
        console.warn('Supabase update role error', e);
      }
    }
    const target = MOCK_USERS.find(u => u.id === userId);
    if (target) {
      target.role = newRole;
      return true;
    }
    return false;
  }
};
