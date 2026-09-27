import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, Smartphone, AlertOctagon, Phone, Shield, Play, RotateCcw, Info } from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import { useSafety } from '../context/SafetyContext';
import type { LocationData } from '../types';

interface DemoAction {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
}

const DEMO_ACTIONS: DemoAction[] = [
  {
    id: 'unsafe_location',
    label: 'Simulate Unsafe Location',
    desc: 'Sets status to DANGER and simulates entering a high-risk zone',
    icon: MapPin,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
  },
  {
    id: 'shake_detection',
    label: 'Simulate Shake Detection',
    desc: 'Triggers safety check as if device was shaken (shake-to-SOS)',
    icon: Smartphone,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
  },
  {
    id: 'sos',
    label: 'Simulate SOS',
    desc: 'Activates full SOS workflow without contacting emergency services',
    icon: AlertOctagon,
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
  },
  {
    id: 'travel_risk',
    label: 'Simulate Travel Risk',
    desc: 'Sets status to CAUTION and starts a travel session with 1-min intervals',
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
  },
  {
    id: 'police_notification',
    label: 'Simulate Police Notification',
    desc: 'Shows the notification flow — does NOT contact real emergency services',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  {
    id: 'fake_call',
    label: 'Trigger Fake Call',
    desc: 'Opens the simulated incoming call screen immediately',
    icon: Phone,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
  },
];

export function DemoPage() {
  const navigate = useNavigate();
  const { setDemo, setSafetyStatus, activateSOS, addAlert, startTravel } = useSafety();
  const [executed, setExecuted] = useState<string[]>([]);
  const [lastOutput, setLastOutput] = useState<string | null>(null);

  const markExecuted = (id: string, msg: string) => {
    setExecuted(prev => [...new Set([...prev, id])]);
    setLastOutput(msg);
  };

  const handleAction = (id: string) => {
    switch (id) {
      case 'unsafe_location': {
        const dangerLoc: LocationData = { lat: 28.6139, lng: 77.2090, address: '⚠️ [SIMULATED] High-risk zone detected', timestamp: new Date().toISOString() };
        setDemo({ isDemoMode: true, simulatedStatus: 'DANGER', simulatedLocation: dangerLoc });
        setSafetyStatus('DANGER');
        addAlert({ type: 'DANGER_ZONE', status: 'ACTIVE', location: '[SIMULATED] High-risk area', notes: 'Demo simulation' });
        markExecuted(id, '✓ Status set to DANGER. Alert logged. All data is simulated.');
        break;
      }
      case 'shake_detection': {
        setDemo({ isDemoMode: true });
        markExecuted(id, '✓ Shake detected! Navigating to Safety Check screen.');
        setTimeout(() => navigate('/safety-check'), 800);
        break;
      }
      case 'sos': {
        setDemo({ isDemoMode: true });
        activateSOS();
        addAlert({ type: 'MANUAL_SOS', status: 'ACTIVE', notes: '[DEMO] Simulated SOS activation' });
        markExecuted(id, '✓ SOS activated in demo mode. No real emergency services contacted.');
        setTimeout(() => navigate('/sos'), 800);
        break;
      }
      case 'travel_risk': {
        setDemo({ isDemoMode: true, simulatedStatus: 'CAUTION' });
        setSafetyStatus('CAUTION');
        startTravel('[DEMO] Market Street → Railway Station', 1);
        markExecuted(id, '✓ Travel risk simulated. Check-in set for 1 minute. All data is simulated.');
        break;
      }
      case 'police_notification': {
        setDemo({ isDemoMode: true });
        markExecuted(id, '✓ DEMO: Police notification flow shown. Actual emergency services NOT contacted. Always call 112 directly.');
        break;
      }
      case 'fake_call': {
        markExecuted(id, '✓ Launching simulated incoming call…');
        setTimeout(() => navigate('/fake-call'), 500);
        break;
      }
    }
  };

  const resetDemo = () => {
    setDemo({ isDemoMode: false, simulatedStatus: 'SAFE', simulatedLocation: null });
    setSafetyStatus('SAFE');
    setExecuted([]);
    setLastOutput(null);
  };

  return (
    <PageLayout
      title="Demo Mode"
      showBack
      showNav={false}
      headerBg="bg-purple-700"
    >
      <div className="p-4 space-y-4">
        {/* Warning banner */}
        <div className="bg-purple-700 -mx-4 -mt-4 px-4 pt-3 pb-4 mb-0">
          <div className="bg-purple-600 rounded-xl p-3 flex gap-2">
            <Info size={15} className="text-purple-200 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-xs font-bold">HACKATHON DEMO MODE</p>
              <p className="text-purple-200 text-xs mt-0.5 leading-relaxed">
                All simulations are isolated. <strong>No real emergency services are contacted.</strong>
                Demo data is clearly labeled and does not affect real alert history.
              </p>
            </div>
          </div>
        </div>

        {/* Last output */}
        {lastOutput && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 fade-in">
            <p className="text-green-700 text-sm font-medium">{lastOutput}</p>
          </div>
        )}

        {/* Reset */}
        {executed.length > 0 && (
          <button
            onClick={resetDemo}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw size={15} />
            Reset Demo State
          </button>
        )}

        {/* Demo actions */}
        <div className="space-y-3">
          {DEMO_ACTIONS.map(action => {
            const Icon = action.icon;
            const done = executed.includes(action.id);
            return (
              <div key={action.id} className={`card border-2 ${action.bgColor} transition-all`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white`}>
                    <Icon size={20} className={action.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-sm">{action.label}</p>
                      {done && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">Done</span>}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{action.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAction(action.id)}
                  className={`mt-3 w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    done
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-white border-2 border-gray-300 text-gray-800 hover:border-pink-400 hover:text-pink-600'
                  }`}
                >
                  <Play size={14} />
                  {done ? 'Run Again' : 'Run Simulation'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4">
          <p className="text-amber-700 text-xs leading-relaxed">
            <strong>⚠️ Important:</strong> This demo mode is for demonstration purposes only.
            In a real emergency, always call <strong>112</strong> (Police) or <strong>100</strong> (Emergency) directly.
            Never rely solely on an app in a genuine emergency situation.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
