import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SafetyProvider } from './context/SafetyContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { MapPage } from './pages/MapPage';
import { SafetyCheckPage } from './pages/SafetyCheckPage';
import { SOSPage } from './pages/SOSPage';
import { ContactsPage } from './pages/ContactsPage';
import { TravelSafetyPage } from './pages/TravelSafetyPage';
import { FakeCallPage } from './pages/FakeCallPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { DemoPage } from './pages/DemoPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
      <Route path="/safety-check" element={<ProtectedRoute><SafetyCheckPage /></ProtectedRoute>} />
      <Route path="/sos" element={<ProtectedRoute><SOSPage /></ProtectedRoute>} />
      <Route path="/contacts" element={<ProtectedRoute><ContactsPage /></ProtectedRoute>} />
      <Route path="/travel" element={<ProtectedRoute><TravelSafetyPage /></ProtectedRoute>} />
      <Route path="/fake-call" element={<ProtectedRoute><FakeCallPage /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/demo" element={<ProtectedRoute><DemoPage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SafetyProvider>
          <AppRoutes />
        </SafetyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
