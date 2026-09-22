import React, { useState, useEffect } from 'react';
import { contactsAPI } from '../api';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name:'', phone:'', relationship:'' });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    contactsAPI.list().then(r => setContacts(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const save = async e => {
    e.preventDefault();
    setMsg('');
    try {
      if (editId) {
        await contactsAPI.update(editId, form);
        setMsg('✅ Contact updated');
      } else {
        await contactsAPI.create(form);
        setMsg('✅ Contact added');
      }
      setForm({ name:'', phone:'', relationship:'' });
      setEditId(null);
      setShowForm(false);
      load();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed to save'));
    }
  };

  const remove = async id => {
    if (!window.confirm('Delete this contact?')) return;
    try { await contactsAPI.remove(id); load(); }
    catch { setMsg('❌ Failed to delete'); }
  };

  const startEdit = c => {
    setForm({ name: c.name, phone: c.phone, relationship: c.relationship || '' });
    setEditId(c.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancel = () => {
    setForm({ name:'', phone:'', relationship:'' });
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div className="page anim-fade">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2>👥 Contacts</h2>
        <button className="btn btn-primary" style={{ padding:'8px 16px', fontSize:'0.85rem' }}
          onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Close' : '+ Add'}
        </button>
      </div>

      {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-ok' : 'alert-err'}`}>{msg}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom:18, borderColor:'var(--primary)' }}>
          <h3 style={{ marginBottom:16, fontSize:'1rem' }}>{editId ? 'Edit Contact' : 'New Contact'}</h3>
          <form onSubmit={save}>
            <div className="field">
              <label className="label">Name *</label>
              <input className="input" name="name" placeholder="Full name" value={form.name} onChange={set} required />
            </div>
            <div className="field">
              <label className="label">Phone *</label>
              <input className="input" name="phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set} required />
            </div>
            <div className="field">
              <label className="label">Relationship</label>
              <input className="input" name="relationship" placeholder="e.g. Mother, Friend" value={form.relationship} onChange={set} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-primary" type="submit" style={{ flex:1 }}>
                {editId ? '✏️ Update' : '+ Add Contact'}
              </button>
              <button className="btn btn-ghost" type="button" onClick={cancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading && <div style={{ textAlign:'center', padding:30 }}><span className="spinner" /></div>}

      {!loading && contacts.length === 0 && (
        <div className="empty">
          <div className="empty-icon">👥</div>
          <p style={{ color:'var(--muted)' }}>No trusted contacts yet</p>
          <p style={{ color:'var(--muted)', fontSize:'0.85rem' }}>Add emergency contacts who will be notified when you trigger SOS</p>
          <button className="btn btn-primary" style={{ marginTop:8 }} onClick={() => setShowForm(true)}>
            + Add First Contact
          </button>
        </div>
      )}

      <div>
        {contacts.map(c => (
          <div key={c.id} className="card" style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div className="avatar">{c.name[0].toUpperCase()}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:'0.95rem' }}>{c.name}</div>
              <div style={{ color:'var(--muted)', fontSize:'0.8rem', marginTop:2 }}>{c.phone}</div>
              {c.relationship && <div style={{ color:'var(--faint)', fontSize:'0.75rem', marginTop:1 }}>{c.relationship}</div>}
            </div>
            <div style={{ display:'flex', gap:8, flexShrink:0 }}>
              <a href={`tel:${c.phone}`} className="btn btn-safe" style={{ padding:'6px 10px', fontSize:'0.8rem', minHeight:36 }}>
                📞
              </a>
              <button className="btn btn-ghost" style={{ padding:'6px 10px', fontSize:'0.8rem', minHeight:36 }}
                onClick={() => startEdit(c)}>✏️</button>
              <button className="btn btn-ghost" style={{ padding:'6px 10px', fontSize:'0.8rem', minHeight:36, color:'var(--danger)' }}
                onClick={() => remove(c.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
