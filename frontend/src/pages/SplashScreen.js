// src/pages/SplashScreen.js
import React from 'react';

export default function SplashScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--color-bg)',
      gap: '24px',
    }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        animation: 'pulse 2s ease infinite',
      }}>
        🛡️
      </div>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary)' }}>SafeGuard</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>Women Safety Smart Ecosystem</p>
      </div>
      <div className="spinner" />
    </div>
  );
}
