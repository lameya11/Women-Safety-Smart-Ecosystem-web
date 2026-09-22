// src/pages/SafetyReports.js
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { reportsAPI } from '../services/api';

const INCIDENT_TYPES = [
  { value: 'HARASSMENT', label: 'Harassment', icon: '😡' },
  { value: 'THEFT', label: 'Theft/Snatching', icon: '🦹' },
  { value: 'ASSAULT', label: 'Physical Assault', icon: '⚠️' },
  { value: 'SUSPICIOUS_ACTIVITY', label: 'Suspicious Activity', icon: '🔍' },
  { value: 'POOR_LIGHTING', label: 'Poor Lighting', icon: '🌑' },
  { value: 'OTHER', label: 'Other', icon: '📝' },
];

export default function SafetyReports() {
  const { location, addNotification } = useApp();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    incidentType: 'HARASSMENT',
    description: '',
    severity: 'MEDIUM',
    address: '',
    latitude: '',
    longitude: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (location) {
      setForm((f) => ({
        ...f,
        latitude: location.latitude.toFixed(6),
        longitude: location.longitude.toFixed(6),
      }));
    }
  }, [location]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await reportsAPI.getAll();
      setReports(res.data || []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.latitude || !form.longitude) {
      addNotification({ type: 'warning', title: 'Location Required', message: 'Enable GPS or enter coordinates manually' });
      return;
    }
    setSubmitting(true);
    try {
      await reportsAPI.create({
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      });
      addNotification({ type: 'safe', title: '✅ Report Submitted', message: 'Thank you for keeping the community safe!' });
      setShowForm(false);
      await loadReports();
    } catch (err) {
      addNotification({ type: 'danger', title: 'Submit Failed', message: err.response?.data?.error || 'Please try again' });
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityColor = (s) => ({ HIGH: 'var(--color-danger)', MEDIUM: 'var(--color-warning)', LOW: 'var(--color-safe)' }[s] || '#6b7280');
  const getIncidentIcon = (type) => INCIDENT_TYPES.find((t) => t.value === type)?.icon || '📝';

  return (
    <div className="page animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Safety Reports</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Community crowdsourced safety data</p>
        </div>
        <button className="btn btn-primary" style={{ padding: '10px 14px', fontSize: '0.8rem' }}
          onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕' : '+ Report'}
        </button>
      </div>

      {/* Submit Form */}
      {showForm && (
        <div className="card animate-slide-up" style={{ marginBottom: 20, border: '1px solid var(--color-primary)44' }}>
          <p className="card-title" style={{ marginBottom: 16 }}>📝 Report Unsafe Location</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Incident Type</label>
              <select className="form-input" value={form.incidentType}
                onChange={(e) => setForm((f) => ({ ...f, incidentType: e.target.value }))}>
                {INCIDENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Severity</label>
              <select className="form-input" value={form.severity}
                onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea className="form-input" style={{ minHeight: 80, resize: 'vertical' }}
                placeholder="Brief description of what happened..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                maxLength={500}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Address (optional)</label>
              <input type="text" className="form-input" placeholder="Street name or landmark"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div className="grid-2" style={{ gap: 10, marginBottom: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Latitude</label>
                <input type="number" step="0.000001" className="form-input"
                  placeholder="28.6139"
                  value={form.latitude}
                  onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Longitude</label>
                <input type="number" step="0.000001" className="form-input"
                  placeholder="77.2090"
                  value={form.longitude}
                  onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                  required
                />
              </div>
            </div>
            {location && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-safe)', marginBottom: 12 }}>
                ✅ Using your current GPS location
              </p>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                {submitting ? <span className="spinner" style={{ width: 18, height: 18 }} /> : '📤 Submit Report'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <div className="spinner" />
        </div>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📝</span>
          <h3>No Reports Yet</h3>
          <p className="empty-state-text">Be the first to report an unsafe location in your area</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reports.map((report) => (
            <div key={report.id} className="card" style={{ borderLeft: `3px solid ${getSeverityColor(report.severity)}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div className="alert-icon" style={{
                  background: getSeverityColor(report.severity) + '22',
                  fontSize: '1.2rem',
                }}>
                  {getIncidentIcon(report.incidentType)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{report.incidentType.replace('_', ' ')}</span>
                    <span className={`badge ${report.severity === 'HIGH' ? 'badge-danger' : report.severity === 'MEDIUM' ? 'badge-warning' : 'badge-safe'}`}
                      style={{ fontSize: '0.6rem' }}>
                      {report.severity}
                    </span>
                  </div>
                  {report.description && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>{report.description}</p>
                  )}
                  {report.address && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-faint)' }}>📍 {report.address}</p>
                  )}
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: 4 }}>
                    {new Date(report.createdAt).toLocaleDateString()} {new Date(report.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="demo-banner" style={{ marginTop: 20 }}>
        <span>ℹ️</span>
        <span>Reports are anonymized. Your identity is never shared publicly.</span>
      </div>
    </div>
  );
}
