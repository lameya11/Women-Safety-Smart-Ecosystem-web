// src/components/LocationCard.js
// Shows current GPS location and tracking status

import React from 'react';
import { useApp } from '../context/AppContext';
import locationService from '../services/locationService';

export default function LocationCard() {
  const { location, locationError } = useApp();

  const handleRefresh = () => {
    locationService.getCurrentPosition().catch(() => {});
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-header">
        <span className="card-title">📍 Location</span>
        <button className="btn-icon" onClick={handleRefresh} aria-label="Refresh location"
          style={{ fontSize: '0.9rem', minWidth: 36, minHeight: 36 }}>
          🔄
        </button>
      </div>

      {locationError ? (
        <div>
          <p style={{ color: 'var(--color-warning)', fontSize: '0.85rem', marginBottom: 6 }}>
            ⚠️ Location unavailable
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-faint)' }}>
            {locationError}. Enable GPS in browser settings.
          </p>
        </div>
      ) : location ? (
        <div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latitude</p>
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{location.latitude.toFixed(6)}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Longitude</p>
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{location.longitude.toFixed(6)}</p>
            </div>
            {location.accuracy && (
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accuracy</p>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>±{Math.round(location.accuracy)}m</p>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="pulse-dot pulse-dot-safe" />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-safe)' }}>
              Live GPS tracking active
            </span>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="spinner" style={{ width: 20, height: 20 }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Getting your location...
          </p>
        </div>
      )}
    </div>
  );
}
