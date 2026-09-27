import { useState } from 'react';
import { Clock, MapPin, AlertOctagon, CheckCircle, Filter } from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import { useSafety } from '../context/SafetyContext';
import type { AlertEvent } from '../types';

const TYPE_CONFIG: Record<AlertEvent['type'], { label: string; icon: React.ComponentType<{size?:number;className?:string}>; color: string }> = {
  SOS_ACTIVATED: { label: 'SOS Activated', icon: AlertOctagon, color: 'bg-red-100 text-red-600' },
  SAFETY_CHECK_MISSED: { label: 'Safety Check Missed', icon: Clock, color: 'bg-amber-100 text-amber-600' },
  MANUAL_SOS: { label: 'Manual SOS', icon: AlertOctagon, color: 'bg-red-100 text-red-600' },
  DANGER_ZONE: { label: 'Entered Danger Zone', icon: MapPin, color: 'bg-orange-100 text-orange-600' },
};

const STATUS_BADGE: Record<AlertEvent['status'], string> = {
  ACTIVE: 'bg-red-100 text-red-700 border-red-200',
  RESOLVED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
};

type FilterType = 'ALL' | AlertEvent['type'];

export function HistoryPage() {
  const { alerts, resolveAlert } = useSafety();
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filtered = filter === 'ALL' ? alerts : alerts.filter(a => a.type === filter);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <PageLayout
      title="Alert History"
      showNav
      headerRight={
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(p => !p)}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100"
          >
            <Filter size={16} />
            {filter === 'ALL' ? 'All' : TYPE_CONFIG[filter as AlertEvent['type']].label}
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[180px] overflow-hidden">
              {(['ALL', 'SOS_ACTIVATED', 'SAFETY_CHECK_MISSED', 'MANUAL_SOS', 'DANGER_ZONE'] as FilterType[]).map(f => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setShowFilterMenu(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${filter === f ? 'bg-pink-50 text-pink-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {f === 'ALL' ? 'All Events' : TYPE_CONFIG[f].label}
                </button>
              ))}
            </div>
          )}
        </div>
      }
    >
      <div className="p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={36} className="text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-700">
              {filter === 'ALL' ? 'No Alerts Yet' : 'No Events Found'}
            </h3>
            <p className="text-gray-500 text-sm mt-2 max-w-xs">
              {filter === 'ALL'
                ? "You're all clear. Your safety history will appear here."
                : 'No events match the current filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 font-medium">{filtered.length} event{filtered.length !== 1 ? 's' : ''}</p>
            {filtered.map(alert => {
              const cfg = TYPE_CONFIG[alert.type];
              const Icon = cfg.icon;
              return (
                <div key={alert.id} className="card">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{cfg.label}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_BADGE[alert.status]}`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDate(alert.timestamp)}</p>
                      {alert.location && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {alert.location}
                        </p>
                      )}
                      {alert.notes && (
                        <p className="text-xs text-gray-400 mt-0.5 italic">{alert.notes}</p>
                      )}
                    </div>
                  </div>
                  {alert.status === 'ACTIVE' && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="mt-3 w-full py-2 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-semibold rounded-xl border border-green-200 transition-colors"
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
