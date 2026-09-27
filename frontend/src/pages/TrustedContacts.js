// src/pages/TrustedContacts.js
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { contactsAPI } from '../services/api';

const EMPTY_FORM = { name: '', phone: '', email: '', relationship: '', isEmergency: false };

export default function TrustedContacts() {
  const { contacts, loadContacts, addNotification } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditContact(null);
    setShowForm(true);
    setError('');
  };

  const openEdit = (contact) => {
    setForm({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      relationship: contact.relationship || '',
      isEmergency: contact.isEmergency,
    });
    setEditContact(contact);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (editContact) {
        await contactsAPI.update(editContact.id, form);
        addNotification({ type: 'safe', title: '✅ Contact Updated', message: `${form.name} updated successfully` });
      } else {
        await contactsAPI.create(form);
        addNotification({ type: 'safe', title: '✅ Contact Added', message: `${form.name} added as trusted contact` });
      }
      await loadContacts();
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contact) => {
    if (!window.confirm(`Remove ${contact.name} from trusted contacts?`)) return;
    try {
      await contactsAPI.delete(contact.id);
      addNotification({ type: 'warning', title: 'Contact Removed', message: `${contact.name} removed` });
      await loadContacts();
    } catch {
      addNotification({ type: 'danger', title: 'Error', message: 'Failed to remove contact' });
    }
  };

  const emergencyContacts = contacts.filter((c) => c.isEmergency);
  const otherContacts = contacts.filter((c) => !c.isEmergency);

  return (
    <div className="page animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Trusted Contacts</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{contacts.length} contacts</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
          + Add
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card animate-slide-up" style={{ marginBottom: 20, border: '1px solid var(--color-primary)44' }}>
          <div className="card-header" style={{ marginBottom: 16 }}>
            <span className="card-title">{editContact ? '✏️ Edit Contact' : '➕ Add Contact'}</span>
            <button className="btn-icon" onClick={() => setShowForm(false)} aria-label="Close">✕</button>
          </div>

          {error && (
            <div className="badge badge-danger" style={{ marginBottom: 12, display: 'block', padding: '8px 12px', fontSize: '0.8rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { name: 'name', label: 'Full Name *', type: 'text', placeholder: 'Contact name' },
              { name: 'phone', label: 'Phone Number *', type: 'tel', placeholder: '+91 98765 43210' },
              { name: 'email', label: 'Email (optional)', type: 'email', placeholder: 'email@example.com' },
              { name: 'relationship', label: 'Relationship', type: 'text', placeholder: 'Mother, Friend, Partner...' },
            ].map(({ name, label, type, placeholder }) => (
              <div className="form-group" key={name}>
                <label className="form-label">{label}</label>
                <input
                  type={type}
                  name={name}
                  className="form-input"
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={handleChange}
                />
              </div>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <label className="toggle-switch">
                <input type="checkbox" name="isEmergency" checked={form.isEmergency} onChange={handleChange} />
                <span className="toggle-slider" />
              </label>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Emergency Contact</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Notified first during SOS alerts
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : editContact ? '💾 Save Changes' : '➕ Add Contact'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Emergency Contacts */}
      {emergencyContacts.length > 0 && (
        <>
          <div className="section-header">
            <span className="section-title">🚨 Emergency Contacts ({emergencyContacts.length})</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {emergencyContacts.map((c) => (
              <ContactCard key={c.id} contact={c} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        </>
      )}

      {/* Other Contacts */}
      {otherContacts.length > 0 && (
        <>
          <div className="section-header">
            <span className="section-title">👥 Other Contacts ({otherContacts.length})</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {otherContacts.map((c) => (
              <ContactCard key={c.id} contact={c} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        </>
      )}

      {contacts.length === 0 && !showForm && (
        <div className="empty-state">
          <span className="empty-state-icon">👥</span>
          <h3>No Trusted Contacts</h3>
          <p className="empty-state-text">Add people who should be notified in an emergency</p>
          <button className="btn btn-primary" onClick={openAdd}>Add First Contact</button>
        </div>
      )}

      {/* Info */}
      <div className="card" style={{ marginTop: 16, background: 'rgba(233,30,140,0.05)', border: '1px solid rgba(233,30,140,0.2)' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          🔒 Contact information is stored securely and only used for emergency alerts. Emergency contacts are notified when SOS is activated.
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: 6 }}>
          [SIMULATED] SMS/WhatsApp notifications are simulated in demo mode. Configure Twilio to send real alerts.
        </p>
      </div>
    </div>
  );
}

function ContactCard({ contact, onEdit, onDelete }) {
  return (
    <div className="card" style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      borderLeft: contact.isEmergency ? '3px solid var(--color-danger)' : '1px solid var(--color-border)',
    }}>
      <div className="contact-avatar">{contact.name[0].toUpperCase()}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{contact.name}</p>
          {contact.isEmergency && <span className="badge badge-danger" style={{ fontSize: '0.6rem' }}>🚨 SOS</span>}
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{contact.phone}</p>
        {contact.relationship && (
          <p style={{ color: 'var(--color-text-faint)', fontSize: '0.75rem' }}>{contact.relationship}</p>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <a href={`tel:${contact.phone}`} className="btn-icon" aria-label={`Call ${contact.name}`}>📞</a>
        <button className="btn-icon" onClick={() => onEdit(contact)} aria-label={`Edit ${contact.name}`}>✏️</button>
        <button className="btn-icon" onClick={() => onDelete(contact)} aria-label={`Delete ${contact.name}`}
          style={{ color: 'var(--color-danger)' }}>🗑️</button>
      </div>
    </div>
  );
}
