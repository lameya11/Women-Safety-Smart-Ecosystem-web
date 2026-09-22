// src/components/FakeCallScreen.js
// Realistic fake incoming call screen
// Provides an escape mechanism in uncomfortable situations

import React, { useEffect, useState } from 'react';
import audioService from '../services/audioService';

const FAKE_CALLERS = [
  { name: 'Mom 💕', number: '+91 98765 43210', initials: 'M' },
  { name: 'Sister', number: '+91 87654 32109', initials: 'S' },
  { name: 'Friend Priya', number: '+91 76543 21098', initials: 'P' },
  { name: 'Office HR', number: '+91 11 2345 6789', initials: 'O' },
];

export default function FakeCallScreen({ onClose }) {
  const [caller] = useState(() => FAKE_CALLERS[Math.floor(Math.random() * FAKE_CALLERS.length)]);
  const [accepted, setAccepted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    // Start ringtone
    audioService.playRingtone();
    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate([400, 200, 400, 200, 400]);
    }
    return () => {
      audioService.stopRingtone();
      if (navigator.vibrate) navigator.vibrate(0);
    };
  }, []);

  useEffect(() => {
    if (!accepted) return;
    audioService.stopRingtone();
    const timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(timer);
  }, [accepted]);

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleDecline = () => {
    audioService.stopRingtone();
    onClose();
  };

  return (
    <div className="fake-call-screen" role="dialog" aria-modal="true" aria-label="Incoming call">
      {/* Phone status area */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.6)',
      }}>
        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span>📶 📷 🔋</span>
      </div>

      {/* Call info */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        {/* Avatar */}
        <div style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          fontWeight: 700,
          color: 'white',
          boxShadow: '0 0 40px rgba(233,30,140,0.4)',
          animation: accepted ? 'none' : 'pulse 1s ease infinite',
        }}>
          {caller.initials}
        </div>

        {/* Caller name */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 4 }}>{caller.name}</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: 8 }}>
            {accepted ? `In call — ${formatDuration(callDuration)}` : 'Incoming Call...'}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{caller.number}</p>
        </div>

        {!accepted && (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: 8, animation: 'pulse 2s ease infinite' }}>
            📞 Slide to answer
          </p>
        )}

        {accepted && (
          <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { icon: '🔇', label: 'Mute' },
              { icon: '🔊', label: 'Speaker' },
              { icon: '⌨️', label: 'Keypad' },
              { icon: '⏸️', label: 'Hold' },
            ].map((btn) => (
              <div key={btn.label} style={{ textAlign: 'center' }}>
                <button style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {btn.icon}
                </button>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{btn.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call controls */}
      <div style={{ paddingBottom: 40, width: '100%' }}>
        {!accepted ? (
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 40 }}>
            {/* Decline */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleDecline}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: '#ef4444',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(239,68,68,0.5)',
                }}
                aria-label="Decline call"
              >
                📵
              </button>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>Decline</p>
            </div>

            {/* Message */}
            <button style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.4rem',
            }}>
              💬
            </button>

            {/* Accept */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setAccepted(true)}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: '#10b981',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(16,185,129,0.5)',
                  animation: 'animate-ring 1s ease infinite',
                }}
                aria-label="Accept call"
              >
                📞
              </button>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>Accept</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={onClose}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: '#ef4444',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(239,68,68,0.5)',
                }}
                aria-label="End call"
              >
                📵
              </button>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>End Call</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
