// src/pages/DemoMode.js
// Hackathon Demo Mode - simulate all features for presentation

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function DemoMode() {
  const {
    demoSimulateUnsafeLocation,
    demoSimulateShake,
    demoSimulateSos,
    startCountdown,
    cancelCountdown,
    countdownActive,
    activeSos,
    cancelSos,
    enableSafetyMode,
    safetyMode,
    dispatch,
    addNotification,
  } = useApp();
  const navigate = useNavigate();
  const [runningDemo, setRunningDemo] = useState(null);

  const runStep = async (id, action) => {
    setRunningDemo(id);
    try {
      await action();
    } catch (err) {
      console.error('Demo step error:', err);
    }
    setTimeout(() => setRunningDemo(null), 1500);
  };

  const DEMO_BUTTONS = [
    {
      id: 'unsafe-location',
      icon: '📍',
      title: 'Simulate Unsafe Location',
      desc: 'Moves your position to a high-risk zone and updates risk score to HIGH',
      color: 'var(--color-danger)',
      action: async () => {
        if (!safetyMode) await enableSafetyMode();
        await demoSimulateUnsafeLocation();
      },
    },
    {
      id: 'shake',
      icon: '📳',
      title: 'Simulate Shake Detection',
      desc: 'Triggers the shake/motion detection as if phone was shaken',
      color: 'var(--color-warning)',
      action: async () => {
        if (!safetyMode) await enableSafetyMode();
        demoSimulateShake();
      },
    },
    {
      id: 'countdown',
      icon: '⏱️',
      title: 'Simulate Emergency Countdown',
      desc: 'Starts the 10-second emergency countdown — if not cancelled, SOS activates',
      color: 'var(--color-warning)',
      action: () => {
        if (!countdownActive) startCountdown(10, '[DEMO] Simulated threat detected');
        else cancelCountdown();
      },
    },
    {
      id: 'sos',
      icon: '🚨',
      title: 'Simulate SOS Activation',
      desc: 'Directly activates SOS — shows SOS screen, alarm, and emergency workflow',
      color: 'var(--color-danger)',
      action: async () => {
        if (activeSos) await cancelSos();
        else await demoSimulateSos();
      },
    },
    {
      id: 'travel-risk',
      icon: '🚌',
      title: 'Simulate Travel Risk',
      desc: 'Activates travel mode and triggers a safety check countdown',
      color: '#7c3aed',
      action: async () => {
        dispatch({ type: 'SET_TRAVEL_MODE', value: true, destination: 'Demo Destination' });
        startCountdown(15, '[DEMO] Travel safety check');
        navigate('/travel');
      },
    },
    {
      id: 'contact-alert',
      icon: '👥',
      title: 'Simulate Trusted Contact Alert',
      desc: 'Shows what trusted contacts would receive (simulated SMS/WhatsApp)',
      color: 'var(--color-primary)',
      action: () => {
        addNotification({
          type: 'info',
          title: '[SIMULATED] Alert Sent to Contacts',
          message: 'SMS: "WOMEN SAFETY ALERT: I may be in danger. Please check my live location immediately."',
        });
        addNotification({
          type: 'safe',
          title: '📱 WhatsApp [SIMULATED]',
          message: 'Location shared with 2 emergency contacts',
        });
      },
    },
    {
      id: 'police',
      icon: '🚔',
      title: 'Simulate Police Notification',
      desc: 'Shows simulated police helpline notification flow',
      color: '#3b82f6',
      action: () => {
        addNotification({
          type: 'info',
          title: '🚔 [SIMULATED] Police Notified',
          message: 'Emergency alert with GPS coordinates sent to nearest police station',
        });
      },
    },
    {
      id: 'live-location',
      icon: '📡',
      title: 'Simulate Live Location Sharing',
      desc: 'Shows live location update flow and tracking link',
      color: 'var(--color-safe)',
      action: () => {
        addNotification({
          type: 'safe',
          title: '📡 Live Location Active [SIMULATED]',
          message: 'Location updating every 10 seconds. Tracking link shared with emergency contacts.',
        });
        navigate('/map');
      },
    },
    {
      id: 'fake-call',
      icon: '📞',
      title: 'Trigger Fake Incoming Call',
      desc: 'Shows the fake call screen — useful to escape uncomfortable situations',
      color: '#10b981',
      action: () => {
        window._triggerFakeCall?.();
      },
    },
  ];

  return (
    <div className="page animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div className="badge badge-demo" style={{ marginBottom: 12 }}>
          🎮 HACKATHON DEMO MODE
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Demo Mode</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          Simulate all features without real emergency conditions
        </p>
      </div>

      <div className="demo-banner" style={{ marginBottom: 20 }}>
        <span>⚠️</span>
        <span>All buttons below are SIMULATED for demonstration. No real emergency is triggered.</span>
      </div>

      {/* Demo Scenario Walk-through */}
      <div className="card" style={{ marginBottom: 20, border: '1px solid var(--color-primary)33' }}>
        <p className="card-title" style={{ marginBottom: 12 }}>🎯 Demo Scenario</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            'User opens app on phone or laptop',
            'User starts Travel Safety Mode',
            'User enters a danger zone → risk score increases',
            'Shake/suspicious movement detected',
            'Emergency countdown begins (10 seconds)',
            'User does not cancel → SOS activates',
            'Location updated → trusted contacts notified',
            'Fake call triggered for escape',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'white',
                flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Buttons Grid */}
      <div className="section-header">
        <span className="section-title">🎮 Demo Controls</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {DEMO_BUTTONS.map((btn) => (
          <button
            key={btn.id}
            onClick={() => runStep(btn.id, btn.action)}
            disabled={runningDemo === btn.id}
            style={{
              background: 'var(--color-surface)',
              border: `1px solid ${btn.color}44`,
              borderLeft: `3px solid ${btn.color}`,
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all var(--transition-fast)',
              opacity: runningDemo === btn.id ? 0.7 : 1,
              width: '100%',
            }}
          >
            <span style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: btn.color + '22',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              flexShrink: 0,
            }}>
              {runningDemo === btn.id ? '⏳' : btn.icon}
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: btn.color, marginBottom: 2 }}>
                {btn.title}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{btn.desc}</p>
            </div>
            <span style={{ color: 'var(--color-text-faint)', fontSize: '1rem' }}>▶</span>
          </button>
        ))}
      </div>

      {/* Reset */}
      {(activeSos || countdownActive) && (
        <div className="card" style={{ marginBottom: 16, border: '1px solid var(--color-warning)44', background: 'rgba(245,158,11,0.05)' }}>
          <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--color-warning)' }}>⚠️ Active Demo Scenarios</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {activeSos && (
              <button className="btn btn-safe" style={{ fontSize: '0.85rem', padding: '8px 14px' }} onClick={cancelSos}>
                Cancel Active SOS
              </button>
            )}
            {countdownActive && (
              <button className="btn btn-warning" style={{ fontSize: '0.85rem', padding: '8px 14px' }} onClick={cancelCountdown}>
                Cancel Countdown
              </button>
            )}
          </div>
        </div>
      )}

      <div className="demo-banner" style={{ marginBottom: 16 }}>
        <span>ℹ️</span>
        <span>Judges: all features with [SIMULATED] tags use mock data. Real integrations require Twilio, Firebase, and device permissions.</span>
      </div>
    </div>
  );
}
