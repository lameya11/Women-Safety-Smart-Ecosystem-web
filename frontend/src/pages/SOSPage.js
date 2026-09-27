import React, { useState, useEffect } from 'react';
import { sosAPI } from '../api';

export default function SOSPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    sosAPI.history().then(r => setHistory(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const active = history.find(s => s.status === 'active');

  const triggerSOS = async () => {
    setSending(true); setMsg('');
    try {
      // Try to get location
      let lat = null, lng = null;
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {}
      await sosAPI.trigger({ latitude: lat, longitude: lng, message: 'Emergency SOS — I need help!' });
      setMsg('✅ SOS alert sent! Your contacts will be notified.');
      load();
    } catch (e) {
      setMsg('❌ ' + (e.response?.data?.error || 'Failed to send SOS'));
    } finally { setSending(false); }
  };

  const cancelSOS = async (id) => {
    try {
      await sosAPI.cancel(id);
      setMsg('✅ SOS cancelled.');
      load();
    } catch { setMsg('❌ Failed to cancel alert'); }
  };

  return (
    <div className="page anim-fade">
      <h2 style={{ marginBottom:20 }}>🆘 Emergency SOS</h2>

      {/* Active SOS */}
      {active && (
        <div className="card" style={{ borderColor:'var(--danger)', background:'rgba(239,68,68,.08)', marginBottom:18 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <span style={{ fontSize:'1.6rem' }}>🚨</span>
            <div>
              <div style={{ fontWeight:800, color:'var(--danger)', fontSize:'1.1rem' }}>SOS ACTIVE</div>
              <div style={{ fontSize:'0.8rem', color:'var(--muted)' }}>
                Sent {new Date(active.createdAt).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
              </div>
            </div>
          </div>
          <p style={{ fontSize:'0.85rem', color:'var(--muted)', marginBottom:14 }}>{active.message}</p>
          <button className="btn btn-safe btn-full" onClick={() => cancelSOS(active.id)}>
            ✅ I'm Safe — Cancel Alert
          </button>
        </div>
      )}

      {/* SOS Button */}
      {!active && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:28, padding:'10px 0' }}>
          <button
            className={`sos-btn${sending ? ' sos-active-flash' : ''}`}
            onClick={triggerSOS}
            disabled={sending}
            style={{ marginBottom:16 }}
          >
            <span style={{ fontSize:'1.8rem', marginBottom:4 }}>🆘</span>
            <span style={{ fontSize:'0.9rem', letterSpacing:'.12em' }}>{sending ? '...' : 'SOS'}</span>
          </button>
          <p style={{ color:'var(--muted)', fontSize:'0.8rem', textAlign:'center', maxWidth:260 }}>
            Press to immediately send an emergency alert with your location to all trusted contacts
          </p>
        </div>
      )}

      {msg && (
        <div className={`alert ${msg.startsWith('✅') ? 'alert-ok' : 'alert-err'}`} style={{ marginBottom:16 }}>
          {msg}
        </div>
      )}

      {/* Emergency Tips */}
      <div className="card" style={{ marginBottom:18 }}>
        <div className="section-title" style={{ marginBottom:12 }}>🛡️ Emergency Tips</div>
        {[
          { icon:'📞', tip:'Call 112 for police/ambulance (India emergency number)' },
          { icon:'📍', tip:'Share your live location with a trusted contact' },
          { icon:'🔊', tip:'Scream loudly to attract attention in public places' },
          { icon:'🏃', tip:'Move towards a crowded, well-lit area' },
        ].map((t, i) => (
          <div key={i} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize:'1.2rem' }}>{t.icon}</span>
            <span style={{ fontSize:'0.85rem', color:'var(--muted)' }}>{t.tip}</span>
          </div>
        ))}
      </div>

      {/* History */}
      <div className="card">
        <div className="section-title" style={{ marginBottom:12 }}>🕐 Alert History</div>
        {loading && <div style={{ textAlign:'center', padding:20 }}><span className="spinner" /></div>}
        {!loading && history.length === 0 && (
          <div className="empty">
            <div className="empty-icon">🆘</div>
            <p style={{ color:'var(--muted)', fontSize:'0.9rem' }}>No SOS alerts yet</p>
          </div>
        )}
        {history.map(s => (
          <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize:'0.85rem', fontWeight:600 }}>{s.message}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--muted)', marginTop:2 }}>
                {new Date(s.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
              </div>
            </div>
            <span className={`badge badge-${s.status === 'active' ? 'danger' : s.status === 'cancelled' ? 'warn' : 'safe'}`}>
              {s.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
