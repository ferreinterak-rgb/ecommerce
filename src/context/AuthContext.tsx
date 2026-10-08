import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isCollaborator: boolean;
  isCustomer: boolean;
  setDemoRole: (role: UserRole) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicializa con sesión real si existe, o null
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ferre_current_user');
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const u = await authService.getCurrentUser();
        if (u) {
          setUser(u);
        }
      } catch (e) {
        console.error('Error initializing auth', e);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const setDemoRole = (newRole: UserRole) => {
    localStorage.setItem('ferre_demo_role', newRole);
    const targetUser: UserProfile = {
      id: `usr-${newRole}`,
      email: `${newRole}@ferreinter.com`,
      full_name: newRole === 'admin' ? 'Administrador' : newRole === 'collaborator' ? 'Colaborador' : 'Cliente',
      role: newRole,
      created_at: new Date().toISOString()
    };
    setUser(targetUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ferre_current_user', JSON.stringify(targetUser));
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ferre_current_user');
      localStorage.removeItem('ferre_demo_role');
    }
  };

  const role = user?.role || 'customer';
  const isAdmin = role === 'admin';
  const isCollaborator = role === 'collaborator' || role === 'admin';
  const isCustomer = role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isCollaborator,
        isCustomer,
        setDemoRole,
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
