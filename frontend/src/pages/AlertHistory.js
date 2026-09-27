// src/pages/AlertHistory.js
import React, { useEffect, useState } from 'react';
import { sosAPI } from '../services/api';

const STATUS_COLORS = { ACTIVE: 'var(--color-danger)', CANCELLED: 'var(--color-safe)', RESOLVED: 'var(--color-text-muted)' };
const TRIGGER_LABELS = {
  MANUAL: '👆 Manual SOS',
  SHAKE: '📳 Shake Detected',
  COUNTDOWN: '⏱️ Countdown Expired',
  INACTIVITY: '💤 Inactivity',
  VOICE: '🎤 Voice Keyword',
  DEMO: '🎮 Demo Mode',
};

export default function AlertHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await sosAPI.getHistory();
      setHistory(res.data || []);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Alert History</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{history.length} alerts recorded</p>
        </div>
        <button className="btn btn-ghost" onClick={loadHistory} style={{ padding: '8px 12px', fontSize: '0.8rem', minHeight: 'auto' }}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <div className="spinner" />
        </div>
      ) : history.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">🔔</span>
          <h3>No Alerts Yet</h3>
          <p className="empty-state-text">Your SOS history will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.map((alert) => (
            <div key={alert.id} className="card" style={{
              borderLeft: `3px solid ${STATUS_COLORS[alert.status] || 'var(--color-border)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {TRIGGER_LABELS[alert.triggerType] || alert.triggerType}
                    </span>
                    {alert.isDemo && <span className="badge badge-demo" style={{ fontSize: '0.6rem' }}>DEMO</span>}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: STATUS_COLORS[alert.status],
                  textTransform: 'uppercase',
                }}>
                  {alert.status}
                </span>
              </div>

              <div className="grid-2" style={{ gap: 8 }}>
                {alert.riskScore !== undefined && (
                  <div style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Risk Score</p>
                    <p style={{
                      fontWeight: 700,
                      color: alert.riskScore > 70 ? 'var(--color-danger)' : alert.riskScore > 30 ? 'var(--color-warning)' : 'var(--color-safe)',
                    }}>
                      {alert.riskScore}/100
                    </p>
                  </div>
                )}
                {alert.contactsNotified && (
                  <div style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contacts</p>
                    <p style={{ fontWeight: 700, color: 'var(--color-text)' }}>{alert.contactsNotified.length} notified</p>
                  </div>
                )}
              </div>

              {alert.latitude && alert.longitude && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: 8 }}>
                  📍 {alert.latitude.toFixed(5)}, {alert.longitude.toFixed(5)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
