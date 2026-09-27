import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Search, Navigation, AlertTriangle, Crosshair, Layers, X } from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import { useSafety } from '../context/SafetyContext';

// Fix Leaflet default icon paths broken by bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom icons
const userIcon = L.divIcon({
  html: `<div style="width:20px;height:20px;background:#db2777;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(219,39,119,0.5);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  className: '',
});

const sosIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;background:#dc2626;border:3px solid white;border-radius:50%;box-shadow:0 2px 12px rgba(220,38,38,0.7);display:flex;align-items:center;justify-content:center;font-size:11px;color:white;font-weight:900;">!</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  className: '',
});

// Risk zones with real-world-ish relative offsets
interface RiskZone {
  id: number;
  name: string;
  riskScore: number;
  category: 'Low Risk' | 'Caution' | 'High Risk';
  latOffset: number;
  lngOffset: number;
  radius: number;
}

const RISK_ZONES: RiskZone[] = [
  { id: 1, name: 'City Center', riskScore: 35, category: 'Low Risk',  latOffset:  0.008, lngOffset:  0.005, radius: 400 },
  { id: 2, name: 'Market Street', riskScore: 62, category: 'Caution',  latOffset: -0.005, lngOffset:  0.010, radius: 300 },
  { id: 3, name: 'Industrial Area', riskScore: 85, category: 'High Risk', latOffset:  0.014, lngOffset: -0.008, radius: 500 },
  { id: 4, name: 'Residential Park', riskScore: 18, category: 'Low Risk',  latOffset: -0.010, lngOffset: -0.006, radius: 350 },
  { id: 5, name: 'Railway Station', riskScore: 55, category: 'Caution',  latOffset:  0.002, lngOffset: -0.014, radius: 250 },
];

const ZONE_COLORS: Record<string, string> = {
  'Low Risk': '#16a34a',
  'Caution': '#d97706',
  'High Risk': '#dc2626',
};

const TILE_LAYERS = {
  streets: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '© OpenStreetMap contributors', label: 'Streets' },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: '© Esri', label: 'Satellite' },
};

// Component to re-center map when position changes
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

// Component that captures map click for destination pin
function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onPick(e.latlng.lat, e.latlng.lng); }
  });
  return null;
}

export function MapPage() {
  const { location, locationError, requestLocation } = useSafety();

  const [gpsTrail, setGpsTrail] = useState<[number, number][]>([]);
  const [tracking, setTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [destination, setDestination] = useState('');
  const [destinationPin, setDestinationPin] = useState<[number, number] | null>(null);
  const [navigating, setNavigating] = useState(false);
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [tileLayer, setTileLayer] = useState<'streets' | 'satellite'>('streets');
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [searchResults, setSearchResults] = useState<{display_name: string; lat: string; lon: string}[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    requestLocation();
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Start live GPS tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      pos => {
        const pt: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setGpsTrail(prev => [...prev.slice(-200), pt]); // keep last 200 pts
      },
      err => console.warn('GPS watch error:', err.message),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
    setWatchId(id);
    setTracking(true);
  }, []);

  const stopTracking = useCallback(() => {
    if (watchId !== null) { navigator.geolocation.clearWatch(watchId); setWatchId(null); }
    setTracking(false);
  }, [watchId]);

  // Nominatim geocoding search (free, no API key)
  const searchDestination = useCallback((query: string) => {
    setDestination(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.length < 3) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await resp.json();
        setSearchResults(data);
      } catch { setSearchResults([]); }
      setSearching(false);
    }, 500);
  }, []);

  const pickSearchResult = (r: {display_name: string; lat: string; lon: string}) => {
    const pin: [number, number] = [parseFloat(r.lat), parseFloat(r.lon)];
    setDestinationPin(pin);
    setDestination(r.display_name.split(',').slice(0, 2).join(', '));
    setSearchResults([]);
    setNavigating(true);
  };

  const riskColor = (score: number) => score < 40 ? '#16a34a' : score < 65 ? '#d97706' : '#dc2626';

  const center: [number, number] = location
    ? [location.lat, location.lng]
    : [20.5937, 78.9629]; // India center fallback

  const tile = TILE_LAYERS[tileLayer];

  return (
    <PageLayout title="Safety Map" showNav>
      <div className="flex flex-col" style={{ height: 'calc(100vh - 112px)' }}>

        {/* Top toolbar */}
        <div className="bg-white border-b border-gray-100 px-3 py-2 space-y-2 z-10 flex-shrink-0">
          {/* Search bar */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input-field pl-8 text-sm py-2 pr-8"
                  placeholder="Search destination (tap map to pin)…"
                  value={destination}
                  onChange={e => searchDestination(e.target.value)}
                />
                {destination && (
                  <button onClick={() => { setDestination(''); setSearchResults([]); setDestinationPin(null); setNavigating(false); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Autocomplete dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-52 overflow-y-auto">
                {searching && <div className="px-3 py-2 text-xs text-gray-400">Searching…</div>}
                {searchResults.map((r, i) => (
                  <button key={i} onClick={() => pickSearchResult(r)}
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-pink-50 border-b border-gray-100 last:border-0 flex items-center gap-2">
                    <MapPin size={13} className="text-pink-400 flex-shrink-0" />
                    <span className="truncate text-gray-800">{r.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {/* GPS Track button */}
            <button
              onClick={tracking ? stopTracking : startTracking}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 border transition-colors ${
                tracking
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-pink-400'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${tracking ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
              {tracking ? 'GPS Live' : 'Track GPS'}
            </button>

            {/* Re-center */}
            <button
              onClick={requestLocation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 bg-white text-gray-700 border border-gray-300 hover:border-pink-400"
            >
              <Crosshair size={13} />
              Re-center
            </button>

            {/* Layer toggle */}
            <button
              onClick={() => setTileLayer(t => t === 'streets' ? 'satellite' : 'streets')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 bg-white text-gray-700 border border-gray-300 hover:border-pink-400"
            >
              <Layers size={13} />
              {tileLayer === 'streets' ? 'Satellite' : 'Streets'}
            </button>

            {/* Risk zones toggle */}
            <button
              onClick={() => setShowRiskZones(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 border transition-colors ${
                showRiskZones
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-white text-gray-500 border-gray-300'
              }`}
            >
              <AlertTriangle size={13} />
              Risk Zones
            </button>
          </div>

          {/* Navigation banner */}
          {navigating && destinationPin && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation size={14} className="text-blue-600" />
                <div>
                  <p className="text-blue-800 text-xs font-bold">Navigating to</p>
                  <p className="text-blue-600 text-xs truncate max-w-[200px]">{destination}</p>
                </div>
              </div>
              <button onClick={() => { setNavigating(false); setDestinationPin(null); }}
                className="text-blue-400 hover:text-blue-600">
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Location error banner */}
        {locationError && (
          <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 flex gap-2 flex-shrink-0">
            <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-700 text-xs">{locationError}</p>
          </div>
        )}

        {/* MAP — fills remaining space */}
        <div className="flex-1 relative">
          <MapContainer
            center={center}
            zoom={14}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
          >
            <TileLayer url={tile.url} attribution={tile.attr} />

            {/* Re-center on location update */}
            {location && <RecenterMap lat={location.lat} lng={location.lng} />}

            {/* Map click to drop destination pin */}
            <MapClickHandler onPick={(lat, lng) => {
              setDestinationPin([lat, lng]);
              setDestination(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
              setNavigating(true);
            }} />

            {/* User position */}
            {location && (
              <Marker position={[location.lat, location.lng]} icon={userIcon}>
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold text-pink-600">📍 You are here</p>
                    <p className="text-gray-600 mt-0.5">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</p>
                    {location.accuracy && <p className="text-gray-400">Accuracy: ±{Math.round(location.accuracy)}m</p>}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* GPS trail */}
            {gpsTrail.length > 1 && (
              <Polyline positions={gpsTrail} color="#db2777" weight={3} opacity={0.7} dashArray="8,4" />
            )}

            {/* Destination pin */}
            {destinationPin && (
              <Marker position={destinationPin} icon={sosIcon}>
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold text-blue-600">🏁 Destination</p>
                    <p className="text-gray-600 mt-0.5">{destination}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Route line */}
            {navigating && destinationPin && location && (
              <Polyline
                positions={[[location.lat, location.lng], destinationPin]}
                color="#3b82f6"
                weight={4}
                opacity={0.8}
                dashArray="12,6"
              />
            )}

            {/* Risk zone circles — relative to current location */}
            {showRiskZones && location && RISK_ZONES.map(zone => {
              const lat = location.lat + zone.latOffset;
              const lng = location.lng + zone.lngOffset;
              const color = ZONE_COLORS[zone.category];
              return (
                <Circle
                  key={zone.id}
                  center={[lat, lng]}
                  radius={zone.radius}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.18, weight: 2, opacity: 0.7 }}
                  eventHandlers={{ click: () => setSelectedZone(zone) }}
                >
                  <Popup>
                    <div className="text-xs min-w-[140px]">
                      <p className="font-bold text-gray-800">{zone.name}</p>
                      <p style={{ color }}>⚠️ {zone.category}</p>
                      <p className="text-gray-500 mt-1">Risk Score: <strong style={{ color }}>{zone.riskScore}/100</strong></p>
                      <p className="text-gray-400 text-xs mt-1 italic">Simulated data for demo</p>
                    </div>
                  </Popup>
                </Circle>
              );
            })}
          </MapContainer>

          {/* Attribution */}
          <div className="absolute bottom-2 right-2 z-20 bg-white/80 text-xs text-gray-500 px-1.5 py-0.5 rounded">
            © OpenStreetMap
          </div>
        </div>

        {/* Bottom panel: Risk zones + GPS info */}
        <div className="bg-white border-t border-gray-100 flex-shrink-0" style={{ maxHeight: '42vh', overflowY: 'auto' }}>
          {/* GPS trail info */}
          {tracking && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border-b border-green-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-green-700 text-xs font-semibold">Live GPS tracking active</p>
              <span className="text-green-500 text-xs ml-auto">{gpsTrail.length} pts recorded</span>
            </div>
          )}

          {/* Selected zone detail */}
          {selectedZone && (
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-gray-900">{selectedZone.name}</p>
                <button onClick={() => setSelectedZone(null)}><X size={14} className="text-gray-400" /></button>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                <div className="h-2 rounded-full" style={{ width: `${selectedZone.riskScore}%`, backgroundColor: riskColor(selectedZone.riskScore) }} />
              </div>
              <p className="text-xs text-gray-500">Risk score: <strong>{selectedZone.riskScore}/100</strong> · {selectedZone.category}</p>
              <p className="text-xs text-amber-600 mt-0.5">⚠️ Simulated risk data for demonstration purposes.</p>
            </div>
          )}

          {/* Simulated badge */}
          <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Risk Zones Near You</p>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">SIMULATED</span>
          </div>

          <div className="px-4 py-2 space-y-2 pb-4">
            {/* Legend */}
            <div className="flex gap-4 text-xs text-gray-500 mb-2">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Low Risk</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Caution</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Danger</span>
            </div>
            {RISK_ZONES.map(zone => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(selectedZone?.id === zone.id ? null : zone)}
                className={`w-full flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 border transition-all ${
                  selectedZone?.id === zone.id ? 'border-pink-400 ring-1 ring-pink-200' : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ZONE_COLORS[zone.category] }} />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800 leading-none">{zone.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{zone.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-base" style={{ color: riskColor(zone.riskScore) }}>{zone.riskScore}</p>
                  <p className="text-gray-400 text-xs">/ 100</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
