import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { authAPI } from '../api';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const save = async e => {
    e.preventDefault(); setMsg('');
    setLoading(true);
    try {
      await authAPI.profile(form);
      setMsg('✅ Profile updated');
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Update failed'));
    } finally { setLoading(false); }
  };

  const doLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="page anim-fade">
      <h2 style={{ marginBottom:20 }}>👤 Profile</h2>

      {/* Avatar + name */}
      <div className="card" style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20,
        background:'linear-gradient(135deg,#1a0a2e,#2d0a3e)', borderColor:'#4a1a6e' }}>
        <div className="avatar" style={{ width:58, height:58, fontSize:'1.4rem' }}>
          {user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <div style={{ fontWeight:800, fontSize:'1.1rem' }}>{user?.name}</div>
          <div style={{ color:'var(--muted)', fontSize:'0.85rem', marginTop:3 }}>{user?.email}</div>
          <span className="badge badge-safe" style={{ marginTop:6 }}>{user?.role || 'user'}</span>
        </div>
      </div>

      {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-ok' : 'alert-err'}`}>{msg}</div>}

      {/* Edit form */}
      <div className="card" style={{ marginBottom:20 }}>
        <h3 style={{ marginBottom:16, fontSize:'1rem' }}>✏️ Edit Details</h3>
        <form onSubmit={save}>
          <div className="field">
            <label className="label">Full Name</label>
            <input className="input" name="name" value={form.name} onChange={set} required />
          </div>
          <div className="field">
            <label className="label">Phone</label>
            <input className="input" name="phone" type="tel" value={form.phone} onChange={set} placeholder="+91 98765 43210" />
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" value={user?.email || ''} disabled
              style={{ opacity:0.5, cursor:'not-allowed' }} />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : '💾 Save Changes'}
          </button>
        </form>
      </div>

      {/* Safety info */}
      <div className="card" style={{ marginBottom:20, background:'rgba(124,58,237,.08)', borderColor:'rgba(124,58,237,.3)' }}>
        <div style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--accent)', marginBottom:10, textTransform:'uppercase', letterSpacing:'.07em' }}>
          🛡️ About SafeGuard
        </div>
        <p style={{ fontSize:'0.85rem', color:'var(--muted)', lineHeight:1.7 }}>
          SafeGuard is a women safety app that lets you instantly send SOS alerts with your GPS location
          to trusted contacts, report unsafe areas in your community, and manage your emergency contacts.
        </p>
        <div style={{ marginTop:12 }}>
          {[
            ['📞 Emergency (India)', '112'],
            ['👮 Women Helpline', '1091'],
            ['🚑 Ambulance', '108'],
            ['🚔 Police', '100'],
          ].map(([label, num]) => (
            <a key={num} href={`tel:${num}`} style={{ display:'flex', justifyContent:'space-between',
              alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)', color:'var(--text)', textDecoration:'none' }}>
              <span style={{ fontSize:'0.85rem' }}>{label}</span>
              <span style={{ fontWeight:800, color:'var(--primary)', fontSize:'1rem' }}>{num}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button className="btn btn-ghost btn-full" style={{ borderColor:'var(--danger)', color:'var(--danger)' }}
        onClick={doLogout}>
        🚪 Logout
      </button>
    </div>
  );
}
