// src/pages/Dashboard.js
// Main dashboard - central hub of the application

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RiskScoreRing from '../components/RiskScoreRing';
import QuickActions from '../components/QuickActions';
import RecentAlerts from '../components/RecentAlerts';
import LocationCard from '../components/LocationCard';

export default function Dashboard() {
  const {
    user,
    currentStatus,
    safetyMode,
    riskScore,
    riskLevel,
    riskFactors,
    contacts,
    location,
    enableSafetyMode,
    disableSafetyMode,
    activateSos,
    demoMode,
  } = useApp();
  const navigate = useNavigate();

  const statusColors = {
    SAFE: 'var(--color-safe)',
    WARNING: 'var(--color-warning)',
    SOS: 'var(--color-danger)',
  };

  const statusEmojis = { SAFE: '✅', WARNING: '⚠️', SOS: '🚨' };

  return (
    <div className="page animate-fade-in">
      {/* Header Greeting */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          Welcome back,
        </p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
          {user?.name || 'Stay Safe'} 👋
        </h1>
      </div>

      {/* Status Banner */}
      <div
        className="card"
        style={{
          marginBottom: 20,
          background: `linear-gradient(135deg, ${statusColors[currentStatus]}22, ${statusColors[currentStatus]}11)`,
          border: `1px solid ${statusColors[currentStatus]}44`,
          borderLeft: `4px solid ${statusColors[currentStatus]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              className={`pulse-dot ${
                currentStatus === 'SAFE' ? 'pulse-dot-safe' :
                currentStatus === 'WARNING' ? 'pulse-dot-warning' : 'pulse-dot-danger'
              }`}
            />
            <span style={{ fontWeight: 700, fontSize: '1rem', color: statusColors[currentStatus] }}>
              {statusEmojis[currentStatus]} {currentStatus}
            </span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
            {currentStatus === 'SAFE' && 'All systems normal'}
            {currentStatus === 'WARNING' && 'Potential risk detected. Stay alert.'}
            {currentStatus === 'SOS' && 'Emergency active! Help is on the way.'}
          </p>
        </div>
        <RiskScoreRing score={riskScore} level={riskLevel} size={60} />
      </div>

      {/* Safety Mode Toggle */}
      <div className={`safety-mode-card ${safetyMode ? 'active' : ''}`} style={{ marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: '1.2rem' }}>🛡️</span>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Safety Mode</span>
            {safetyMode && <span className="badge badge-safe" style={{ fontSize: '0.65rem' }}>ACTIVE</span>}
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            {safetyMode
              ? 'Monitoring sensors, location & risk'
              : 'Enable for real-time protection'}
          </p>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={safetyMode}
            onChange={(e) => e.target.checked ? enableSafetyMode() : disableSafetyMode()}
            aria-label="Toggle Safety Mode"
          />
          <span className="toggle-slider" />
        </label>
      </div>

      {/* Big SOS Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <button
            className="sos-button"
            onClick={() => navigate('/sos')}
            aria-label="Emergency SOS"
          >
            <span style={{ fontSize: '1.8rem' }}>🆘</span>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginTop: 2 }}>SOS</span>
          </button>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: 12 }}>
            Tap to activate emergency SOS
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Location Card */}
      <LocationCard />

      {/* Risk Factors */}
      {riskFactors.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <span className="card-title">⚡ Risk Factors</span>
            <span className={`badge ${
              riskLevel === 'LOW' ? 'badge-safe' :
              riskLevel === 'MEDIUM' ? 'badge-warning' : 'badge-danger'
            }`}>
              {riskLevel} RISK
            </span>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {riskFactors.slice(0, 4).map((f, i) => (
              <li key={i} style={{
                fontSize: '0.85rem',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}>
                <span>•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Trusted Contacts Summary */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">👥 Trusted Contacts</span>
          <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 12px', minHeight: 'auto' }}
            onClick={() => navigate('/contacts')}>
            Manage
          </button>
        </div>
        {contacts.length === 0 ? (
          <div className="empty-state" style={{ padding: '16px 0' }}>
            <span className="empty-state-icon">👥</span>
            <p className="empty-state-text">No trusted contacts yet</p>
            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={() => navigate('/contacts')}>
              Add Contact
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {contacts.slice(0, 4).map((c) => (
              <div key={c.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div className="contact-avatar" style={{ width: 48, height: 48, fontSize: '1rem' }}>
                  {c.name[0].toUpperCase()}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', maxWidth: 60, textAlign: 'center' }}
                  className="truncate">
                  {c.name.split(' ')[0]}
                </span>
                {c.isEmergency && (
                  <span style={{ fontSize: '0.6rem', color: 'var(--color-danger)', fontWeight: 700 }}>SOS</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Alerts */}
      <RecentAlerts />

      {/* Demo Mode Button */}
      <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 8 }}>
        <button
          className="btn btn-ghost"
          onClick={() => navigate('/demo')}
          style={{ fontSize: '0.85rem', borderStyle: 'dashed' }}
        >
          🎮 Open Demo Mode
        </button>
      </div>
    </div>
  );
}
