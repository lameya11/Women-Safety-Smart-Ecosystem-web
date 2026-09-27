import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertOctagon, X } from 'lucide-react';
import { useSafety } from '../context/SafetyContext';

export function SafetyCheckPage() {
  const navigate = useNavigate();
  const { activateSOS, addAlert } = useSafety();
  const [countdown, setCountdown] = useState(10);
  const [phase, setPhase] = useState<'counting' | 'safe' | 'triggered'>('counting');
  const [alreadyTriggered, setAlreadyTriggered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase !== 'counting') return;
    intervalRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(intervalRef.current!);
          if (!alreadyTriggered) {
            setAlreadyTriggered(true);
            setPhase('triggered');
            addAlert({ type: 'SAFETY_CHECK_MISSED', status: 'ACTIVE' });
            activateSOS();
            setTimeout(() => navigate('/sos'), 500);
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  const handleSafe = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase('safe');
    addAlert({ type: 'SAFETY_CHECK_MISSED', status: 'RESOLVED', notes: 'User confirmed safe' });
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  const handleSendSOS = () => {
    if (alreadyTriggered) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setAlreadyTriggered(true);
    setPhase('triggered');
    activateSOS();
    addAlert({ type: 'MANUAL_SOS', status: 'ACTIVE' });
    navigate('/sos');
  };

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (countdown / 10) * circumference;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-6 max-w-lg mx-auto">
      {/* Cancel button */}
      <button
        onClick={() => { if (intervalRef.current) clearInterval(intervalRef.current); navigate('/dashboard'); }}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
      >
        <X size={20} className="text-white" />
      </button>

      {phase === 'safe' ? (
        <div className="text-center slide-up">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <CheckCircle size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">You're Safe!</h2>
          <p className="text-green-300 mt-2">Safety check confirmed. Returning to dashboard…</p>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <p className="text-pink-300 text-sm font-semibold uppercase tracking-widest">Safety Check</p>
            <h2 className="text-white text-2xl font-bold mt-1">Are you safe?</h2>
            <p className="text-gray-400 text-sm mt-1">SOS will trigger automatically if no response</p>
          </div>

          {/* Countdown ring */}
          <div className="relative flex items-center justify-center mb-8">
            <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
              <circle cx="70" cy="70" r={radius} fill="none" stroke="#374151" strokeWidth="8" />
              <circle
                cx="70" cy="70" r={radius}
                fill="none"
                stroke={countdown <= 3 ? '#ef4444' : '#ec4899'}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute text-center">
              <span className={`text-5xl font-black ${countdown <= 3 ? 'text-red-400' : 'text-white'}`}>
                {countdown}
              </span>
              <p className="text-gray-400 text-xs">seconds</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="w-full space-y-3">
            <button
              onClick={handleSafe}
              className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl text-lg flex items-center justify-center gap-2 shadow-xl transition-colors"
            >
              <CheckCircle size={24} />
              I'm Safe
            </button>
            <button
              onClick={handleSendSOS}
              disabled={alreadyTriggered}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl text-lg flex items-center justify-center gap-2 shadow-xl transition-colors disabled:opacity-50"
            >
              <AlertOctagon size={24} />
              Send SOS Now
            </button>
          </div>
        </>
      )}
    </div>
  );
}
