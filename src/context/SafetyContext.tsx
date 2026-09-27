import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { SafetyStatus, LocationData, AlertEvent, TrustedContact, TravelSession, DemoState } from '../types';
import { storage } from '../utils/storage';
import { useAuth } from './AuthContext';
import { contactsApi, sosApi, locationApi } from '../utils/api';

interface LocationShareState {
  active: boolean;
  shareId: string | null;   // userId used to build the tracking URL
  lastPushed: string | null; // ISO timestamp of last successful push
  error: string | null;
}

interface SafetyContextType {
  safetyStatus: SafetyStatus;
  setSafetyStatus: (s: SafetyStatus) => void;
  safetyModeActive: boolean;
  toggleSafetyMode: () => void;
  location: LocationData | null;
  locationError: string | null;
  requestLocation: () => void;
  sosActive: boolean;
  activeSosId: string | null;
  activateSOS: () => Promise<void>;
  deactivateSOS: () => Promise<void>;
  contacts: TrustedContact[];
  contactsLoading: boolean;
  addContact: (c: Omit<TrustedContact, 'id' | 'userId'>) => Promise<void>;
  updateContact: (id: string, c: Partial<TrustedContact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  alerts: AlertEvent[];
  addAlert: (a: Omit<AlertEvent, 'id' | 'userId' | 'timestamp'>) => void;
  resolveAlert: (id: string) => void;
  travelSession: TravelSession | null;
  startTravel: (destination: string, intervalMinutes: number) => void;
  stopTravel: () => void;
  checkIn: () => void;
  demo: DemoState;
  setDemo: (d: Partial<DemoState>) => void;
  // Live location sharing
  locationShare: LocationShareState;
  startLocationSharing: () => void;
  stopLocationSharing: () => void;
}

const SafetyContext = createContext<SafetyContextType | null>(null);

export function SafetyProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [safetyStatus, setSafetyStatus] = useState<SafetyStatus>('SAFE');
  const [safetyModeActive, setSafetyModeActive] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [sosActive, setSosActive] = useState(false);
  const [activeSosId, setActiveSosId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [travelSession, setTravelSession] = useState<TravelSession | null>(null);
  const [demo, setDemoState] = useState<DemoState>({
    isDemoMode: false,
    simulatedStatus: 'SAFE',
    simulatedLocation: null,
  });
  const [locationShare, setLocationShare] = useState<LocationShareState>({
    active: false,
    shareId: null,
    lastPushed: null,
    error: null,
  });

  const locationWatchRef = useRef<number | null>(null);
  const shareIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load user-specific data ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setContacts([]);
      setAlerts([]);
      setTravelSession(null);
      return;
    }

    // Load alerts from localStorage (always local)
    const userAlerts = storage.get<AlertEvent[]>(`alerts_${user.id}`, []);
    const userTravel = storage.get<TravelSession | null>(`travel_${user.id}`, null);
    setAlerts(userAlerts);
    setTravelSession(userTravel);

