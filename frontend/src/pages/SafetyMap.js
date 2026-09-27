// src/pages/SafetyMap.js
// Interactive safety map with danger zones and community reports
// Uses Leaflet (OpenStreetMap) - no API key required

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { reportsAPI, riskAPI } from '../services/api';

// Fix Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icons
const createIcon = (color, emoji) => L.divIcon({
  html: `<div style="
    width:40px;height:40px;border-radius:50%;
    background:${color};
    display:flex;align-items:center;justify-content:center;
    font-size:1.2rem;
    box-shadow:0 2px 8px rgba(0,0,0,0.4);
    border:2px solid white;
  ">${emoji}</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -44],
  className: '',
});

const userIcon = createIcon('var(--color-primary)', '📍');
const dangerIcon = createIcon('#ef4444', '⚠️');
const reportIcon = createIcon('#f59e0b', '📝');

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom(), { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function SafetyMap() {
  const { location, riskScore, riskLevel, riskFactors } = useApp();
  const [dangerZones, setDangerZones] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [routeRisk, setRouteRisk] = useState(null);
  const mapRef = useRef(null);

  // Default center: New Delhi (demo default)
  const DEFAULT_CENTER = [28.6139, 77.2090];
  const center = location
    ? [location.latitude, location.longitude]
    : DEFAULT_CENTER;

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    setLoading(true);
    try {
      const [zonesRes, reportsRes] = await Promise.all([
        reportsAPI.getDangerZones(),
        reportsAPI.getAll(),
      ]);
      setDangerZones(zonesRes.data || []);
      setReports(reportsRes.data || []);
    } catch (err) {
      console.warn('Map data load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    const colors = { HIGH: '#ef444488', MEDIUM: '#f59e0b88', LOW: '#10b98188' };
    return colors[level] || '#6b728088';
  };

  const getRiskBorderColor = (level) => {
    const colors = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#10b981' };
    return colors[level] || '#6b7280';
  };

  const handleCheckRouteRisk = async (destLat, destLng) => {
    if (!location) return;
    try {
      const res = await riskAPI.calculate({
        latitude: destLat,
        longitude: destLng,
      });
      setRouteRisk(res.data);
    } catch {}
  };

  return (
    <div className="page animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Safety Map</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          Danger zones, community reports, and your real-time location
        </p>
      </div>

      {/* Current Risk Banner */}
      {riskScore > 0 && (
        <div className="card" style={{
          marginBottom: 16,
          background: riskLevel === 'HIGH' ? 'rgba(239,68,68,0.1)' :
                      riskLevel === 'MEDIUM' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
          border: `1px solid ${getRiskBorderColor(riskLevel)}44`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: getRiskBorderColor(riskLevel) + '22',
            border: `2px solid ${getRiskBorderColor(riskLevel)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            color: getRiskBorderColor(riskLevel),
            fontSize: '0.9rem',
            flexShrink: 0,
          }}>
            {riskScore}
          </div>
          <div>
            <p style={{
              fontWeight: 700,
              color: getRiskBorderColor(riskLevel),
              fontSize: '0.9rem',
            }}>
              {riskLevel} RISK ZONE
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {riskFactors[0] || 'Area analysis based on reports and time'}
            </p>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="map-container" style={{ marginBottom: 16 }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-2)' }}>
            <div className="spinner" />
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {mapCenter && <MapUpdater center={mapCenter} />}

            {/* User location marker */}
            {location && (
              <Marker position={[location.latitude, location.longitude]} icon={userIcon}>
                <Popup>
                  <div style={{ minWidth: 160 }}>
                    <strong>📍 Your Location</strong>
                    <br />
                    <small>{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</small>
                    <br />
                    <small style={{ color: riskLevel === 'HIGH' ? '#ef4444' : '#10b981' }}>
                      Risk: {riskLevel} ({riskScore}/100)
                    </small>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Danger zones */}
            {dangerZones.map((zone) => (
              <React.Fragment key={zone.id}>
                <Circle
                  center={[zone.latitude, zone.longitude]}
                  radius={zone.radius}
                  pathOptions={{
                    color: getRiskBorderColor(zone.riskLevel),
                    fillColor: getRiskColor(zone.riskLevel),
                    fillOpacity: 0.25,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => setSelectedZone(zone),
                  }}
                />
                <Marker
                  position={[zone.latitude, zone.longitude]}
                  icon={dangerIcon}
                >
                  <Popup>
                    <div style={{ minWidth: 180 }}>
                      <strong>{zone.name}</strong>
                      <br />
                      <span style={{ color: getRiskBorderColor(zone.riskLevel), fontWeight: 600 }}>
                        {zone.riskLevel} RISK
                      </span>
                      <br />
                      <small>Risk Score: {zone.riskScore}/100</small>
                      <br />
                      <small>{zone.reports} community reports</small>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}

            {/* Community reports */}
            {reports.slice(0, 30).map((report) => (
              <Marker
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={reportIcon}
              >
                <Popup>
                  <div style={{ minWidth: 160 }}>
                    <strong>⚠️ {report.incidentType}</strong>
                    <br />
                    <small>{report.description || 'Community safety report'}</small>
                    <br />
                    <small style={{ color: '#94a3b8' }}>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="card-title" style={{ marginBottom: 12 }}>🗺️ Map Legend</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { color: '#ef4444', label: 'High Risk / Danger Zone' },
            { color: '#f59e0b', label: 'Medium Risk / Caution Area' },
            { color: '#10b981', label: 'Low Risk / Safe Area' },
            { color: '#e91e8c', label: 'Your Current Location' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zones List */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">⚠️ Danger Zones ({dangerZones.length})</span>
          <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 10px', minHeight: 'auto' }}
            onClick={loadMapData}>
            🔄 Refresh
          </button>
        </div>
        {dangerZones.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No danger zones loaded</p>
        ) : (
          dangerZones.map((zone) => (
            <div key={zone.id}
              className="alert-item"
              style={{ cursor: 'pointer', marginBottom: 8 }}
              onClick={() => setMapCenter([zone.latitude, zone.longitude])}
            >
              <div className="alert-icon" style={{
                background: getRiskBorderColor(zone.riskLevel) + '22',
                color: getRiskBorderColor(zone.riskLevel),
              }}>
                ⚠️
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{zone.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {zone.riskLevel} RISK • Score {zone.riskScore} • {zone.reports} reports
                </p>
              </div>
              <span className={`badge ${
                zone.riskLevel === 'HIGH' ? 'badge-danger' :
                zone.riskLevel === 'MEDIUM' ? 'badge-warning' : 'badge-safe'
              }`} style={{ fontSize: '0.65rem' }}>
                {zone.riskLevel}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Note */}
      <div className="demo-banner">
        <span>ℹ️</span>
        <span>Map uses OpenStreetMap (no API key needed). Danger zones are demo data for New Delhi area.</span>
      </div>
    </div>
  );
}
