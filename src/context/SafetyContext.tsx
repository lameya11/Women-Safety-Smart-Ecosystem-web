import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { SafetyStatus, LocationData, AlertEvent, TrustedContact, TravelSession, DemoState } from '../types';
import { storage } from '../utils/storage';
import { useAuth } from './AuthContext';

interface SafetyContextType {
  safetyStatus: SafetyStatus;
  setSafetyStatus: (s: SafetyStatus) => void;
  safetyModeActive: boolean;
  toggleSafetyMode: () => void;
  location: LocationData | null;
  locationError: string | null;
  requestLocation: () => void;
  sosActive: boolean;
  activateSOS: () => void;
  deactivateSOS: () => void;
  contacts: TrustedContact[];
  addContact: (c: Omit<TrustedContact, 'id' | 'userId'>) => void;
  updateContact: (id: string, c: Partial<TrustedContact>) => void;
  deleteContact: (id: string) => void;
  alerts: AlertEvent[];
  addAlert: (a: Omit<AlertEvent, 'id' | 'userId' | 'timestamp'>) => void;
  resolveAlert: (id: string) => void;
  travelSession: TravelSession | null;
  startTravel: (destination: string, intervalMinutes: number) => void;
  stopTravel: () => void;
  checkIn: () => void;
  demo: DemoState;
  setDemo: (d: Partial<DemoState>) => void;
}

const SafetyContext = createContext<SafetyContextType | null>(null);

export function SafetyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [safetyStatus, setSafetyStatus] = useState<SafetyStatus>('SAFE');
  const [safetyModeActive, setSafetyModeActive] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [sosActive, setSosActive] = useState(false);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [travelSession, setTravelSession] = useState<TravelSession | null>(null);
  const [demo, setDemoState] = useState<DemoState>({
    isDemoMode: false,
    simulatedStatus: 'SAFE',
    simulatedLocation: null,
  });

  // Load user-specific data on user change
  useEffect(() => {
    if (user) {
      const userContacts = storage.get<TrustedContact[]>(`contacts_${user.id}`, []);
      const userAlerts = storage.get<AlertEvent[]>(`alerts_${user.id}`, []);
      const userTravel = storage.get<TravelSession | null>(`travel_${user.id}`, null);
      setContacts(userContacts);
      setAlerts(userAlerts);
      setTravelSession(userTravel);
    } else {
      setContacts([]);
      setAlerts([]);
      setTravelSession(null);
    }
  }, [user]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: LocationData = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: new Date().toISOString(),
        };
        setLocation(loc);
        setLocationError(null);
      },
      (err) => {
        setLocationError(`Location unavailable: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const toggleSafetyMode = () => {
    setSafetyModeActive(prev => {
      if (!prev) requestLocation();
      return !prev;
    });
  };

  const activateSOS = () => {
    setSosActive(true);
    if (user) {
      addAlert({ type: 'SOS_ACTIVATED', status: 'ACTIVE', location: location?.address ?? 'Location unavailable', lat: location?.lat, lng: location?.lng });
    }
  };

  const deactivateSOS = () => {
    setSosActive(false);
    if (user) {
      const userAlerts = storage.get<AlertEvent[]>(`alerts_${user.id}`, []);
      const updated = userAlerts.map(a =>
        a.type === 'SOS_ACTIVATED' && a.status === 'ACTIVE'
          ? { ...a, status: 'RESOLVED' as const }
          : a
      );
      storage.set(`alerts_${user.id}`, updated);
      setAlerts(updated);
    }
  };

  const addContact = (c: Omit<TrustedContact, 'id' | 'userId'>) => {
    if (!user) return;
    const newContact: TrustedContact = { ...c, id: crypto.randomUUID(), userId: user.id };
    const updated = [...contacts, newContact];
    setContacts(updated);
    storage.set(`contacts_${user.id}`, updated);
  };

  const updateContact = (id: string, updates: Partial<TrustedContact>) => {
    if (!user) return;
    const updated = contacts.map(c => c.id === id ? { ...c, ...updates } : c);
    setContacts(updated);
    storage.set(`contacts_${user.id}`, updated);
  };

  const deleteContact = (id: string) => {
    if (!user) return;
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    storage.set(`contacts_${user.id}`, updated);
  };

  const addAlert = (a: Omit<AlertEvent, 'id' | 'userId' | 'timestamp'>) => {
    if (!user) return;
    const newAlert: AlertEvent = {
      ...a,
      id: crypto.randomUUID(),
      userId: user.id,
      timestamp: new Date().toISOString(),
    };
    const updated = [newAlert, ...alerts];
    setAlerts(updated);
    storage.set(`alerts_${user.id}`, updated);
  };

  const resolveAlert = (id: string) => {
    if (!user) return;
    const updated = alerts.map(a => a.id === id ? { ...a, status: 'RESOLVED' as const } : a);
    setAlerts(updated);
    storage.set(`alerts_${user.id}`, updated);
  };

  const startTravel = (destination: string, intervalMinutes: number) => {
    if (!user) return;
    const now = new Date();
    const nextCheckIn = new Date(now.getTime() + intervalMinutes * 60 * 1000);
    const session: TravelSession = {
      id: crypto.randomUUID(),
      destination,
      startTime: now.toISOString(),
      nextCheckIn: nextCheckIn.toISOString(),
      intervalMinutes,
      active: true,
      missedCheckIns: 0,
    };
    setTravelSession(session);
    storage.set(`travel_${user.id}`, session);
  };

  const stopTravel = () => {
    if (!user) return;
    setTravelSession(null);
    storage.remove(`travel_${user.id}`);
  };

  const checkIn = () => {
    if (!user || !travelSession) return;
    const nextCheckIn = new Date(Date.now() + travelSession.intervalMinutes * 60 * 1000);
    const updated = { ...travelSession, nextCheckIn: nextCheckIn.toISOString() };
    setTravelSession(updated);
    storage.set(`travel_${user.id}`, updated);
  };

  const setDemo = (d: Partial<DemoState>) => {
    setDemoState(prev => {
      const next = { ...prev, ...d };
      if (d.simulatedStatus) setSafetyStatus(d.simulatedStatus);
      if (d.simulatedLocation) setLocation(d.simulatedLocation);
      return next;
    });
  };

  return (
    <SafetyContext.Provider value={{
      safetyStatus, setSafetyStatus,
      safetyModeActive, toggleSafetyMode,
      location, locationError, requestLocation,
      sosActive, activateSOS, deactivateSOS,
      contacts, addContact, updateContact, deleteContact,
      alerts, addAlert, resolveAlert,
      travelSession, startTravel, stopTravel, checkIn,
      demo, setDemo,
    }}>
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  const ctx = useContext(SafetyContext);
  if (!ctx) throw new Error('useSafety must be used within SafetyProvider');
  return ctx;
}
