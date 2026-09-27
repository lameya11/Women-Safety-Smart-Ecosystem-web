import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, AppSettings } from '../types';
import { storage } from '../utils/storage';
import { authApi, ApiError } from '../utils/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  backendAvailable: boolean;
}

const defaultSettings: AppSettings = {
  notifications: true,
  darkMode: false,
  locationSharing: true,
  shakeDetection: true,
  autoSOSOnMissedCheckIn: true,
  checkInInterval: 30,
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [backendAvailable, setBackendAvailable] = useState(false);

  // Save token for api.ts to pick up
  const persistToken = (t: string | null) => {
    setToken(t);
    if (t) localStorage.setItem('shesafe_token', t);
    else localStorage.removeItem('shesafe_token');
  };

  const persistUser = (u: User | null) => {
    setUser(u);
    storage.set('user', u);
  };

  useEffect(() => {
    const savedUser = storage.get<User | null>('user', null);
    const savedToken = localStorage.getItem('shesafe_token');
    const savedSettings = storage.get<AppSettings>('settings', defaultSettings);
    setSettings({ ...defaultSettings, ...savedSettings });
    if (savedSettings.darkMode) document.documentElement.classList.add('dark');

    if (savedToken) {
      setToken(savedToken);
      // Re-validate token against backend
      authApi.me()
        .then(apiUser => {
          const u: User = { id: apiUser.id, email: apiUser.email, name: apiUser.name, phone: apiUser.phone, createdAt: apiUser.createdAt };
          persistUser(u);
          setBackendAvailable(true);
        })
        .catch((err: ApiError) => {
          if (err.status === 401) {
            // Token expired — clear session
            persistToken(null);
            persistUser(null);
          } else {
            // Backend unreachable — use cached user
            if (savedUser) setUser(savedUser);
          }
        })
        .finally(() => setIsLoading(false));
    } else if (savedUser) {
      setUser(savedUser);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    // Try backend first
    try {
      const resp = await authApi.login(email, password);
      persistToken(resp.token);
      const u: User = { id: resp.user.id, email: resp.user.email, name: resp.user.name, phone: resp.user.phone, createdAt: resp.user.createdAt };
      persistUser(u);
      setBackendAvailable(true);
      return;
    } catch (err) {
      if (err instanceof ApiError && err.status !== 0) throw new Error(err.message);
      // Backend unreachable — fall through to localStorage
    }

    // localStorage fallback
    const users = storage.get<User[]>('registered_users', []);
    const passwords = storage.get<Record<string, string>>('passwords', {});
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) throw new Error('No account found with this email address.');
    if (passwords[found.id] !== btoa(password)) throw new Error('Incorrect password.');
    persistUser(found);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone?: string): Promise<void> => {
    // Try backend first
    try {
      const resp = await authApi.register(name, email, password, phone);
      persistToken(resp.token);
      const u: User = { id: resp.user.id, email: resp.user.email, name: resp.user.name, phone: resp.user.phone, createdAt: resp.user.createdAt };
      persistUser(u);
      setBackendAvailable(true);
      return;
    } catch (err) {
      if (err instanceof ApiError && err.status !== 0) throw new Error(err.message);
      // Backend unreachable — fall through to localStorage
    }

    // localStorage fallback
    const users = storage.get<User[]>('registered_users', []);
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      name,
      phone,
      createdAt: new Date().toISOString(),
    };
    const passwords = storage.get<Record<string, string>>('passwords', {});
    passwords[newUser.id] = btoa(password);
    storage.set('registered_users', [...users, newUser]);
    storage.set('passwords', passwords);
    persistUser(newUser);
  }, []);

  const logout = () => {
    persistToken(null);
    persistUser(null);
  };

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    persistUser(updated);
    // Fire-and-forget backend sync
    if (token) {
      authApi.updateProfile({ name: updates.name, phone: updates.phone }).catch(() => {});
    }
    const users = storage.get<User[]>('registered_users', []);
    const idx = users.findIndex(u => u.id === updated.id);
    if (idx >= 0) { users[idx] = updated; storage.set('registered_users', users); }
  }, [user, token]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    storage.set('settings', updated);
    if ('darkMode' in updates) {
      if (updates.darkMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser, settings, updateSettings, backendAvailable }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
