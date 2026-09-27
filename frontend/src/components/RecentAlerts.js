// src/components/RecentAlerts.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sosAPI } from '../services/api';

const TRIGGER_ICONS = {
  MANUAL: '👆',
  SHAKE: '📳',
  COUNTDOWN: '⏱️',
  INACTIVITY: '💤',
  DEMO: '🎮',
};

export default function RecentAlerts() {
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    sosAPI.getHistory().then((res) => {
      setAlerts((res.data || []).slice(0, 3));
    }).catch(() => setAlerts([]));
  }, []);

  return (
    <div style={{ marginBottom: 20 }}>
      <div className="section-header">
        <span className="section-title">🔔 Recent Alerts</span>
        <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '4px 10px', minHeight: 'auto' }}
          onClick={() => navigate('/history')}>
          See All
        </button>
      </div>

      {alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px', color: 'var(--color-text-faint)', fontSize: '0.85rem' }}>
          No recent alerts — you're all clear! ✅
        </div>
      ) : (
        alerts.map((alert) => (
          <div key={alert.id} className="alert-item" style={{ marginBottom: 8 }}>
            <div className="alert-icon" style={{
              background: alert.status === 'ACTIVE' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.1)',
              color: alert.status === 'ACTIVE' ? 'var(--color-danger)' : 'var(--color-safe)',
            }}>
              {TRIGGER_ICONS[alert.triggerType] || '🔔'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                {alert.triggerType === 'DEMO' ? '[DEMO] ' : ''}{alert.triggerType} Alert
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>
                {new Date(alert.createdAt).toLocaleString()}
              </p>
            </div>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: alert.status === 'ACTIVE' ? 'var(--color-danger)' :
                     alert.status === 'CANCELLED' ? 'var(--color-safe)' : 'var(--color-text-muted)',
            }}>
              {alert.status}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
