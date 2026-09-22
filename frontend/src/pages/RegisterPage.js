// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function RegisterPage() {
  const { register, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
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
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Registration failed');
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
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          margin: '0 auto 12px',
        }}>🛡️</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary)' }}>SafeGuard</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 4 }}>Create your safety account</p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: 400, padding: '28px 24px' }}>
        <h2 style={{ marginBottom: 24, fontSize: '1.3rem' }}>Create Account</h2>

        {error && (
          <div className="badge badge-danger" style={{ marginBottom: 16, display: 'block', padding: '10px 14px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name', autoComplete: 'name' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com', autoComplete: 'email' },
            { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 98765 43210', autoComplete: 'tel' },
            { name: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters', autoComplete: 'new-password' },
            { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password', autoComplete: 'new-password' },
          ].map(({ name, label, type, placeholder, autoComplete }) => (
            <div className="form-group" key={name}>
              <label className="form-label">{label}</label>
              <input
                type={type}
                name={name}
                className="form-input"
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
                required={name !== 'phone'}
                autoComplete={autoComplete}
              />
            </div>
          ))}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20 }} /> : '✨ Create Account'}
          </button>
        </form>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: 16, textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>

      <p style={{ color: 'var(--color-text-faint)', fontSize: '0.75rem', marginTop: 20, textAlign: 'center', maxWidth: 320 }}>
        By creating an account, your location and safety data will be used only to protect you and notify your trusted contacts in emergencies.
      </p>
    </div>
  );
}
