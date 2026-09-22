// src/pages/SOSPage.js
// Emergency SOS activation and management

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function SOSPage() {
  const { activeSos, activateSos, cancelSos, riskScore, location, contacts, currentStatus } = useApp();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const emergencyContacts = contacts.filter((c) => c.isEmergency);

  const handleSosPress = () => {
    if (confirming) {
      handleActivate();
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 5000);
    }
  };

  const handleActivate = async () => {
    setLoading(true);
    setConfirming(false);
    try {
      await activateSos('MANUAL');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await cancelSos();
    } finally {
      setLoading(false);
    }
  };

  const HELPLINES = [
    { name: 'Women Helpline', number: '1091', icon: '👮‍♀️', color: 'var(--color-primary)' },
    { name: 'Police', number: '100', icon: '🚔', color: '#3b82f6' },
    { name: 'Emergency', number: '112', icon: '🚨', color: 'var(--color-danger)' },
    { name: 'Ambulance', number: '108', icon: '🚑', color: 'var(--color-warning)' },
  ];

  return (
    <div className="page animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Emergency SOS</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          Hold the SOS button in an emergency
        </p>
      </div>

      {/* Current Status */}
      {activeSos && (
        <div className="card animate-fade-in" style={{
          marginBottom: 20,
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.4)',
          borderLeft: '4px solid var(--color-danger)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: '1.3rem' }}>🚨</span>
            <span style={{ fontWeight: 700, color: 'var(--color-danger)', fontSize: '1rem' }}>SOS ACTIVE</span>
            {activeSos.isDemo && <span className="badge badge-demo" style={{ fontSize: '0.65rem' }}>DEMO</span>}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
            Emergency activated at {new Date(activeSos.createdAt).toLocaleTimeString()}
          </p>
          {activeSos.latitude && (
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
              📍 {activeSos.latitude.toFixed(5)}, {activeSos.longitude.toFixed(5)}
            </p>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-safe btn-full" onClick={handleCancel} disabled={loading}>
              ✅ I'm Safe - Cancel SOS
            </button>
          </div>
          {activeSos.isOffline && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-warning)', marginTop: 8 }}>
              ⚠️ Offline mode - backend connection unavailable
            </p>
          )}
        </div>
      )}

      {/* Main SOS Button */}
      {!activeSos && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          {confirming ? (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <p style={{ color: 'var(--color-danger)', fontWeight: 700, marginBottom: 8 }}>
                ⚠️ Tap again to confirm SOS
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                (Auto-cancels in 5 seconds)
              </p>
            </div>
          ) : null}

          <button
            className={`sos-button ${confirming ? 'sos-active' : ''}`}
            style={{ width: 150, height: 150, fontSize: '1.2rem' }}
            onClick={handleSosPress}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'white' }} />
            ) : (
              <>
                <span style={{ fontSize: '2rem' }}>🆘</span>
                <span style={{ letterSpacing: '0.15em', marginTop: 4 }}>
                  {confirming ? 'CONFIRM' : 'SOS'}
                </span>
              </>
            )}
          </button>

          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: 16, textAlign: 'center', maxWidth: 240 }}>
            {confirming
              ? 'Tap once more to activate emergency SOS'
              : 'Tap once to arm, tap again to activate. Triggers in 10-second countdown if no response.'}
          </p>
        </div>
      )}

      {/* Risk Info */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">📊 Current Risk</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: `conic-gradient(${
              riskScore > 70 ? 'var(--color-danger)' :
              riskScore > 30 ? 'var(--color-warning)' : 'var(--color-safe)'
            } ${riskScore * 3.6}deg, var(--color-surface-3) 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 0 8px var(--color-surface)',
          }}>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: 900,
              color: riskScore > 70 ? 'var(--color-danger)' : riskScore > 30 ? 'var(--color-warning)' : 'var(--color-safe)',
            }}>
              {riskScore}
            </span>
          </div>
          <div>
            <p style={{ fontWeight: 700, color: riskScore > 70 ? 'var(--color-danger)' : riskScore > 30 ? 'var(--color-warning)' : 'var(--color-safe)' }}>
              {riskScore > 70 ? 'HIGH RISK' : riskScore > 30 ? 'MEDIUM RISK' : 'LOW RISK'}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {location ? `📍 ${location.latitude?.toFixed(4)}, ${location.longitude?.toFixed(4)}` : 'Location not available'}
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">👥 Emergency Contacts</span>
        </div>
        {emergencyContacts.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            No emergency contacts. <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.8rem', minHeight: 'auto' }} onClick={() => navigate('/contacts')}>Add contacts →</button>
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {emergencyContacts.map((c) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="contact-avatar">{c.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{c.phone}</p>
                </div>
                <a href={`tel:${c.phone}`} className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem', minHeight: 'auto' }}>
                  📞 Call
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Helplines */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">🆘 Emergency Helplines</span>
        </div>
        <div className="grid-2" style={{ gap: 10 }}>
          {HELPLINES.map((h) => (
            <a key={h.number} href={`tel:${h.number}`}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '14px 10px',
                gap: 6,
                textDecoration: 'none',
                borderColor: h.color + '44',
                background: h.color + '11',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{h.icon}</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: h.color }}>{h.number}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>{h.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Fake Call */}
      <button
        className="btn btn-ghost btn-full"
        style={{ marginBottom: 16 }}
        onClick={() => window._triggerFakeCall?.()}
      >
        📞 Trigger Fake Call (Emergency Escape)
      </button>

      {/* Message */}
      <div className="card" style={{ marginBottom: 16, background: 'rgba(233,30,140,0.05)', border: '1px solid rgba(233,30,140,0.2)' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          📋 Emergency Message:<br />
          <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>
            "WOMEN SAFETY ALERT: I may be in danger. Please check my live location and contact me immediately."
          </span>
        </p>
        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', marginTop: 8 }}>
          [SIMULATED] SMS/WhatsApp alerts are demo-mode only. Configure Twilio in backend for real delivery.
        </p>
      </div>
    </div>
  );
}
