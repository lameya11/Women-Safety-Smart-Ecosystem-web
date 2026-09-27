import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, PhoneOff, Volume2 } from 'lucide-react';

const CALLERS = [
  { name: 'Mom', initial: 'M', bg: 'bg-pink-500' },
  { name: 'Dad', initial: 'D', bg: 'bg-blue-600' },
  { name: 'Sister', initial: 'S', bg: 'bg-purple-500' },
  { name: 'Best Friend', initial: 'B', bg: 'bg-green-500' },
];

export function FakeCallPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'ringing' | 'in-call' | 'ended'>('ringing');
  const [callDuration, setCallDuration] = useState(0);
  const [caller] = useState(() => CALLERS[Math.floor(Math.random() * CALLERS.length)]);
  const durationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ring vibration effect
  useEffect(() => {
    if (phase === 'ringing' && 'vibrate' in navigator) {
      const pattern = [300, 200, 300, 200];
      const vib = setInterval(() => navigator.vibrate(pattern), 1200);
      return () => { clearInterval(vib); navigator.vibrate(0); };
    }
  }, [phase]);

  const accept = () => {
    setPhase('in-call');
    durationRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
  };

  const decline = () => {
    setPhase('ended');
    setTimeout(() => navigate(-1), 1000);
  };

  const endCall = () => {
    if (durationRef.current) clearInterval(durationRef.current);
    setPhase('ended');
    setTimeout(() => navigate(-1), 1000);
  };

  useEffect(() => () => { if (durationRef.current) clearInterval(durationRef.current); }, []);

  const formatDuration = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 max-w-lg mx-auto relative">
      {/* Simulated call disclaimer */}
      <div className="bg-yellow-600 px-4 py-1.5 text-center">
        <p className="text-yellow-100 text-xs font-bold">⚠️ SIMULATED CALL — Not a real call</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-between py-12 px-6">
        {/* Caller info */}
        <div className="text-center fade-in">
          <div className={`w-28 h-28 ${caller.bg} rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl`}>
            <span className="text-white text-5xl font-black">{caller.initial}</span>
          </div>
          <h2 className="text-white text-3xl font-bold">{caller.name}</h2>
          <p className="text-gray-400 text-sm mt-1">
            {phase === 'ringing' && 'Incoming call…'}
            {phase === 'in-call' && formatDuration(callDuration)}
            {phase === 'ended' && 'Call ended'}
          </p>
          {phase === 'ringing' && (
            <p className="text-gray-500 text-xs mt-2">Mobile</p>
          )}
        </div>

        {/* Call controls */}
        {phase === 'ringing' && (
          <div className="flex items-center justify-center gap-20 w-full slide-up">
            {/* Decline */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={decline}
                className="w-18 h-18 w-[72px] h-[72px] bg-red-500 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform"
              >
                <PhoneOff size={30} className="text-white" />
              </button>
              <span className="text-white text-sm">Decline</span>
            </div>

            {/* Accept */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={accept}
                className="w-[72px] h-[72px] bg-green-500 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform"
              >
                <Phone size={30} className="text-white" />
              </button>
              <span className="text-white text-sm">Accept</span>
            </div>
          </div>
        )}

        {phase === 'in-call' && (
          <div className="w-full space-y-6 slide-up">
            {/* Call controls row */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-1">
                <button className="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center">
                  <Volume2 size={20} className="text-white" />
                </button>
                <span className="text-gray-400 text-xs">Speaker</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">🔇</span>
                </div>
                <span className="text-gray-400 text-xs">Mute</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">⌨️</span>
                </div>
                <span className="text-gray-400 text-xs">Keypad</span>
              </div>
            </div>

            {/* End call */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={endCall}
                  className="w-[72px] h-[72px] bg-red-500 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform"
                >
                  <PhoneOff size={30} className="text-white" />
                </button>
                <span className="text-white text-sm">End Call</span>
              </div>
            </div>
          </div>
        )}

        {phase === 'ended' && (
          <div className="text-center fade-in">
            <p className="text-gray-400 text-lg">Returning…</p>
          </div>
        )}
      </div>
    </div>
  );
}
