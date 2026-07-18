import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../shared/ttsq-api';
import type { User } from '../shared/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, birthday?: string | null, gender?: string | null) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({} as AuthState);
const STORAGE_KEY = 'ttsq_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persist = useCallback(async (u: User | null) => {
    setUser(u);
    if (u) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setUser(JSON.parse(raw) as User);
      } catch { /* ignore */ }
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const u = await api.auth.login(username.trim(), password);
    await persist({
      id: u.id, username: u.username, role: u.role as any, isSuperAdmin: !!u.isSuperAdmin,
      createdAt: u.createdAt, birthday: u.birthday ?? null, gender: u.gender ?? null,
      bio: u.bio ?? null, avatar: u.avatar ?? null,
    });
  }, [persist]);

  const register = useCallback(async (username: string, password: string, birthday?: string | null, gender?: string | null) => {
    const res = await api.users.create(username.trim(), password, 'user', birthday, gender);
    await persist({
      id: res.user.id, username: res.user.username, role: res.user.role as any,
      isSuperAdmin: !!res.user.isSuperAdmin, createdAt: res.user.createdAt,
    });
  }, [persist]);

  const logout = useCallback(async () => { await persist(null); }, [persist]);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const u = await api.users.getById(user.id);
      await persist({
        id: u.id, username: u.username, role: u.role, isSuperAdmin: u.is_super_admin === 1,
        createdAt: u.created_at, birthday: u.birthday ?? null, gender: u.gender ?? null,
        bio: u.bio ?? null, avatar: u.avatar ?? null,
        statusType: u.status_type ?? null, statusText: u.status_text ?? null,
      });
    } catch { /* ignore */ }
  }, [user, persist]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
