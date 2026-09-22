// src/components/BottomNav.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/map', icon: '🗺️', label: 'Map' },
  { path: '/travel', icon: '🚌', label: 'Travel' },
  { path: '/contacts', icon: '👥', label: 'Contacts' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { currentStatus, activeSos } = useApp();

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.path;
        return (
          <button
            key={item.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span style={{ fontSize: '1.3rem', position: 'relative' }}>
              {item.icon}
              {item.path === '/' && activeSos && (
                <span style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--color-danger)',
                  animation: 'pulse 1s ease infinite',
                }} />
              )}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
