import { useNavigate } from 'react-router-dom';
import { Shield, Heart } from 'lucide-react';

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-pink-50 via-white to-pink-100 px-6 max-w-lg mx-auto">
      {/* Logo / Icon */}
      <div className="mb-8 flex flex-col items-center gap-4 slide-up">
        <div className="relative">
          <div className="w-28 h-28 bg-pink-600 rounded-full flex items-center justify-center shadow-2xl">
            <Shield size={54} className="text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-md">
            <Heart size={16} className="text-white fill-white" />
          </div>
        </div>

        {/* Brand */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-pink-700 tracking-tight">SHE SAFE</h1>
          <p className="text-sm font-semibold text-pink-400 tracking-widest uppercase mt-1">
            Women Safety Ecosystem
          </p>
        </div>
      </div>

      {/* Tagline */}
      <div className="text-center mb-12 fade-in">
        <h2 className="text-2xl font-bold text-gray-800 leading-snug">
          Your Safety,<br />
          <span className="text-pink-600">Our Priority</span>
        </h2>
        <p className="text-gray-500 mt-3 text-sm leading-relaxed max-w-xs mx-auto">
          Real-time safety monitoring, instant SOS alerts, and smart protection — always by your side.
        </p>
      </div>

      {/* Feature highlights */}
      <div className="w-full grid grid-cols-3 gap-3 mb-10 fade-in">
        {[
          { icon: '🛡️', label: 'SOS Alert' },
          { icon: '📍', label: 'Live Location' },
          { icon: '👥', label: 'Trusted Contacts' },
        ].map(({ icon, label }) => (
          <div key={label} className="bg-white rounded-xl p-3 text-center shadow-sm border border-pink-100">
            <span className="text-2xl">{icon}</span>
            <p className="text-xs font-medium text-gray-600 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="w-full flex flex-col gap-3 fade-in">
        <button
          onClick={() => navigate('/register')}
          className="btn-primary w-full text-base py-4 shadow-lg shadow-pink-200"
        >
          Get Started
        </button>
        <button
          onClick={() => navigate('/login')}
          className="btn-secondary w-full text-base py-4"
        >
          Sign In
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-8 text-center">
        By continuing you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
