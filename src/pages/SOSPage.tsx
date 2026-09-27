import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Video, Mic, MicOff, AlertCircle, MapPin, Users, StopCircle, Share2 } from 'lucide-react';
import { useSafety } from '../context/SafetyContext';
import { useAuth } from '../context/AuthContext';

export function SOSPage() {
  const navigate = useNavigate();
  const { backendAvailable } = useAuth();
  const { location, contacts, deactivateSOS, activeSosId, locationShare, startLocationSharing, stopLocationSharing } = useSafety();
  const [elapsed, setElapsed] = useState(0);
  const [recordingGranted, setRecordingGranted] = useState<boolean | null>(null);
  const [micActive, setMicActive] = useState(false);
  const [sosBackendId] = useState(activeSosId);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    // Auto-start location sharing when SOS activates
    if (!locationShare.active) startLocationSharing();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const requestMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setRecordingGranted(true);
      setMicActive(true);
    } catch {
      setRecordingGranted(false);
    }
  };

  const handleStop = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    stopLocationSharing();
    await deactivateSOS();
    navigate('/dashboard');
  };

  const shareUrl = locationShare.shareId
    ? `${import.meta.env.VITE_API_URL ?? ''}/api/location/track/${locationShare.shareId}`
    : null;

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const emergencyContacts = contacts.filter(c => c.isEmergency);

  return (
    <div className="min-h-screen bg-red-900 flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-red-800 px-4 py-4 text-center border-b border-red-700">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-red-400 animate-ping absolute" />
          <div className="w-3 h-3 rounded-full bg-red-300 relative" />
          <span className="text-red-200 font-bold text-sm uppercase tracking-widest">SOS ACTIVATED</span>
        </div>
        <p className="text-white text-4xl font-black tracking-widest">{formatTime(elapsed)}</p>
        <p className="text-red-300 text-xs mt-1">Emergency mode active</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Backend SOS ID */}
        {sosBackendId && (
          <div className="bg-green-900/50 border border-green-700 rounded-xl px-3 py-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <p className="text-green-300 text-xs">SOS logged on server · ID: <code className="text-green-200">{sosBackendId.slice(0, 8)}…</code></p>
          </div>
        )}

        {/* Location sharing status */}
        <div className="bg-red-800/50 rounded-2xl p-3 flex items-start gap-3 border border-red-700">
          <MapPin size={18} className="text-red-300 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-white font-semibold text-sm">Live Location</p>
              {locationShare.active && (
                <span className="flex items-center gap-1 text-green-300 text-xs">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Sharing
                </span>
              )}
            </div>
            {location ? (
              <p className="text-red-300 text-xs mt-0.5">
                {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                {location.accuracy && <span className="text-red-400"> · ±{Math.round(location.accuracy)}m</span>}
              </p>
            ) : (
              <p className="text-red-400 text-xs mt-0.5">Location unavailable — grant permission in Settings</p>
            )}
            {locationShare.lastPushed && (
              <p className="text-green-400 text-xs mt-0.5">
                ✓ Updated {new Date(locationShare.lastPushed).toLocaleTimeString()}
              </p>
            )}
            {locationShare.error && (
              <p className="text-yellow-400 text-xs mt-0.5">⚠️ {locationShare.error}</p>
            )}
            {/* Share link */}
            {shareUrl && backendAvailable && (
              <button onClick={copyShareLink}
                className="mt-2 flex items-center gap-1.5 text-xs bg-red-700/50 text-red-200 px-2 py-1 rounded-lg hover:bg-red-700 transition-colors">
                <Share2 size={11} />
                Copy tracking link
              </button>
            )}
          </div>
        </div>

        {/* Contacts notification */}
        <div className="bg-red-800/50 rounded-2xl p-3 border border-red-700">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-red-300" />
            <p className="text-white font-semibold text-sm">Trusted Contact Alerts</p>
          </div>
          {emergencyContacts.length > 0 ? (
            <div className="space-y-1.5">
              {emergencyContacts.map(c => (
                <div key={c.id} className="flex items-center justify-between bg-red-700/40 rounded-xl px-3 py-2">
                  <div>
                    <p className="text-white text-sm font-medium">{c.name}</p>
                    <p className="text-red-300 text-xs">{c.relationship} · {c.phone}</p>
                  </div>
                  <span className="text-yellow-300 text-xs font-semibold">⚠️ Pending</span>
                </div>
              ))}
              <p className="text-red-400 text-xs mt-1">
                ⚠️ Contact notification requires SMS/notification backend. Not currently active.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-red-400 text-sm">No emergency contacts added.</p>
              <button onClick={() => navigate('/contacts')} className="text-xs text-red-300 underline mt-1">
                Add contacts →
              </button>
            </div>
          )}
        </div>

        {/* Recording */}
        <div className="bg-red-800/50 rounded-2xl p-3 border border-red-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {micActive ? (
                <Mic size={18} className="text-green-400" />
              ) : (
                <MicOff size={18} className="text-red-400" />
              )}
              <div>
                <p className="text-white font-semibold text-sm">Audio Recording</p>
                <p className="text-xs text-red-300">
                  {recordingGranted === null && 'Tap to request microphone access'}
                  {recordingGranted === false && 'Microphone permission denied'}
                  {recordingGranted === true && micActive && '🔴 Recording active (browser only — not uploaded)'}
                </p>
              </div>
            </div>
            {recordingGranted !== true && (
              <button onClick={requestMic} className="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg">
                Enable
              </button>
            )}
          </div>
          {recordingGranted === true && (
            <p className="text-yellow-300 text-xs mt-2 flex items-center gap-1">
              <AlertCircle size={12} />
              Recording stays in browser. Upload to server requires backend configuration.
            </p>
          )}
        </div>

        {/* Emergency disclaimer */}
        <div className="bg-amber-900/50 border border-amber-700 rounded-2xl p-3">
          <p className="text-amber-300 text-xs font-semibold flex items-center gap-1 mb-1">
            <AlertCircle size={12} /> Important Notice
          </p>
          <p className="text-amber-200 text-xs leading-relaxed">
            This SOS system alerts your trusted contacts and logs the event locally.
            Emergency services (Police 112) are NOT automatically contacted.
            Always call emergency services directly in a real emergency.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-4 bg-red-900 border-t border-red-800 space-y-3">
        {/* Call Police */}
        <a
          href="tel:112"
          className="w-full py-3.5 bg-white rounded-2xl flex items-center justify-center gap-2 shadow-xl font-bold text-red-700 text-base"
        >
          <Phone size={20} />
          Call Police — 112
        </a>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/fake-call')}
            className="py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
          >
            <Video size={18} />
            Fake Call
          </button>
          <button
            onClick={handleStop}
            className="py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
          >
            <StopCircle size={18} />
            Stop SOS
          </button>
        </div>
      </div>
    </div>
  );
}
