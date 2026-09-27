import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AppSettings } from '../types';
import { storage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
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
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    // Restore session from localStorage
    const savedUser = storage.get<User | null>('user', null);
    const savedSettings = storage.get<AppSettings>('settings', defaultSettings);
    if (savedUser) setUser(savedUser);
    setSettings({ ...defaultSettings, ...savedSettings });

    // Apply dark mode
    if (savedSettings.darkMode) {
      document.documentElement.classList.add('dark');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // Check local registered users
    const users = storage.get<User[]>('registered_users', []);
    const passwords = storage.get<Record<string, string>>('passwords', {});

    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) throw new Error('No account found with this email address.');
    if (passwords[found.id] !== btoa(password)) throw new Error('Incorrect password.');

    setUser(found);
    storage.set('user', found);
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    const users = storage.get<User[]>('registered_users', []);
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error('An account with this email already exists.');

    const newUser: User = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      name,
      createdAt: new Date().toISOString(),
    };

    const passwords = storage.get<Record<string, string>>('passwords', {});
    passwords[newUser.id] = btoa(password);

    storage.set('registered_users', [...users, newUser]);
    storage.set('passwords', passwords);
    storage.set('user', newUser);
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    storage.remove('user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    storage.set('user', updated);

    // Also update in registered users list
    const users = storage.get<User[]>('registered_users', []);
    const idx = users.findIndex(u => u.id === updated.id);
    if (idx >= 0) {
      users[idx] = updated;
      storage.set('registered_users', users);
    }
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    storage.set('settings', updated);

    if ('darkMode' in updates) {
      if (updates.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser, settings, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
