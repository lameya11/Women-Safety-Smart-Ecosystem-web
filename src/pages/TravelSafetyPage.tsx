import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, CheckCircle, AlertTriangle, Play, Square, Info } from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import { useSafety } from '../context/SafetyContext';

export function TravelSafetyPage() {
  const navigate = useNavigate();
  const { travelSession, startTravel, stopTravel, checkIn, addAlert } = useSafety();
  const [destination, setDestination] = useState('');
  const [interval, setInterval2] = useState(30);
  const [error, setError] = useState('');
  const [timeUntilCheckIn, setTimeUntilCheckIn] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!travelSession) { if (tickRef.current) clearInterval(tickRef.current); return; }
    const update = () => {
      const diff = new Date(travelSession.nextCheckIn).getTime() - Date.now();
      setTimeUntilCheckIn(Math.max(0, Math.floor(diff / 1000)));
      if (diff <= 0) {
        // Missed check-in escalation
        addAlert({ type: 'SAFETY_CHECK_MISSED', status: 'ACTIVE', notes: 'Travel check-in missed' });
        navigate('/safety-check');
      }
    };
    update();
    tickRef.current = setInterval(update, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [travelSession]);

  const handleStart = () => {
    setError('');
    if (!destination.trim()) { setError('Enter a destination.'); return; }
    if (interval < 5 || interval > 120) { setError('Interval must be between 5 and 120 minutes.'); return; }
    startTravel(destination.trim(), interval);
  };

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const progressPct = travelSession
    ? Math.max(0, (timeUntilCheckIn / (travelSession.intervalMinutes * 60)) * 100)
    : 0;

  return (
    <PageLayout title="Travel Safety" showBack showNav>
      <div className="p-4 space-y-4">
        {/* Background limitation notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
          <Info size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-700 text-xs leading-relaxed">
            <strong>Note:</strong> Check-in timers only run while this app is open in the foreground.
            Background execution is limited by browsers. Keep the app open during travel.
          </p>
        </div>

        {travelSession ? (
          // Active travel session
          <div className="space-y-4">
            {/* Status card */}
            <div className="card bg-green-50 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <p className="font-bold text-green-700">Travel Mode Active</p>
              </div>
              <div className="flex items-start gap-2 mb-1">
                <MapPin size={15} className="text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 font-medium">{travelSession.destination}</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-green-600" />
                <p className="text-sm text-gray-600">Every {travelSession.intervalMinutes} min check-in</p>
              </div>
            </div>

            {/* Countdown */}
            <div className="card text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Next Check-In</p>
              <p className={`text-5xl font-black ${timeUntilCheckIn < 60 ? 'text-red-600' : 'text-gray-800'}`}>
                {formatCountdown(timeUntilCheckIn)}
              </p>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${timeUntilCheckIn < 60 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={checkIn}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl text-lg flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <CheckCircle size={22} />
              I'm Safe — Check In Now
            </button>

            <button
              onClick={stopTravel}
              className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors"
            >
              <Square size={18} />
              End Travel Session
            </button>

            {travelSession.missedCheckIns > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
                <AlertTriangle size={15} className="text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">
                  {travelSession.missedCheckIns} missed check-in{travelSession.missedCheckIns > 1 ? 's' : ''} detected.
                </p>
              </div>
            )}
          </div>
        ) : (
          // Setup form
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Start Travel Safety Mode</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Destination</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      className="input-field pl-8"
                      placeholder="Where are you going?"
                      value={destination}
                      onChange={e => setDestination(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    Check-in Interval: <span className="text-pink-600">{interval} minutes</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={interval}
                    onChange={e => setInterval2(Number(e.target.value))}
                    className="w-full accent-pink-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>5 min</span>
                    <span>120 min</span>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button onClick={handleStart} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Play size={18} />
                  Start Travel Safety Mode
                </button>
              </div>
            </div>

            <div className="card bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-blue-800 text-sm mb-2">How it works</h4>
              <ul className="text-xs text-blue-700 space-y-1.5">
                <li>✓ You'll be asked to check in at regular intervals</li>
                <li>✓ If you miss a check-in, a Safety Check is triggered</li>
                <li>✓ If the Safety Check times out, SOS activates automatically</li>
                <li>⚠️ Keep the app open during travel for timer accuracy</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
