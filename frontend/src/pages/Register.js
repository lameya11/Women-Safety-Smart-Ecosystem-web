import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirm:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) { navigate('/', { replace: true }); return null; }

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error
        || err.response?.data?.errors?.[0]?.msg
        || (err.message === 'Network Error' ? 'Cannot reach server. Check your connection.' : null)
        || `Registration failed (${err.response?.status || 'network error'})`;
      setError(msg);
    } finally { setLoading(false); }
  };

  const fields = [
    { name:'name',    label:'Full Name',        type:'text',     placeholder:'Your name',       auto:'name' },
    { name:'email',   label:'Email',             type:'email',    placeholder:'you@email.com',   auto:'email' },
    { name:'phone',   label:'Phone (optional)',  type:'tel',      placeholder:'+91 98765 43210', auto:'tel', req:false },
    { name:'password',label:'Password',          type:'password', placeholder:'Min 6 characters',auto:'new-password' },
    { name:'confirm', label:'Confirm Password',  type:'password', placeholder:'Repeat password', auto:'new-password' },
  ];

  return (
    <div className="auth-wrap">
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div className="auth-logo">🛡️</div>
        <h1 style={{ fontSize:'1.8rem', fontWeight:900, color:'var(--primary)' }}>SafeGuard</h1>
        <p style={{ color:'var(--muted)', marginTop:6, fontSize:'0.85rem' }}>Create your safety account</p>
      </div>

      <div className="card auth-box">
        <h2 style={{ marginBottom:20, fontSize:'1.2rem' }}>Create Account</h2>

        {error && <div className="alert alert-err">{error}</div>}

        <form onSubmit={submit}>
          {fields.map(({ name, label, type, placeholder, auto, req=true }) => (
            <div className="field" key={name}>
              <label className="label">{label}</label>
              <input className="input" type={type} name={name} placeholder={placeholder}
                value={form[name]} onChange={set} required={req} autoComplete={auto} />
            </div>
          ))}
          <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop:6 }}>
            {loading ? <span className="spinner" /> : '✨ Create Account'}
          </button>
        </form>

        <p style={{ color:'var(--muted)', fontSize:'0.85rem', marginTop:18, textAlign:'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--primary)', fontWeight:700 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
