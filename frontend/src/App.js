// src/App.js
// Main application router and layout
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Pages
import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import SafetyMap from './pages/SafetyMap';
import SOSPage from './pages/SOSPage';
import TrustedContacts from './pages/TrustedContacts';
import TravelSafety from './pages/TravelSafety';
import SafetyReports from './pages/SafetyReports';
import AlertHistory from './pages/AlertHistory';
import SettingsPage from './pages/SettingsPage';
import DemoMode from './pages/DemoMode';

// Components
import BottomNav from './components/BottomNav';
import TopNav from './components/TopNav';
import EmergencyCountdown from './components/EmergencyCountdown';
import SOSOverlay from './components/SOSOverlay';
import FakeCallScreen from './components/FakeCallScreen';
import NotificationToast from './components/NotificationToast';

function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useApp();
  if (authLoading) return <SplashScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppLayout({ children }) {
  const { isAuthenticated, activeSos, countdownActive, currentStatus } = useApp();
  const [showFakeCall, setShowFakeCall] = useState(false);

  // Expose fake call trigger globally
  useEffect(() => {
    window._triggerFakeCall = () => setShowFakeCall(true);
    return () => { window._triggerFakeCall = null; };
  }, []);

  return (
    <div className="app-container">
      {isAuthenticated && <TopNav onFakeCall={() => setShowFakeCall(true)} />}
      <main className="main-content">
        {children}
      </main>
      {isAuthenticated && <BottomNav />}
      {countdownActive && <EmergencyCountdown />}
      {activeSos && currentStatus === 'SOS' && <SOSOverlay onFakeCall={() => setShowFakeCall(true)} />}
      {showFakeCall && <FakeCallScreen onClose={() => setShowFakeCall(false)} />}
      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/map" element={
              <ProtectedRoute><SafetyMap /></ProtectedRoute>
            } />
            <Route path="/sos" element={
              <ProtectedRoute><SOSPage /></ProtectedRoute>
            } />
            <Route path="/contacts" element={
              <ProtectedRoute><TrustedContacts /></ProtectedRoute>
            } />
            <Route path="/travel" element={
              <ProtectedRoute><TravelSafety /></ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute><SafetyReports /></ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute><AlertHistory /></ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute><SettingsPage /></ProtectedRoute>
            } />
            <Route path="/demo" element={
              <ProtectedRoute><DemoMode /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppProvider>
  );
}
