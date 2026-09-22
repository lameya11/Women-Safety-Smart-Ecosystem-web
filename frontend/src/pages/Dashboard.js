import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { sosAPI, contactsAPI } from '../api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [sosHistory, setSosHistory] = useState([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    contactsAPI.list().then(r => setContacts(r.data)).catch(() => {});
    sosAPI.history().then(r => setSosHistory(r.data)).catch(() => {});
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hour = time.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const activeSos = sosHistory.filter(s => s.status === 'active');

  return (
    <div className="page anim-fade">
      {/* Greeting */}
      <div className="card" style={{ background:'linear-gradient(135deg,#1a0a2e,#2d0a3e)', borderColor:'#4a1a6e', marginBottom:18 }}>
        <div style={{ fontSize:'0.85rem', color:'var(--muted)', marginBottom:4 }}>{greeting}</div>
        <h2 style={{ fontSize:'1.4rem', fontWeight:800 }}>👋 {user?.name?.split(' ')[0] || 'User'}</h2>
        <p style={{ color:'var(--muted)', fontSize:'0.85rem', marginTop:4 }}>
          {time.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
          {' · '}{time.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
        </p>
      </div>

      {/* Active SOS warning */}
      {activeSos.length > 0 && (
        <div className="card" style={{ borderColor:'var(--danger)', background:'rgba(239,68,68,.08)', cursor:'pointer' }}
          onClick={() => navigate('/sos')}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:'1.4rem' }}>🚨</span>
            <div>
              <div style={{ fontWeight:700, color:'var(--danger)' }}>SOS Alert Active</div>
              <div style={{ fontSize:'0.8rem', color:'var(--muted)' }}>Tap to manage your active alert</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
        <button className="btn btn-danger btn-full" style={{ height:70, fontSize:'1.1rem', borderRadius:12 }}
          onClick={() => navigate('/sos')}>
          🆘 SOS
        </button>
        <button className="btn btn-accent btn-full" style={{ height:70, fontSize:'1rem', borderRadius:12 }}
          onClick={() => navigate('/contacts')}>
          👥 Contacts
        </button>
        <button className="btn btn-ghost btn-full" style={{ height:60, fontSize:'0.9rem', borderRadius:12 }}
          onClick={() => navigate('/reports')}>
          📋 Reports
        </button>
        <button className="btn btn-ghost btn-full" style={{ height:60, fontSize:'0.9rem', borderRadius:12 }}
          onClick={() => navigate('/profile')}>
          👤 Profile
        </button>
      </div>

      {/* Stats */}
      <div className="card">
        <div className="section-title" style={{ marginBottom:14 }}>📊 Your Stats</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
          {[
            { label:'Contacts', value: contacts.length, icon:'👥' },
            { label:'SOS Sent', value: sosHistory.length, icon:'🚨' },
            { label:'Active', value: activeSos.length, icon:'⚠️' },
          ].map(s => (
            <div key={s.label} style={{ textAlign:'center', padding:'12px 6px', background:'var(--surface2)', borderRadius:10 }}>
              <div style={{ fontSize:'1.4rem' }}>{s.icon}</div>
              <div style={{ fontSize:'1.5rem', fontWeight:800, color:'var(--primary)' }}>{s.value}</div>
              <div style={{ fontSize:'0.72rem', color:'var(--muted)', marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent SOS */}
      {sosHistory.length > 0 && (
        <div className="card">
          <div className="section-title" style={{ marginBottom:12 }}>🕐 Recent Alerts</div>
          {sosHistory.slice(0, 3).map(s => (
            <div key={s.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{s.message}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--muted)', marginTop:2 }}>
                  {new Date(s.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                </div>
              </div>
              <span className={`badge badge-${s.status === 'active' ? 'danger' : s.status === 'cancelled' ? 'warn' : 'safe'}`}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Safety tip */}
      <div className="card" style={{ background:'rgba(124,58,237,.08)', borderColor:'rgba(124,58,237,.3)' }}>
        <div style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--accent)', marginBottom:6, textTransform:'uppercase', letterSpacing:'.07em' }}>
          💡 Safety Tip
        </div>
        <p style={{ fontSize:'0.85rem', color:'var(--muted)', lineHeight:1.6 }}>
          Always share your live location with a trusted contact before travelling alone at night.
          Add at least 2 emergency contacts to ensure someone gets notified in an emergency.
        </p>
      </div>
    </div>
  );
}
