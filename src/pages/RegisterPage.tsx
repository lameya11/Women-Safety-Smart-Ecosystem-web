import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = passwordStrength(password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-green-500'];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!email) { setError('Please enter your email.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (phone && !/^\+?[\d\s\-()]{7,15}$/.test(phone)) { setError('Enter a valid phone number.'); return; }

    setLoading(true);
    try {
      await register(name.trim(), email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-pink-100 transition-colors">
          <ArrowLeft size={20} className="text-pink-600" />
        </button>
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-pink-600" />
          <span className="font-bold text-pink-700">SHE SAFE</span>
        </div>
      </div>

      <div className="flex-1 px-6 pb-8">
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">Create account</h2>
          <p className="text-gray-500 mt-1 text-sm">Join thousands of women staying safe</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          {/* Name */}
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-9"
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          {/* Email */}
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

          {/* Phone (optional) */}
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-9"
              type="tel"
              placeholder="Phone number (optional)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-9 pr-10"
              type={showPw ? 'text' : 'password'}
              placeholder="Password (min. 8 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Password strength */}
          {password.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength ? strengthColors[strength] : 'bg-gray-200'}`} />
                ))}
              </div>
              <p className="text-xs text-gray-500">Password strength: <span className="font-medium">{strengthLabels[strength]}</span></p>
            </div>
          )}

          {/* Confirm password */}
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-9 pr-10"
              type={showPw ? 'text' : 'password'}
              placeholder="Confirm password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
            {confirm && confirm === password && (
              <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account…
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-pink-600 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
