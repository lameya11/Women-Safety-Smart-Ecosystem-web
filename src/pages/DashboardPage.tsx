import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, Phone, CheckCircle, AlertTriangle, Bell, Settings, Navigation, Zap, Sparkles, Smartphone, Share2, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSafety } from '../context/SafetyContext';
import { BottomNav } from '../components/BottomNav';
import { useShakeDetection } from '../hooks/useShakeDetection';
import type { SafetyStatus } from '../types';

const STATUS_CONFIG: Record<SafetyStatus, { label: string; bg: string; text: string; icon: React.ComponentType<{size?:number;className?:string}>; border: string }> = {
  SAFE: { label: 'SAFE', bg: 'bg-green-500', text: 'text-green-700', icon: CheckCircle, border: 'border-green-200' },
  CAUTION: { label: 'CAUTION', bg: 'bg-amber-400', text: 'text-amber-700', icon: AlertTriangle, border: 'border-amber-200' },
  DANGER: { label: 'DANGER', bg: 'bg-red-500', text: 'text-red-700', icon: AlertTriangle, border: 'border-red-200' },
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, backendAvailable } = useAuth();
  const { safetyStatus, safetyModeActive, toggleSafetyMode, location, locationError, requestLocation, activateSOS, demo, locationShare, startLocationSharing, stopLocationSharing } = useSafety();

  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [shakeAlert, setShakeAlert] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStartRef = useRef<number>(0);
  const HOLD_DURATION = 3000;

  useEffect(() => {
    requestLocation();
  }, []);

  // Shake to trigger safety check
  useShakeDetection({
    enabled: true,
    threshold: 18,
    onShake: useCallback(() => {
      setShakeAlert(true);
      setTimeout(() => {
        setShakeAlert(false);
        navigate('/safety-check');
      }, 1200);
    }, [navigate]),
  });

  const statusCfg = STATUS_CONFIG[safetyStatus];
  const StatusIcon = statusCfg.icon;

  const startHold = useCallback(() => {
    if (sosTriggered) return;
    setIsHolding(true);
    holdStartRef.current = Date.now();
    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);
      if (elapsed >= HOLD_DURATION) {
        clearInterval(holdTimerRef.current!);
        setIsHolding(false);
        setHoldProgress(0);
        setSosTriggered(true);
        activateSOS();
        navigate('/sos');
      }
    }, 50);
  }, [sosTriggered, activateSOS, navigate]);

  const cancelHold = useCallback(() => {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    setIsHolding(false);
    setHoldProgress(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { if (holdTimerRef.current) clearInterval(holdTimerRef.current); }, []);

  const firstName = user?.name?.split(' ')[0] ?? 'User';

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const circumference = 2 * Math.PI * 40; // r=40
  const dashOffset = circumference - (holdProgress / 100) * circumference;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Shield size={22} className="text-pink-600" />
          <span className="font-extrabold text-pink-700 text-lg">SHE SAFE</span>
        </div>
        <div className="flex items-center gap-2">
          {demo.isDemoMode && (
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">DEMO</span>
          )}
          <button onClick={() => navigate('/settings')} className="p-2 rounded-lg hover:bg-gray-100">
            <Settings size={20} className="text-gray-600" />
          </button>
          <button onClick={() => navigate('/history')} className="p-2 rounded-lg hover:bg-gray-100">
            <Bell size={20} className="text-gray-600" />
          </button>
        </div>
      </header>

      {/* Shake detection banner */}
      {shakeAlert && (
        <div className="bg-amber-500 text-white text-center py-2 text-sm font-bold animate-pulse z-50 flex items-center justify-center gap-2">
          <Smartphone size={16} />
          Shake detected! Launching Safety Check…
        </div>
      )}

      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-4">
        {/* Greeting */}
        <div className="fade-in">
          <h2 className="text-xl font-bold text-gray-800">{greeting()}, {firstName} 👋</h2>
          <p className="text-sm text-gray-500 mt-0.5">Your safety status is monitored continuously</p>
        </div>

        {/* Safety Status Card */}
        <div className={`card border-2 ${statusCfg.border} fade-in`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Safety Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-3 h-3 rounded-full ${statusCfg.bg}`} />
                <span className={`font-bold text-lg ${statusCfg.text}`}>{statusCfg.label}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {safetyStatus === 'SAFE' && 'No threats detected in your area'}
                {safetyStatus === 'CAUTION' && 'Exercise caution in your current area'}
                {safetyStatus === 'DANGER' && 'Danger detected — consider moving to safety'}
              </p>
            </div>
            <div className={`w-14 h-14 rounded-full ${statusCfg.bg} flex items-center justify-center shadow-lg`}>
              <StatusIcon size={28} className="text-white" />
            </div>
          </div>
        </div>

        {/* Safety Mode Toggle */}
        <div className="card flex items-center justify-between fade-in">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${safetyModeActive ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Zap size={20} className={safetyModeActive ? 'text-green-600' : 'text-gray-500'} />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Safety Mode</p>
              <p className="text-xs text-gray-500">{safetyModeActive ? 'Active — location tracking on' : 'Tap to activate protection'}</p>
            </div>
          </div>
          <button
            onClick={toggleSafetyMode}
            className={`w-12 h-6 rounded-full transition-all duration-200 relative ${safetyModeActive ? 'bg-green-500' : 'bg-gray-300'}`}
            role="switch"
            aria-checked={safetyModeActive}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${safetyModeActive ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Backend connectivity indicator */}
        {!backendAvailable && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 fade-in">
            <WifiOff size={14} className="text-amber-600 flex-shrink-0" />
            <p className="text-amber-700 text-xs">Offline mode — data stored locally. Set VITE_API_URL to connect to backend.</p>
          </div>
        )}

        {/* Location Card */}
        <div className="card fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <MapPin size={18} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Current Location</p>
              {locationError ? (
                <p className="text-amber-600 text-sm mt-0.5">{locationError}</p>
              ) : location ? (
                <div>
                  <p className="text-gray-800 text-sm font-medium mt-0.5">
                    {location.address ?? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                  </p>
                  {location.accuracy && (
                    <p className="text-gray-400 text-xs mt-0.5">Accuracy: ±{Math.round(location.accuracy)}m</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-sm mt-0.5 italic">Acquiring location…</p>
              )}
            </div>
            <button onClick={requestLocation} className="text-blue-600 text-xs font-medium py-1 px-2 rounded-lg hover:bg-blue-50">
              Refresh
            </button>
          </div>

          {/* Live location sharing toggle */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 size={14} className={locationShare.active ? 'text-green-600' : 'text-gray-400'} />
              <div>
                <p className="text-xs font-semibold text-gray-700">Live Location Sharing</p>
                <p className="text-xs text-gray-400">
                  {locationShare.active
                    ? locationShare.lastPushed
                      ? `Updated ${new Date(locationShare.lastPushed).toLocaleTimeString()}`
                      : 'Sharing active…'
                    : backendAvailable ? 'Share with trusted contacts' : 'Requires backend'}
                </p>
              </div>
            </div>
            <button
              onClick={locationShare.active ? stopLocationSharing : startLocationSharing}
              disabled={!backendAvailable && !locationShare.active}
              className={`w-11 h-6 rounded-full transition-all duration-200 relative disabled:opacity-40 ${locationShare.active ? 'bg-green-500' : 'bg-gray-300'}`}
              role="switch"
              aria-checked={locationShare.active}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${locationShare.active ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
          {locationShare.error && (
            <p className="text-amber-600 text-xs mt-2">{locationShare.error}</p>
          )}
        </div>

        {/* SOS Button */}
        <div className="flex flex-col items-center py-6 fade-in">
          <p className="text-xs text-gray-500 mb-4 font-medium uppercase tracking-wide">
            {isHolding ? `Hold for ${Math.ceil((HOLD_DURATION - holdProgress / 100 * HOLD_DURATION) / 1000)}s…` : 'Press & Hold 3s to Activate SOS'}
          </p>

          <div className="relative">
            {/* Progress ring */}
            <svg className="absolute inset-0 -rotate-90" width="104" height="104" viewBox="0 0 104 104">
              <circle cx="52" cy="52" r="40" fill="none" stroke="#fee2e2" strokeWidth="6" />
              <circle
                cx="52" cy="52" r="40"
                fill="none"
                stroke="#dc2626"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="transition-none"
              />
            </svg>

            <button
              onMouseDown={startHold}
              onMouseUp={cancelHold}
              onMouseLeave={cancelHold}
              onTouchStart={startHold}
              onTouchEnd={cancelHold}
              className={`w-26 h-26 w-[104px] h-[104px] rounded-full bg-red-600 flex flex-col items-center justify-center shadow-2xl select-none ${!isHolding ? 'sos-pulse' : ''} transition-all active:scale-95`}
              style={{ touchAction: 'none' }}
            >
              <span className="text-white font-black text-2xl leading-none">SOS</span>
              <span className="text-red-200 text-xs mt-0.5">EMERGENCY</span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="fade-in">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Navigation, label: 'Safety Map', path: '/map', color: 'bg-blue-50 text-blue-600' },
              { icon: Phone, label: 'Fake Call', path: '/fake-call', color: 'bg-purple-50 text-purple-600' },
              { icon: CheckCircle, label: 'Safety Check', path: '/safety-check', color: 'bg-green-50 text-green-600' },
            ].map(({ icon: Icon, label, path, color }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="card flex flex-col items-center gap-2 py-4 hover:shadow-md transition-shadow active:scale-95"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.split(' ')[0]}`}>
                  <Icon size={20} className={color.split(' ')[1]} />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Quick-Ask Banner */}
        <button
          onClick={() => navigate('/ai-agent')}
          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-4 flex items-center gap-3 shadow-lg active:scale-95 transition-transform fade-in"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles size={22} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-white font-bold">Ask Priya — AI Safety Agent</p>
            <p className="text-pink-200 text-xs mt-0.5">Get safety tips, emergency help &amp; guidance</p>
          </div>
          <div className="ml-auto text-white opacity-70">→</div>
        </button>

        {/* More Quick Links */}
        <div className="grid grid-cols-2 gap-3 fade-in pb-2">
          {[
            { label: '🧳 Travel Safety', path: '/travel', desc: 'Set check-in intervals' },
            { label: '🎭 Demo Mode', path: '/demo', desc: 'Test features safely' },
          ].map(({ label, path, desc }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="card text-left hover:shadow-md transition-shadow active:scale-95"
            >
              <p className="font-semibold text-gray-800 text-sm">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
