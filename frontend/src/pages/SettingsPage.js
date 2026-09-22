// src/pages/SettingsPage.js
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import sensorService from '../services/sensorService';

export default function SettingsPage() {
  const { user, logout, safetyMode, enableSafetyMode, disableSafetyMode, addNotification } = useApp();
  const [sensitivity, setSensitivity] = useState('medium');
  const [countdownTime, setCountdownTime] = useState(10);
  const [theme, setTheme] = useState('dark');

  const handleSensitivityChange = (level) => {
    setSensitivity(level);
    sensorService.setSensitivity(level);
    addNotification({ type: 'safe', title: '⚙️ Sensitivity Updated', message: `Sensor sensitivity set to ${level}` });
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  return (
    <div className="page animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Settings</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Configure your safety preferences</p>
      </div>

      {/* Profile */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.3rem',
              color: 'white',
            }}>
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.name}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{user?.email}</p>
              {user?.phone && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>{user.phone}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Safety Mode */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="section-title" style={{ marginBottom: 14 }}>🛡️ SAFETY SETTINGS</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid var(--color-border)', marginBottom: 14 }}>
          <div>
            <p style={{ fontWeight: 600 }}>Safety Mode</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Monitor sensors and location</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={safetyMode} onChange={(e) => e.target.checked ? enableSafetyMode() : disableSafetyMode()} />
            <span className="toggle-slider" />
          </label>
        </div>

        <div style={{ marginBottom: 14 }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Detection Sensitivity</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 10 }}>
            Higher sensitivity triggers alerts more easily
          </p>
          <div className="grid-3">
            {['low', 'medium', 'high'].map((level) => (
              <button
                key={level}
                className={`btn ${sensitivity === level ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.8rem', padding: '8px 4px', textTransform: 'capitalize' }}
                onClick={() => handleSensitivityChange(level)}
              >
                {level === 'low' ? '🟢' : level === 'medium' ? '🟡' : '🔴'} {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Countdown Duration: {countdownTime}s</p>
          <input
            type="range"
            min={5}
            max={30}
            step={5}
            value={countdownTime}
            onChange={(e) => setCountdownTime(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>
            <span>5s</span><span>15s</span><span>30s</span>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="section-title" style={{ marginBottom: 14 }}>🔐 PERMISSIONS</p>
        {[
          { icon: '📍', name: 'Location (GPS)', desc: 'Required for safety map and SOS location', required: true },
          { icon: '📳', name: 'Device Motion', desc: 'For shake and movement detection', required: true },
          { icon: '🎤', name: 'Microphone', desc: 'For emergency audio recording (optional)', required: false },
          { icon: '📷', name: 'Camera', desc: 'For emergency video recording (optional)', required: false },
          { icon: '🔔', name: 'Notifications', desc: 'For safety alerts and check-ins', required: false },
        ].map((perm) => (
          <div key={perm.name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{perm.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{perm.name}
                {perm.required && <span style={{ color: 'var(--color-danger)', marginLeft: 4, fontSize: '0.75rem' }}>*</span>}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{perm.desc}</p>
            </div>
          </div>
        ))}
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>* Required permissions — app requests these when Safety Mode is enabled</p>
      </div>

      {/* About */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="section-title" style={{ marginBottom: 14 }}>ℹ️ ABOUT</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <InfoRow label="App Version" value="1.0.0" />
          <InfoRow label="Backend Status" value="Connected" />
          <InfoRow label="Map Provider" value="OpenStreetMap (Leaflet)" />
          <InfoRow label="Storage" value="Firebase/In-Memory" />
          <InfoRow label="Build" value="Hackathon Demo" />
        </div>
      </div>

      {/* Sign Out */}
      <button className="btn btn-danger btn-full" style={{ marginBottom: 24 }} onClick={handleLogout}>
        🚪 Sign Out
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-faint)', marginBottom: 16 }}>
        SafeGuard Women Safety Smart Ecosystem<br />
        Built for hackathon demonstration
      </p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{value}</span>
    </div>
  );
}
