'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authClient } from './auth-client';
import { apiClient } from './api-client';
import { shouldPreferStoredBackendSession } from './auth-helpers';

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

  const { data: session, isPending: sessionLoading } = authClient.useSession();

  useEffect(() => {
    const savedToken = localStorage.getItem('campusflow_token');
    const savedUser = localStorage.getItem('campusflow_user');

    // Preserve backend /auth/login session (with campus_admin / merchant roles) over stale Better Auth cookies
    if (shouldPreferStoredBackendSession(savedToken, savedUser) && savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as UserSession;
        setToken(savedToken);
        setUser(parsedUser);
        setIsLoading(false);

        // Refresh live roles from /auth/me (e.g. after System Admin approves merchant shop)
        apiClient<{
          id: string;
          displayName: string;
          email: string | null;
          phone: string | null;
          roles: string[];
        }>('/auth/me')
          .then((fresh) => {
            if (fresh && fresh.id === parsedUser.id && Array.isArray(fresh.roles)) {
              const updated: UserSession = {
                id: fresh.id,
                displayName: fresh.displayName,
                email: fresh.email,
                phone: fresh.phone,
                roles: fresh.roles,
              };
              setUser(updated);
              localStorage.setItem('campusflow_user', JSON.stringify(updated));
            }
          })
          .catch(() => null);
        return;
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }

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

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    } else {
      setToken(null);
      setUser(null);
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
    } catch {
      // Ignore client signout errors if local only
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
