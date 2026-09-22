// src/pages/TravelSafety.js
// Travel Safety Mode - periodic check-ins while travelling alone

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function TravelSafety() {
  const {
    travelModeActive,
    travelDestination,
    nextCheckSeconds,
    countdownActive,
    dispatch,
    startCountdown,
    cancelCountdown,
    enableSafetyMode,
    safetyMode,
    addNotification,
  } = useApp();

  const [destination, setDestination] = useState('');
  const [checkInterval, setCheckInterval] = useState(2); // minutes

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s.toString().padStart(2, '0')}s` : `${s}s`;
  };

  const handleStart = async () => {
    if (!destination.trim()) {
      addNotification({ type: 'warning', title: 'Enter Destination', message: 'Please enter your destination first' });
      return;
    }
    if (!safetyMode) await enableSafetyMode();
    dispatch({ type: 'SET_TRAVEL_MODE', value: true, destination });
    addNotification({
      type: 'safe',
      title: '🚌 Travel Safety Active',
      message: `Monitoring your journey to ${destination}. Check-in every ${checkInterval} min.`,
    });
  };

  const handleStop = () => {
    dispatch({ type: 'SET_TRAVEL_MODE', value: false, destination: '' });
    if (countdownActive) cancelCountdown();
    addNotification({ type: 'safe', title: '✅ Travel Mode Stopped', message: 'You have arrived safely.' });
  };

  const handleIAmSafe = () => {
    cancelCountdown();
    dispatch({ type: 'SET_NEXT_CHECK', seconds: checkInterval * 60 });
    addNotification({ type: 'safe', title: '✅ Check-in Confirmed', message: 'Great! Next check-in scheduled.' });
  };

  return (
    <div className="page animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Travel Safety Mode</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          Periodic safety check-ins while travelling alone
        </p>
      </div>

      {/* Active Travel Mode */}
      {travelModeActive ? (
        <div className="animate-fade-in">
          {/* Status */}
          <div className="card" style={{
            marginBottom: 20,
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.4)',
            borderLeft: '4px solid var(--color-safe)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="pulse-dot pulse-dot-safe" />
              <span style={{ fontWeight: 700, color: 'var(--color-safe)', fontSize: '1rem' }}>
                🚌 Travel Safety Active
              </span>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 4 }}>
              Destination: <strong>{travelDestination}</strong>
            </p>
            {!countdownActive && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                Next check-in in: <strong style={{ color: 'var(--color-safe)' }}>{formatTime(nextCheckSeconds)}</strong>
              </p>
            )}
          </div>

          {/* Countdown Active (check-in needed) */}
          {countdownActive && (
            <div className="card animate-fade-in" style={{
              marginBottom: 20,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.4)',
              borderLeft: '4px solid var(--color-danger)',
              textAlign: 'center',
            }}>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-danger)', marginBottom: 8 }}>
                ⚠️ Safety Check Required
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
                Are you safe? Respond within the countdown or SOS will activate.
              </p>
              <button className="btn btn-safe btn-full" style={{ marginBottom: 10 }} onClick={handleIAmSafe}>
                ✅ I'm Safe
              </button>
              <button className="btn btn-danger btn-full" onClick={() => {}}>
                🆘 Send SOS Now
              </button>
            </div>
          )}

          {/* Progress Ring */}
          {!countdownActive && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{ position: 'relative', width: 140, height: 140 }}>
                <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="70" cy="70" r="60" fill="none" stroke="var(--color-surface-3)" strokeWidth="8" />
                  <circle
                    cx="70" cy="70" r="60"
                    fill="none"
                    stroke="var(--color-safe)"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - nextCheckSeconds / (checkInterval * 60))}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-safe)' }}>
                    {formatTime(nextCheckSeconds)}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>until check-in</span>
                </div>
              </div>
            </div>
          )}

          <button className="btn btn-ghost btn-full" onClick={handleStop}>
            ⏹️ Stop Travel Mode (Arrived Safely)
          </button>
        </div>
      ) : (
        <div className="animate-fade-in">
          {/* Setup Form */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">🗺️ Set Up Travel Safety</span>
            </div>
            <div className="form-group">
              <label className="form-label">Destination</label>
              <input
                type="text"
                className="form-input"
                placeholder="Where are you going?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Check-in Interval</label>
              <select
                className="form-input"
                value={checkInterval}
                onChange={(e) => setCheckInterval(Number(e.target.value))}
              >
                <option value={1}>Every 1 minute</option>
                <option value={2}>Every 2 minutes</option>
                <option value={5}>Every 5 minutes</option>
                <option value={10}>Every 10 minutes</option>
                <option value={15}>Every 15 minutes</option>
                <option value={30}>Every 30 minutes</option>
              </select>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleStart}>
              🚌 Start Travel Safety Mode
            </button>
          </div>

          {/* How it works */}
          <div className="card">
            <p className="card-title" style={{ marginBottom: 16 }}>📋 How Travel Safety Works</p>
            {[
              { icon: '1️⃣', text: 'Enter your destination and check-in interval' },
              { icon: '2️⃣', text: 'App monitors your journey in the background' },
              { icon: '3️⃣', text: 'Periodic prompts ask "Are you safe?"' },
              { icon: '4️⃣', text: 'If no response in countdown, SOS activates automatically' },
              { icon: '5️⃣', text: 'Emergency contacts are notified with your location' },
            ].map((step) => (
              <div key={step.icon} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{step.icon}</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
