import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { authService, MOCK_USERS } from '../services/authService';

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
  const [user, setUser] = useState<UserProfile | null>(MOCK_USERS[0]); // Default to admin for demo rich features
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const u = await authService.getCurrentUser();
        if (u) setUser(u);
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
    const targetUser = MOCK_USERS.find(u => u.role === newRole) || {
      id: `usr-${newRole}`,
      email: `demo.${newRole}@ferreinter.com`,
      full_name: `Usuario Demo (${newRole.toUpperCase()})`,
      role: newRole,
      created_at: new Date().toISOString()
    };
    setUser(targetUser);
  };

  const logout = () => {
    setUser(null);
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
