import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isCollaborator: boolean;
  isCustomer: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Cargar usuario verificado por token en Supabase
    const initAuth = async () => {
      try {
        const u = await authService.getCurrentUser();
        setUser(u);
      } catch (e) {
        console.error('Error initializing auth', e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error: string | null }> => {
    setLoading(true);
    const { user: authedUser, error } = await authService.signIn(email, password);
    setLoading(false);

    if (error || !authedUser) {
      return { success: false, error: error || 'Error de autenticación' };
    }

    setUser(authedUser);
    return { success: true, error: null };
  };

  const logout = async () => {
    setLoading(true);
    await authService.signOut();
    setUser(null);
    setLoading(false);
  };

  const role = user?.role || 'customer';
  const isAdmin = Boolean(user && role === 'admin');
  const isCollaborator = Boolean(user && (role === 'collaborator' || role === 'admin'));
  const isCustomer = !user || role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isCollaborator,
        isCustomer,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
