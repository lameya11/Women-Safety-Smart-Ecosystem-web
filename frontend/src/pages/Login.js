import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) { navigate('/', { replace: true }); return null; }

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error
        || (err.message === 'Network Error' ? 'Cannot reach server. Check your connection.' : null)
        || `Login failed (${err.response?.status || 'network error'})`;
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div style={{ textAlign:'center', marginBottom:32 }}>
        <div className="auth-logo">🛡️</div>
        <h1 style={{ fontSize:'2rem', fontWeight:900, color:'var(--primary)' }}>SafeGuard</h1>
        <p style={{ color:'var(--muted)', marginTop:6, fontSize:'0.9rem' }}>Women Safety Companion</p>
      </div>

      <div className="card auth-box">
        <h2 style={{ marginBottom:22, fontSize:'1.2rem' }}>Welcome Back</h2>

        {error && <div className="alert alert-err">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" name="email" placeholder="you@email.com"
              value={form.email} onChange={set} required autoComplete="email" />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input className="input" type="password" name="password" placeholder="••••••••"
              value={form.password} onChange={set} required autoComplete="current-password" />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop:6 }}>
            {loading ? <span className="spinner" /> : '🔐 Sign In'}
          </button>
        </form>

        <p style={{ color:'var(--muted)', fontSize:'0.85rem', marginTop:18, textAlign:'center' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color:'var(--primary)', fontWeight:700 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