    // Load contacts — try backend first, fall back to localStorage
    setContactsLoading(true);
    if (token) {
      contactsApi.list()
        .then(apiContacts => {
          const mapped: TrustedContact[] = apiContacts.map(c => ({
            id: c.id,
            userId: c.userId,
            name: c.name,
            phone: c.phone,
            relationship: c.relationship,
            isEmergency: c.isEmergency ?? false,
          }));
          setContacts(mapped);
          storage.set(`contacts_${user.id}`, mapped);
        })
        .catch(() => {
          // Backend unreachable — use localStorage cache
          const cached = storage.get<TrustedContact[]>(`contacts_${user.id}`, []);
          setContacts(cached);
        })
        .finally(() => setContactsLoading(false));
    } else {
      const cached = storage.get<TrustedContact[]>(`contacts_${user.id}`, []);
      setContacts(cached);
      setContactsLoading(false);
    }
  }, [user, token]);

  // ── GPS ─────────────────────────────────────────────────────────────────────
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc: LocationData = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: new Date().toISOString(),
        };
        setLocation(loc);
        setLocationError(null);
      },
      err => setLocationError(`Location unavailable: ${err.message}`),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  const toggleSafetyMode = useCallback(() => {
    setSafetyModeActive(prev => { if (!prev) requestLocation(); return !prev; });
  }, [requestLocation]);

  // ── Live location sharing ───────────────────────────────────────────────────
  const pushLocationToBackend = useCallback((lat: number, lng: number, accuracy?: number) => {
    if (!token) return;
    locationApi.update(lat, lng, accuracy)
      .then(() => setLocationShare(s => ({ ...s, lastPushed: new Date().toISOString(), error: null })))
      .catch(() => setLocationShare(s => ({ ...s, error: 'Failed to push location to server' })));
  }, [token]);

  const startLocationSharing = useCallback(() => {
    if (!user) return;
    if (!navigator.geolocation) {
      setLocationShare(s => ({ ...s, error: 'Geolocation not supported on this device.' }));
      return;
    }

    // Start watching position
    const id = navigator.geolocation.watchPosition(
      pos => {
        const loc: LocationData = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: new Date().toISOString(),
        };
        setLocation(loc);
        setLocationError(null);
        pushLocationToBackend(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
      },
      err => setLocationShare(s => ({ ...s, error: `GPS: ${err.message}` })),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    locationWatchRef.current = id;

    setLocationShare({
      active: true,
      shareId: user.id,
      lastPushed: null,
      error: null,
    });
  }, [user, pushLocationToBackend]);

  const stopLocationSharing = useCallback(() => {
    if (locationWatchRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }
    if (shareIntervalRef.current) {
      clearInterval(shareIntervalRef.current);
      shareIntervalRef.current = null;
    }
    setLocationShare({ active: false, shareId: null, lastPushed: null, error: null });
  }, []);

  useEffect(() => () => {
    if (locationWatchRef.current !== null) navigator.geolocation.clearWatch(locationWatchRef.current);
    if (shareIntervalRef.current) clearInterval(shareIntervalRef.current);
  }, []);

  // ── SOS ─────────────────────────────────────────────────────────────────────
  const activateSOS = useCallback(async () => {
    setSosActive(true);
    // Log local alert immediately
    if (user) {
      addAlert({ type: 'SOS_ACTIVATED', status: 'ACTIVE', location: location?.address ?? 'Location unavailable', lat: location?.lat, lng: location?.lng });
    }
    // Push to backend
    if (token) {
      try {
        const alert = await sosApi.activate(location?.lat, location?.lng, 'SOS Alert');
        setActiveSosId(alert.id);
      } catch {
        // Backend push failed — SOS still active locally
      }
    }
  }, [user, token, location]);

  const deactivateSOS = useCallback(async () => {
    setSosActive(false);
    // Cancel on backend
    if (token && activeSosId) {
      try { await sosApi.cancel(activeSosId); } catch { /* best-effort */ }
    }
    setActiveSosId(null);
    // Resolve local alerts
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
  }, [user, token, activeSosId]);

  // ── Contacts ────────────────────────────────────────────────────────────────
  const addContact = useCallback(async (c: Omit<TrustedContact, 'id' | 'userId'>) => {
    if (!user) return;
    // Optimistic local
    const tempId = crypto.randomUUID();
    const tempContact: TrustedContact = { ...c, id: tempId, userId: user.id };
    const optimistic = [...contacts, tempContact];
    setContacts(optimistic);
    storage.set(`contacts_${user.id}`, optimistic);

    if (token) {
      try {
        const created = await contactsApi.create(c);
        const synced = optimistic.map(x => x.id === tempId
          ? { ...created, isEmergency: created.isEmergency ?? false } as TrustedContact
          : x
        );
        setContacts(synced);
        storage.set(`contacts_${user.id}`, synced);
      } catch {
        // Keep optimistic — will sync next time
      }
    }
  }, [user, token, contacts]);

  const updateContact = useCallback(async (id: string, updates: Partial<TrustedContact>) => {
    if (!user) return;
    const updated = contacts.map(c => c.id === id ? { ...c, ...updates } : c);
    setContacts(updated);
    storage.set(`contacts_${user.id}`, updated);
    if (token) {
      contactsApi.update(id, updates).catch(() => {});
    }
  }, [user, token, contacts]);

  const deleteContact = useCallback(async (id: string) => {
    if (!user) return;
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    storage.set(`contacts_${user.id}`, updated);
    if (token) {
      contactsApi.delete(id).catch(() => {});
    }
  }, [user, token, contacts]);

  // ── Alerts ──────────────────────────────────────────────────────────────────
  const addAlert = useCallback((a: Omit<AlertEvent, 'id' | 'userId' | 'timestamp'>) => {
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
  }, [user, alerts]);

  const resolveAlert = useCallback((id: string) => {
    if (!user) return;
    const updated = alerts.map(a => a.id === id ? { ...a, status: 'RESOLVED' as const } : a);
    setAlerts(updated);
    storage.set(`alerts_${user.id}`, updated);
  }, [user, alerts]);

  // ── Travel ──────────────────────────────────────────────────────────────────
  const startTravel = useCallback((destination: string, intervalMinutes: number) => {
    if (!user) return;
    const now = new Date();
    const session: TravelSession = {
      id: crypto.randomUUID(),
      destination,
      startTime: now.toISOString(),
      nextCheckIn: new Date(now.getTime() + intervalMinutes * 60 * 1000).toISOString(),
      intervalMinutes,
      active: true,
      missedCheckIns: 0,
    };
    setTravelSession(session);
    storage.set(`travel_${user.id}`, session);
  }, [user]);

  const stopTravel = useCallback(() => {
    if (!user) return;
    setTravelSession(null);
    storage.remove(`travel_${user.id}`);
  }, [user]);

  const checkIn = useCallback(() => {
    if (!user || !travelSession) return;
    const updated = { ...travelSession, nextCheckIn: new Date(Date.now() + travelSession.intervalMinutes * 60 * 1000).toISOString() };
    setTravelSession(updated);
    storage.set(`travel_${user.id}`, updated);
  }, [user, travelSession]);

  // ── Demo ────────────────────────────────────────────────────────────────────
  const setDemo = useCallback((d: Partial<DemoState>) => {
    setDemoState(prev => {
      const next = { ...prev, ...d };
      if (d.simulatedStatus) setSafetyStatus(d.simulatedStatus);
      if (d.simulatedLocation) setLocation(d.simulatedLocation);
      return next;
    });
  }, []);

  return (
    <SafetyContext.Provider value={{
      safetyStatus, setSafetyStatus,
      safetyModeActive, toggleSafetyMode,
      location, locationError, requestLocation,
      sosActive, activeSosId, activateSOS, deactivateSOS,
      contacts, contactsLoading, addContact, updateContact, deleteContact,
      alerts, addAlert, resolveAlert,
      travelSession, startTravel, stopTravel, checkIn,
      demo, setDemo,
      locationShare, startLocationSharing, stopLocationSharing,
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
