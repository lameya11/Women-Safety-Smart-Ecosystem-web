import { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, AlertTriangle, Info } from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import { useSafety } from '../context/SafetyContext';

// DEMO risk zones — clearly labeled as simulated
const DEMO_RISK_ZONES = [
  { id: 1, name: 'City Center', riskScore: 35, category: 'Low Risk', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 2, name: 'Market Street', riskScore: 62, category: 'Caution', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 3, name: 'Industrial Area', riskScore: 85, category: 'High Risk', color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 4, name: 'Residential Park', riskScore: 18, category: 'Low Risk', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 5, name: 'Railway Station', riskScore: 55, category: 'Caution', color: 'bg-amber-100 text-amber-700 border-amber-200' },
];

interface RiskZone {
  id: number;
  name: string;
  riskScore: number;
  category: string;
  color: string;
}

export function MapPage() {
  const { location, locationError, requestLocation } = useSafety();
  const [destination, setDestination] = useState('');
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [navigating, setNavigating] = useState(false);
  const [mapApiKey] = useState(import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '');

  useEffect(() => { requestLocation(); }, []);

  const startNavigation = () => {
    if (!destination.trim()) return;
    setNavigating(true);
  };

  const riskColor = (score: number) => {
    if (score < 40) return '#16a34a';
    if (score < 65) return '#d97706';
    return '#dc2626';
  };

  return (
    <PageLayout title="Safety Map" showNav>
      <div className="p-4 space-y-4">
        {/* API key notice */}
        {!mapApiKey && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2">
            <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-700 text-xs font-semibold">Map API Not Configured</p>
              <p className="text-blue-600 text-xs mt-0.5">
                Set <code className="bg-blue-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> to enable an interactive map. Risk data below is <strong>simulated</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Simulated map placeholder */}
        <div className="relative bg-gradient-to-br from-blue-100 via-green-50 to-blue-200 rounded-2xl overflow-hidden border border-gray-200" style={{ height: '220px' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                <MapPin size={30} className="text-pink-600" />
              </div>
              <p className="text-gray-600 font-semibold text-sm">
                {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Acquiring location…'}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {mapApiKey ? 'Loading map…' : '⚠️ Simulated Map View'}
              </p>
            </div>
          </div>

          {/* Fake road lines */}
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 220">
            <line x1="0" y1="110" x2="400" y2="110" stroke="#94a3b8" strokeWidth="3" />
            <line x1="200" y1="0" x2="200" y2="220" stroke="#94a3b8" strokeWidth="3" />
            <line x1="0" y1="55" x2="200" y2="110" stroke="#94a3b8" strokeWidth="2" />
            <line x1="200" y1="110" x2="400" y2="165" stroke="#94a3b8" strokeWidth="2" />
            {navigating && (
              <line x1="200" y1="110" x2="320" y2="60" stroke="#dc2626" strokeWidth="3" strokeDasharray="8,4" />
            )}
          </svg>

          {/* Risk zone markers */}
          {[
            { cx: 100, cy: 80, color: '#16a34a' },
            { cx: 280, cy: 140, color: '#d97706' },
            { cx: 340, cy: 60, color: '#dc2626' },
          ].map((m, i) => (
            <svg key={i} className="absolute inset-0 w-full h-full" viewBox="0 0 400 220">
              <circle cx={m.cx} cy={m.cy} r="12" fill={m.color} fillOpacity="0.3" stroke={m.color} strokeWidth="2" />
              <circle cx={m.cx} cy={m.cy} r="5" fill={m.color} />
            </svg>
          ))}
        </div>

        {/* Location */}
        {locationError && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
            <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-700 text-xs">{locationError}</p>
          </div>
        )}

        {/* Destination search */}
        <div className="card">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input-field pl-8 text-sm py-2.5"
                placeholder="Enter destination..."
                value={destination}
                onChange={e => setDestination(e.target.value)}
              />
            </div>
            <button
              onClick={startNavigation}
              disabled={!destination.trim()}
              className="btn-primary px-4 py-2.5 text-sm flex items-center gap-1.5"
            >
              <Navigation size={14} />
              Go
            </button>
          </div>

          {navigating && (
            <div className="mt-3 bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
              <p className="font-semibold flex items-center gap-1">
                <Navigation size={14} /> Navigating to: <span className="text-blue-900">{destination}</span>
              </p>
              <p className="text-xs text-blue-500 mt-0.5">⚠️ Route safety data is simulated. Always verify real conditions.</p>
              <button onClick={() => setNavigating(false)} className="text-xs text-blue-600 mt-1 underline">
                Stop Navigation
              </button>
            </div>
          )}
        </div>

        {/* Risk Legend */}
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Risk Level Legend</p>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" /><span>Low Risk</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-400" /><span>Caution</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /><span>Danger</span></div>
          </div>
        </div>

        {/* Simulated Risk Zones */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Area Risk Scores</p>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">SIMULATED DATA</span>
          </div>
          <div className="space-y-2">
            {DEMO_RISK_ZONES.map(zone => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(selectedZone?.id === zone.id ? null : zone)}
                className={`w-full card text-left transition-all ${selectedZone?.id === zone.id ? 'ring-2 ring-pink-400' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{zone.name}</p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border mt-1 ${zone.color}`}>
                      {zone.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold" style={{ color: riskColor(zone.riskScore) }}>
                      {zone.riskScore}
                    </p>
                    <p className="text-xs text-gray-400">/ 100</p>
                  </div>
                </div>
                {selectedZone?.id === zone.id && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${zone.riskScore}%`, backgroundColor: riskColor(zone.riskScore) }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Risk score based on simulated incident reports and environmental factors.
                    </p>
                    <button
                      onClick={e => { e.stopPropagation(); setDestination(zone.name); setNavigating(true); }}
                      className="mt-2 text-xs btn-primary py-1.5 px-3"
                    >
                      Navigate Here
                    </button>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
