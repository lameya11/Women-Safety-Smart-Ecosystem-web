// src/components/EmergencyCountdown.js
// Full-screen emergency countdown overlay
// Shown when suspicious activity is detected

import React from 'react';
import { useApp } from '../context/AppContext';

export default function EmergencyCountdown() {
  const { countdownSeconds, countdownReason, cancelCountdown, activateSos } = useApp();

  const TOTAL = 10;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - countdownSeconds / TOTAL);

  const handleSos = () => {
    cancelCountdown();
    activateSos('MANUAL');
  };

  return (
    <div
      className="modal-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-label="Emergency countdown"
      style={{ alignItems: 'center', zIndex: 900 }}
    >
      <div className="modal-sheet" style={{
        textAlign: 'center',
        background: 'linear-gradient(180deg, #1a0a0a 0%, var(--color-surface) 100%)',
        border: '1px solid rgba(239,68,68,0.5)',
        maxWidth: 380,
      }}>
        {/* Warning Icon */}
        <div style={{ fontSize: '3rem', marginBottom: 8, animation: 'pulse 0.8s ease infinite' }}>⚠️</div>

        <h2 style={{ color: 'var(--color-danger)', marginBottom: 4, fontSize: '1.3rem' }}>
          ARE YOU SAFE?
        </h2>

        {countdownReason && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
            {countdownReason}
          </p>
        )}

        {/* Countdown Ring */}
        <div className="countdown-container" style={{ margin: '0 auto 24px', width: 130, height: 130 }}>
          <svg width="130" height="130" className="countdown-svg">
            <circle
              cx="65" cy="65" r={radius}
              fill="none"
              stroke="var(--color-surface-3)"
              strokeWidth="8"
            />
            <circle
              cx="65" cy="65" r={radius}
              fill="none"
              stroke="var(--color-danger)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span className="countdown-number">
            {countdownSeconds}
          </span>
        </div>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>
          SOS will activate automatically in{' '}
          <strong style={{ color: 'var(--color-danger)' }}>{countdownSeconds}</strong>{' '}
          {countdownSeconds === 1 ? 'second' : 'seconds'}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            className="btn btn-safe"
            style={{ fontSize: '1rem', padding: '16px', fontWeight: 700 }}
            onClick={cancelCountdown}
          >
            ✅ I'M SAFE
          </button>
          <button
            className="btn btn-danger"
            style={{ fontSize: '1rem', padding: '16px', fontWeight: 700 }}
            onClick={handleSos}
          >
            🆘 SEND SOS NOW
          </button>
        </div>
      </div>
    </div>
  );
}
