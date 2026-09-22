import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './api';

import Login    from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SOSPage  from './pages/SOSPage';
import Contacts from './pages/Contacts';
import Reports  from './pages/Reports';
import Profile  from './pages/Profile';
import TopNav   from './components/TopNav';
import BottomNav from './components/BottomNav';

// ── Auth Context ──────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);
export function useAuth() { return useContext(AuthCtx); }

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sg_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(!!localStorage.getItem('sg_token'));

  useEffect(() => {
    const token = localStorage.getItem('sg_token');
    if (!token) { setLoading(false); return; }
    authAPI.me()
      .then(r => { setUser(r.data); localStorage.setItem('sg_user', JSON.stringify(r.data)); })
      .catch(() => { localStorage.removeItem('sg_token'); localStorage.removeItem('sg_user'); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const r = await authAPI.login({ email, password });
    localStorage.setItem('sg_token', r.data.token);
    localStorage.setItem('sg_user', JSON.stringify(r.data.user));
    setUser(r.data.user);
    return r.data.user;
  }, []);

  const register = useCallback(async (data) => {
    const r = await authAPI.register(data);
    localStorage.setItem('sg_token', r.data.token);
    localStorage.setItem('sg_user', JSON.stringify(r.data.user));
    setUser(r.data.user);
    return r.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sg_token');
    localStorage.removeItem('sg_user');
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

// ── Protected wrapper ─────────────────────────────────────────────────────────
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100dvh' }}>
      <div className="spinner" style={{ width:36, height:36 }} />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

// ── App shell with nav ────────────────────────────────────────────────────────
function Shell({ children }) {
  return (
    <>
      <TopNav />
      {children}
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Protected><Shell><Dashboard /></Shell></Protected>} />
          <Route path="/sos" element={<Protected><Shell><SOSPage /></Shell></Protected>} />
          <Route path="/contacts" element={<Protected><Shell><Contacts /></Shell></Protected>} />
          <Route path="/reports"  element={<Protected><Shell><Reports /></Shell></Protected>} />
          <Route path="/profile"  element={<Protected><Shell><Profile /></Shell></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
