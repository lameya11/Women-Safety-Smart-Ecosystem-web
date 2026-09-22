// src/components/QuickActions.js
// Dashboard quick action buttons

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ACTIONS = [
  { icon: '🗺️', label: 'Safety Map', path: '/map', color: '#3b82f6' },
  { icon: '🚌', label: 'Travel Mode', path: '/travel', color: '#7c3aed' },
  { icon: '📝', label: 'Reports', path: '/reports', color: '#f59e0b' },
  { icon: '📋', label: 'History', path: '/history', color: '#6b7280' },
  { icon: '📞', label: 'Fake Call', action: 'fakeCall', color: '#10b981' },
  { icon: '🎮', label: 'Demo', path: '/demo', color: '#e91e8c' },
];

export default function QuickActions() {
  const navigate = useNavigate();

  const handleAction = (item) => {
    if (item.action === 'fakeCall') {
      window._triggerFakeCall?.();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div className="section-header">
        <span className="section-title">⚡ Quick Actions</span>
      </div>
      <div className="grid-3" style={{ gap: 10 }}>
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => handleAction(action)}
            style={{
              background: 'var(--color-surface)',
              border: `1px solid ${action.color}33`,
              borderRadius: 'var(--radius-md)',
              padding: '14px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              minHeight: 70,
              touchAction: 'manipulation',
            }}
            aria-label={action.label}
          >
            <span style={{ fontSize: '1.4rem' }}>{action.icon}</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.2 }}>
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
