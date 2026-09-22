// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { login, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    try {
      // Try demo account first, create if needed
      try {
        await login('demo@safeguard.app', 'demo123456');
      } catch {
        const { authAPI } = await import('../services/api');
        await authAPI.register({ name: 'Demo User', email: 'demo@safeguard.app', password: 'demo123456', phone: '+919876543210' });
        await login('demo@safeguard.app', 'demo123456');
      }
      navigate('/', { replace: true });
    } catch {
      setError('Demo login failed. Please register.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      background: 'var(--color-bg)',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          margin: '0 auto 16px',
          boxShadow: 'var(--shadow-primary)',
        }}>
          🛡️
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)' }}>SafeGuard</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 4, fontSize: '0.9rem' }}>
          Your Women Safety Companion
        </p>
      </div>

      {/* Form */}
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: '28px 24px' }}>
        <h2 style={{ marginBottom: 24, fontSize: '1.3rem' }}>Welcome Back</h2>

        {error && (
          <div className="badge badge-danger" style={{ marginBottom: 16, display: 'block', padding: '10px 14px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? <span className="spinner" style={{ width: 20, height: 20 }} /> : '🔐 Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* Demo Login */}
      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <div className="badge badge-demo" style={{ marginBottom: 12, fontSize: '0.75rem' }}>
          🎮 DEMO MODE AVAILABLE
        </div>
        <br />
        <button
          className="btn btn-ghost"
          onClick={handleDemo}
          disabled={loading}
          style={{ fontSize: '0.85rem' }}
        >
          Try Demo Account →
        </button>
      </div>
    </div>
  );
}
