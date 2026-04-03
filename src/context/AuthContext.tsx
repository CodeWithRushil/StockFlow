import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { User, UserRole } from '@/types';
import { mockUser } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('ims_user');
    return stored ? JSON.parse(stored) : null;
  });
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('ims_user');
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (user) {
      timerRef.current = setTimeout(logout, INACTIVITY_TIMEOUT);
    }
  }, [user, logout]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  const login = async (email: string, _password: string) => {
    // Mock login - replace with actual API call to your Express backend
    // POST /api/auth/login { email, password }
    const loggedInUser = { ...mockUser, email };
    setUser(loggedInUser);
    localStorage.setItem('ims_user', JSON.stringify(loggedInUser));
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
