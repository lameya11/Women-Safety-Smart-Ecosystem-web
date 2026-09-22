// src/components/SOSOverlay.js
// SOS active full-screen overlay

import React from 'react';
import { useApp } from '../context/AppContext';
import audioService from '../services/audioService';

export default function SOSOverlay({ onFakeCall }) {
  const { activeSos, cancelSos, location, contacts, alarmActive, dispatch } = useApp();

  if (!activeSos) return null;

  const emergencyContacts = contacts.filter((c) => c.isEmergency);

  const handleCancel = async () => {
    await cancelSos();
  };

  const toggleAlarm = () => {
    if (alarmActive) {
      audioService.stopAlarm();
      dispatch({ type: 'SET_ALARM', value: false });
    } else {
      audioService.playAlarm();
      dispatch({ type: 'SET_ALARM', value: true });
    }
  };

  return (
    <div className="sos-fullscreen" role="alertdialog" aria-modal="true" aria-label="SOS Active">
      {/* Flashing header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
          {new Date().toLocaleTimeString()}
        </span>
        {activeSos.isDemo && (
          <span className="badge badge-demo">🎮 DEMO MODE</span>
        )}
      </div>

      {/* SOS Icon */}
      <div style={{
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: 'var(--color-danger)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3rem',
        animation: 'sos-flash 1s ease infinite',
        marginBottom: 20,
        boxShadow: '0 0 60px rgba(239,68,68,0.8)',
      }}>
        🆘
      </div>

      <h1 style={{ color: 'var(--color-danger)', fontSize: '2rem', fontWeight: 900, marginBottom: 8, letterSpacing: '0.1em' }}>
        SOS ACTIVE
      </h1>

      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', textAlign: 'center', maxWidth: 280, marginBottom: 24 }}>
        Emergency alert sent. Help is on the way.
        {emergencyContacts.length > 0 && ` ${emergencyContacts.length} contact(s) notified [SIMULATED].`}
      </p>

      {/* Location */}
      {location && (
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          marginBottom: 20,
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.8)',
          textAlign: 'center',
        }}>
          📍 {location.latitude?.toFixed(5)}, {location.longitude?.toFixed(5)}<br />
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
            Location updating every 10s
          </span>
        </div>
      )}

      {/* Emergency Contacts */}
      {emergencyContacts.length > 0 && (
        <div style={{ width: '100%', maxWidth: 300, marginBottom: 24 }}>
          {emergencyContacts.slice(0, 3).map((c) => (
            <a
              key={c.id}
              href={`tel:${c.phone}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                marginBottom: 8,
                textDecoration: 'none',
                color: 'white',
              }}
            >
              <div className="contact-avatar" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>{c.name[0]}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</p>
                <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{c.phone}</p>
              </div>
              <span style={{ fontSize: '1.2rem' }}>📞</span>
            </a>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={toggleAlarm}
          style={{
            background: alarmActive ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            color: 'white',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          {alarmActive ? '🔇 Stop Alarm' : '🔊 Alarm'}
        </button>
        <button
          onClick={onFakeCall}
          style={{
            background: 'rgba(16,185,129,0.3)',
            border: '1px solid rgba(16,185,129,0.5)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            color: 'white',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          📞 Fake Call
        </button>
      </div>

      {/* Cancel */}
      <button
        className="btn btn-safe"
        style={{ padding: '16px 32px', fontSize: '1rem', fontWeight: 700 }}
        onClick={handleCancel}
      >
        ✅ I'M SAFE — CANCEL SOS
      </button>

      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: 16, textAlign: 'center' }}>
        Tap above to confirm you are safe and cancel the emergency
      </p>
    </div>
  );
}
