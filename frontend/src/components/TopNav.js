// src/components/TopNav.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function TopNav({ onFakeCall }) {
  const { currentStatus, riskScore, activeSos, user } = useApp();
  const navigate = useNavigate();

  const statusColor = {
    SAFE: 'var(--color-safe)',
    WARNING: 'var(--color-warning)',
    SOS: 'var(--color-danger)',
  }[currentStatus] || 'var(--color-safe)';

  return (
    <header className="top-nav" role="banner">
      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
        aria-label="SafeGuard Home"
      >
        <span style={{ fontSize: '1.3rem' }}>🛡️</span>
        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary)' }}>SafeGuard</span>
      </button>

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Risk badge */}
        {riskScore > 0 && (
          <div style={{
            background: 'var(--color-surface-2)',
            border: `1px solid ${statusColor}44`,
            borderRadius: 'var(--radius-full)',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.8rem',
          }}>
            <span className={`pulse-dot ${
              currentStatus === 'SAFE' ? 'pulse-dot-safe' :
              currentStatus === 'WARNING' ? 'pulse-dot-warning' : 'pulse-dot-danger'
            }`} />
            <span style={{ color: statusColor, fontWeight: 700 }}>{currentStatus}</span>
          </div>
        )}

        {/* SOS shortcut */}
        <button
          onClick={() => navigate('/sos')}
          style={{
            background: activeSos ? 'var(--color-danger)' : 'var(--color-surface-2)',
            border: `1px solid ${activeSos ? 'var(--color-danger)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '6px 12px',
            color: activeSos ? 'white' : 'var(--color-danger)',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            animation: activeSos ? 'pulse 1s ease infinite' : 'none',
          }}
          aria-label="Emergency SOS"
        >
          🆘 SOS
        </button>

        {/* Demo nav */}
        <button
          onClick={() => navigate('/demo')}
          title="Demo Mode"
          style={{
            background: 'none',
            border: '1px dashed var(--color-warning)',
            borderRadius: 'var(--radius-sm)',
            padding: '5px 8px',
            color: 'var(--color-warning)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          🎮
        </button>
      </div>
    </header>
  );
}
