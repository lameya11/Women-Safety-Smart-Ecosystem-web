import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address.'); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Enter your email address.'); return; }
    // Password reset requires a backend service; this shows the requirement.
    setResetSent(true);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pt-safe">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-pink-100 transition-colors">
          <ArrowLeft size={20} className="text-pink-600" />
        </button>
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-pink-600" />
          <span className="font-bold text-pink-700">SHE SAFE</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-8">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {resetMode ? 'Reset Password' : 'Welcome back'}
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            {resetMode
              ? 'Enter your email and we\'ll send reset instructions'
              : 'Sign in to continue protecting yourself'}
          </p>
        </div>

        {resetMode ? (
          <form onSubmit={handleReset} className="space-y-4">
            {resetSent ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-green-700 font-medium">📧 Reset instructions sent!</p>
                <p className="text-green-600 text-sm mt-1">
                  Password reset requires a configured email service.<br />
                  Check your inbox if one is set up.
                </p>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className="input-field pl-9"
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button type="submit" className="btn-primary w-full">Send Reset Link</button>
              </>
            )}
            <button type="button" onClick={() => { setResetMode(false); setResetSent(false); setError(''); }}
              className="w-full text-pink-600 text-sm font-medium py-2">
              ← Back to Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input-field pl-9"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input-field pl-9 pr-10"
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="text-right">
              <button type="button" onClick={() => setResetMode(true)}
                className="text-pink-600 text-sm font-medium hover:underline">
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>

            <div className="relative flex items-center my-2">
              <div className="flex-1 border-t border-gray-200" />
              <span className="mx-3 text-xs text-gray-400">OR</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <p className="text-amber-700 text-xs font-medium">
                🔑 Google Sign-In requires Firebase configuration.
              </p>
              <p className="text-amber-600 text-xs mt-0.5">Set VITE_FIREBASE_API_KEY to enable.</p>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-pink-600 font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
