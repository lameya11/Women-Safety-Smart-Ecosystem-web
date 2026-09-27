// src/components/NotificationToast.js
// Toast notifications for alerts, warnings, and status updates

import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';

const TYPE_STYLES = {
  safe: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', icon: '✅' },
  warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', icon: '⚠️' },
  danger: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.5)', icon: '🚨' },
  info: { bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.4)', icon: 'ℹ️' },
};

function Toast({ notification, onDismiss }) {
  const style = TYPE_STYLES[notification.type] || TYPE_STYLES.info;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(notification.id), 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        animation: 'fade-in 0.3s ease',
        boxShadow: 'var(--shadow-md)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{style.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 2 }}>{notification.title}</p>
        {notification.message && (
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{notification.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(notification.id)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text-faint)',
          cursor: 'pointer',
          padding: '2px 4px',
          fontSize: '0.9rem',
          flexShrink: 0,
        }}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

export default function NotificationToast() {
  const { notifications, clearNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 76,
        left: 16,
        right: 16,
        zIndex: 800,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 400,
        margin: '0 auto',
      }}
      aria-live="polite"
      aria-label="Notifications"
    >
      {notifications.slice(0, 3).map((n) => (
        <Toast key={n.id} notification={n} onDismiss={clearNotification} />
      ))}
    </div>
  );
}
