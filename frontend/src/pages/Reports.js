import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../api';
import { useAuth } from '../App';

const CATEGORIES = ['Harassment', 'Poor Lighting', 'Suspicious Activity', 'Theft', 'Unsafe Area', 'General'];

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title:'', description:'', category:'General' });
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    reportsAPI.list().then(r => setReports(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault(); setMsg('');
    try {
      await reportsAPI.create(form);
      setMsg('✅ Report submitted. Thank you for keeping the community safe!');
      setForm({ title:'', description:'', category:'General' });
      setShowForm(false);
      load();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed to submit'));
    }
  };

  const catColor = { Harassment:'var(--danger)', 'Poor Lighting':'var(--warn)', 'Suspicious Activity':'var(--warn)',
    Theft:'var(--danger)', 'Unsafe Area':'var(--warn)', General:'var(--muted)' };

  return (
    <div className="page anim-fade">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2>📋 Safety Reports</h2>
        <button className="btn btn-primary" style={{ padding:'8px 16px', fontSize:'0.85rem' }}
          onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Close' : '+ Report'}
        </button>
      </div>

      {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-ok' : 'alert-err'}`}>{msg}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom:18, borderColor:'var(--primary)' }}>
          <h3 style={{ marginBottom:16, fontSize:'1rem' }}>📍 New Safety Report</h3>
          <form onSubmit={submit}>
            <div className="field">
              <label className="label">Title *</label>
              <input className="input" name="title" placeholder="Brief title" value={form.title} onChange={set} required />
            </div>
            <div className="field">
              <label className="label">Category</label>
              <select className="input" name="category" value={form.category} onChange={set}
                style={{ background:'var(--surface2)', color:'var(--text)' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Description *</label>
              <textarea className="input" name="description" placeholder="Describe the incident or unsafe condition..."
                value={form.description} onChange={set} required rows={3}
                style={{ resize:'vertical', minHeight:80 }} />
            </div>
            <button className="btn btn-primary btn-full" type="submit">📤 Submit Report</button>
          </form>
        </div>
      )}

      {loading && <div style={{ textAlign:'center', padding:30 }}><span className="spinner" /></div>}

      {!loading && reports.length === 0 && (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <p style={{ color:'var(--muted)' }}>No reports yet</p>
          <p style={{ color:'var(--muted)', fontSize:'0.85rem' }}>Be the first to report an unsafe area in your community</p>
        </div>
      )}

      {reports.map(r => (
        <div key={r.id} className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
            <div style={{ fontWeight:700, fontSize:'0.95rem', flex:1, paddingRight:8 }}>{r.title}</div>
            <span className="badge" style={{ background:`${catColor[r.category] || 'var(--muted)'}22`,
              color: catColor[r.category] || 'var(--muted)', border:`1px solid ${catColor[r.category] || 'var(--muted)'}44`,
              flexShrink:0 }}>
              {r.category}
            </span>
          </div>
          <p style={{ color:'var(--muted)', fontSize:'0.85rem', marginBottom:8, lineHeight:1.5 }}>{r.description}</p>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:'0.75rem', color:'var(--faint)' }}>by {r.userName}</span>
            <span style={{ fontSize:'0.75rem', color:'var(--faint)' }}>
              {new Date(r.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
