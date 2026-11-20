'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authClient } from './auth-client';

export interface UserSession {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  roles: string[];
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  login: (token: string, user: UserSession) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: async () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync with Better Auth session
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        displayName: session.user.name || 'Student User',
        email: session.user.email || null,
        phone: (session.user as { phone?: string }).phone || null,
        roles: ['student'],
      });
      setToken(session.session?.token || 'better-auth-session');
      setIsLoading(false);
      return;
    }

    // Fallback: check localStorage for legacy or dev sessions
    const savedToken = localStorage.getItem('campusflow_token');
    const savedUser = localStorage.getItem('campusflow_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    setIsLoading(sessionLoading);
  }, [session, sessionLoading]);

  const login = (newToken: string, newUser: UserSession) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('campusflow_token', newToken);
    localStorage.setItem('campusflow_user', JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      await authClient.signOut();
    } catch (e) {
      // ignore client signout errors if local only
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('campusflow_token');
    localStorage.removeItem('campusflow_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
