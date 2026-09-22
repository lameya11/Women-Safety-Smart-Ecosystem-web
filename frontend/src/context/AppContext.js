// src/context/AppContext.js
// Global application state management
// Manages: auth, safety mode, SOS, location, contacts, risk score

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authAPI, contactsAPI, sosAPI, locationAPI, riskAPI } from '../services/api';
import locationService from '../services/locationService';
import sensorService from '../services/sensorService';
import audioService from '../services/audioService';

const AppContext = createContext(null);

const INITIAL_STATE = {
  // Auth
  user: null,
  token: null,
  isAuthenticated: false,
  authLoading: true,

  // Location
  location: null,
  locationError: null,
  isLocationTracking: false,

  // Safety
  safetyMode: false,
  currentStatus: 'SAFE', // SAFE | WARNING | SOS

  // Risk
  riskScore: 0,
  riskLevel: 'LOW',
  riskFactors: [],
  riskRecommendations: [],
  lastRiskUpdate: null,

  // SOS
  activeSos: null,
  sosHistory: [],

  // Contacts
  contacts: [],
  contactsLoading: false,

  // Emergency Countdown
  countdownActive: false,
  countdownSeconds: 10,
  countdownReason: '',

  // Safety Check (Travel Mode)
  travelModeActive: false,
  travelDestination: '',
  nextCheckSeconds: 0,
  travelCheckInterval: null,

  // Alarms
  alarmActive: false,

  // Demo mode
  demoMode: false,

  // UI
  notifications: [],
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_AUTH':
      return { ...state, user: action.user, token: action.token, isAuthenticated: !!action.token, authLoading: false };
    case 'CLEAR_AUTH':
      return { ...state, user: null, token: null, isAuthenticated: false, authLoading: false };
    case 'SET_AUTH_LOADING':
      return { ...state, authLoading: action.value };
    case 'SET_LOCATION':
      return { ...state, location: action.location, locationError: null, isLocationTracking: true };
    case 'SET_LOCATION_ERROR':
      return { ...state, locationError: action.error, isLocationTracking: false };
    case 'SET_SAFETY_MODE':
      return { ...state, safetyMode: action.value };
    case 'SET_STATUS':
      return { ...state, currentStatus: action.status };
    case 'SET_RISK':
      return {
        ...state,
        riskScore: action.score,
        riskLevel: action.level,
        riskFactors: action.factors || [],
        riskRecommendations: action.recommendations || [],
        lastRiskUpdate: Date.now(),
      };
    case 'SET_ACTIVE_SOS':
      return { ...state, activeSos: action.sos, currentStatus: action.sos ? 'SOS' : state.currentStatus };
    case 'SET_SOS_HISTORY':
      return { ...state, sosHistory: action.history };
    case 'SET_CONTACTS':
      return { ...state, contacts: action.contacts, contactsLoading: false };
    case 'SET_CONTACTS_LOADING':
      return { ...state, contactsLoading: action.value };
    case 'START_COUNTDOWN':
      return { ...state, countdownActive: true, countdownSeconds: action.seconds || 10, countdownReason: action.reason || '', currentStatus: 'WARNING' };
    case 'TICK_COUNTDOWN':
      return { ...state, countdownSeconds: Math.max(0, state.countdownSeconds - 1) };
    case 'STOP_COUNTDOWN':
      return { ...state, countdownActive: false, countdownSeconds: 10, countdownReason: '' };
    case 'SET_TRAVEL_MODE':
      return { ...state, travelModeActive: action.value, travelDestination: action.destination || '' };
    case 'SET_NEXT_CHECK':
      return { ...state, nextCheckSeconds: action.seconds };
    case 'SET_ALARM':
      return { ...state, alarmActive: action.value };
    case 'SET_DEMO_MODE':
      return { ...state, demoMode: action.value };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [{ id: Date.now(), ...action.notification }, ...state.notifications].slice(0, 20),
      };
    case 'CLEAR_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter((n) => n.id !== action.id) };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);

  // ─── Countdown timer ref ──────────────────────────────────────────────────
  const countdownRef = React.useRef(null);
  const riskUpdateRef = React.useRef(null);
  const travelCheckRef = React.useRef(null);

  // ─── Auth initialization ──────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('safeguard_token');
    const userStr = localStorage.getItem('safeguard_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch({ type: 'SET_AUTH', user, token });
      } catch {
        localStorage.clear();
        dispatch({ type: 'CLEAR_AUTH' });
      }
    } else {
      dispatch({ type: 'SET_AUTH_LOADING', value: false });
    }
  }, []);

  // ─── Load contacts after auth ─────────────────────────────────────────────
  useEffect(() => {
    if (state.isAuthenticated) {
      loadContacts();
      loadActiveSos();
    }
  }, [state.isAuthenticated]); // eslint-disable-line

  // ─── Location tracking ────────────────────────────────────────────────────
  useEffect(() => {
    if (state.isAuthenticated) {
      startLocationTracking();
    }
    return () => locationService.stopWatching();
  }, [state.isAuthenticated]); // eslint-disable-line

  // ─── Risk score update when location changes ──────────────────────────────
  useEffect(() => {
    if (state.location && state.safetyMode) {
      // Debounce risk updates
      if (riskUpdateRef.current) clearTimeout(riskUpdateRef.current);
      riskUpdateRef.current = setTimeout(updateRiskScore, 3000);
    }
  }, [state.location, state.safetyMode]); // eslint-disable-line

  // ─── Safety mode status updates ──────────────────────────────────────────
  useEffect(() => {
    if (!state.safetyMode) {
      dispatch({ type: 'SET_STATUS', status: 'SAFE' });
    }
  }, [state.safetyMode]);

  // ─── Countdown logic ──────────────────────────────────────────────────────
  useEffect(() => {
    if (state.countdownActive) {
      countdownRef.current = setInterval(() => {
        dispatch({ type: 'TICK_COUNTDOWN' });
      }, 1000);
    } else {
      clearInterval(countdownRef.current);
    }
    return () => clearInterval(countdownRef.current);
  }, [state.countdownActive]);

  useEffect(() => {
    if (state.countdownActive && state.countdownSeconds === 0) {
      clearInterval(countdownRef.current);
      dispatch({ type: 'STOP_COUNTDOWN' });
      activateSos('COUNTDOWN');
    }
  }, [state.countdownSeconds, state.countdownActive]); // eslint-disable-line

  // ─── Travel mode check timer (single authoritative ticker) ───────────────
  const nextCheckSecondsRef = React.useRef(state.nextCheckSeconds);
  nextCheckSecondsRef.current = state.nextCheckSeconds;
  // Forward ref for startCountdown (defined below, used in interval)
  const startCountdownRef = React.useRef(null);

  useEffect(() => {
    if (!state.travelModeActive) {
      clearInterval(travelCheckRef.current);
      return;
    }
    const INTERVAL = 120; // 2 minutes between checks
    dispatch({ type: 'SET_NEXT_CHECK', seconds: INTERVAL });

    travelCheckRef.current = setInterval(() => {
      const remaining = nextCheckSecondsRef.current;
      if (remaining <= 1) {
        dispatch({ type: 'SET_NEXT_CHECK', seconds: INTERVAL });
        startCountdownRef.current?.(30, 'Travel safety check');
      } else {
        dispatch({ type: 'SET_NEXT_CHECK', seconds: remaining - 1 });
      }
    }, 1000);

    return () => clearInterval(travelCheckRef.current);
  }, [state.travelModeActive]); // eslint-disable-line

  // ─── Sensor listeners ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!state.safetyMode) return;

    const unsubShake = sensorService.on('shake', (data) => {
      if (state.activeSos) return; // Already in SOS
      addNotification({
        type: 'warning',
        title: '⚠️ Shake Detected',
        message: 'Shake motion detected. Are you safe?',
        action: 'countdown',
      });
      startCountdown(10, 'Shake/motion detected');
    });

    const unsubSudden = sensorService.on('suddenMovement', () => {
      if (state.activeSos || state.countdownActive) return;
      startCountdown(10, 'Sudden movement detected');
    });

    const unsubInactivity = sensorService.on('inactivity', () => {
      if (state.activeSos || state.countdownActive) return;
      startCountdown(15, 'Long inactivity detected');
    });

    return () => { unsubShake(); unsubSudden(); unsubInactivity(); };
  }, [state.safetyMode, state.activeSos, state.countdownActive]); // eslint-disable-line

  // ─── Actions ─────────────────────────────────────────────────────────────

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user } = res.data;
    localStorage.setItem('safeguard_token', token);
    localStorage.setItem('safeguard_user', JSON.stringify(user));
    dispatch({ type: 'SET_AUTH', user, token });
    return user;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { token, user } = res.data;
    localStorage.setItem('safeguard_token', token);
    localStorage.setItem('safeguard_user', JSON.stringify(user));
    dispatch({ type: 'SET_AUTH', user, token });
    return user;
  };

  const logout = () => {
    localStorage.removeItem('safeguard_token');
    localStorage.removeItem('safeguard_user');
    locationService.stopWatching();
    sensorService.stop();
    audioService.stopAlarm();
    dispatch({ type: 'CLEAR_AUTH' });
  };

  const startLocationTracking = useCallback(() => {
    locationService.startWatching();
    locationService.on('update', async (location) => {
      dispatch({ type: 'SET_LOCATION', location });
      // Update backend location (throttled to every 30s)
      try {
        await locationAPI.update(location);
      } catch {}
    });
    locationService.on('error', (err) => {
      dispatch({ type: 'SET_LOCATION_ERROR', error: err.message });
    });
  }, []);

  const loadContacts = async () => {
    dispatch({ type: 'SET_CONTACTS_LOADING', value: true });
    try {
      const res = await contactsAPI.getAll();
      dispatch({ type: 'SET_CONTACTS', contacts: res.data });
    } catch {
      dispatch({ type: 'SET_CONTACTS', contacts: [] });
    }
  };

  const loadActiveSos = async () => {
    try {
      const res = await sosAPI.getActive();
      if (res.data) {
        dispatch({ type: 'SET_ACTIVE_SOS', sos: res.data });
      }
    } catch {}
  };

  const updateRiskScore = async () => {
    if (!state.location) return;
    try {
      const res = await riskAPI.calculate({
        latitude: state.location.latitude,
        longitude: state.location.longitude,
      });
      dispatch({
        type: 'SET_RISK',
        score: res.data.score,
        level: res.data.level,
        factors: res.data.factors,
        recommendations: res.data.recommendations,
      });

      // Auto-warn on high risk
      if (res.data.level === 'HIGH' && state.safetyMode && !state.countdownActive && !state.activeSos) {
        addNotification({
          type: 'danger',
          title: '🚨 Danger Zone',
          message: `High risk area detected! Risk score: ${res.data.score}/100`,
        });
        dispatch({ type: 'SET_STATUS', status: 'WARNING' });
      }
    } catch {}
  };

  const activateSos = async (triggerType = 'MANUAL') => {
    const location = locationService.getLastKnown() || state.location;
    try {
      const res = await sosAPI.activate({
        latitude: location?.latitude,
        longitude: location?.longitude,
        triggerType,
      });
      dispatch({ type: 'SET_ACTIVE_SOS', sos: res.data.sos });
      dispatch({ type: 'SET_ALARM', value: true });
      audioService.playAlarm();
      addNotification({
        type: 'danger',
        title: '🚨 SOS ACTIVATED',
        message: res.data.message,
      });
    } catch (err) {
      console.error('SOS activation failed:', err);
      // Still show SOS UI even if backend fails
      dispatch({
        type: 'SET_ACTIVE_SOS',
        sos: {
          id: 'local-' + Date.now(),
          status: 'ACTIVE',
          triggerType,
          createdAt: new Date().toISOString(),
          latitude: location?.latitude,
          longitude: location?.longitude,
          riskScore: state.riskScore,
          isOffline: true,
        },
      });
      dispatch({ type: 'SET_ALARM', value: true });
      audioService.playAlarm();
    }
  };

  const cancelSos = async () => {
    if (!state.activeSos) return;
    try {
      if (!state.activeSos.isOffline) {
        await sosAPI.cancel(state.activeSos.id, 'User confirmed safe');
      }
    } catch {}
    dispatch({ type: 'SET_ACTIVE_SOS', sos: null });
    dispatch({ type: 'SET_STATUS', status: 'SAFE' });
    dispatch({ type: 'SET_ALARM', value: false });
    audioService.stopAlarm();
  };

  const startCountdown = (seconds = 10, reason = '') => {
    audioService.playWarningBeep();
    dispatch({ type: 'START_COUNTDOWN', seconds, reason });
  };
  // Keep ref in sync so travel timer can call it
  startCountdownRef.current = startCountdown;

  const cancelCountdown = () => {
    dispatch({ type: 'STOP_COUNTDOWN' });
    if (state.safetyMode) {
      dispatch({ type: 'SET_STATUS', status: 'SAFE' });
    }
  };

  const triggerSafetyCheck = () => {
    startCountdown(30, 'Travel safety check');
  };

  const enableSafetyMode = async () => {
    await sensorService.start();
    dispatch({ type: 'SET_SAFETY_MODE', value: true });
    dispatch({ type: 'SET_STATUS', status: 'SAFE' });
    addNotification({
      type: 'safe',
      title: '🛡️ Safety Mode Active',
      message: 'You are protected. Monitoring is active.',
    });
  };

  const disableSafetyMode = () => {
    sensorService.stop();
    dispatch({ type: 'SET_SAFETY_MODE', value: false });
    dispatch({ type: 'SET_STATUS', status: 'SAFE' });
    dispatch({ type: 'SET_TRAVEL_MODE', value: false });
  };

  const addNotification = (notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', notification });
  };

  const clearNotification = (id) => {
    dispatch({ type: 'CLEAR_NOTIFICATION', id });
  };

  // ─── Demo Actions ─────────────────────────────────────────────────────────

  const demoSimulateUnsafeLocation = async () => {
    const demoLocation = { latitude: 28.6129, longitude: 77.2295, accuracy: 10 };
    dispatch({ type: 'SET_LOCATION', location: demoLocation });
    try {
      const res = await riskAPI.calculate(demoLocation);
      dispatch({
        type: 'SET_RISK',
        score: res.data.score,
        level: res.data.level,
        factors: res.data.factors,
        recommendations: res.data.recommendations,
      });
      dispatch({ type: 'SET_STATUS', status: res.data.level === 'HIGH' ? 'WARNING' : 'SAFE' });
    } catch {
      dispatch({ type: 'SET_RISK', score: 85, level: 'HIGH', factors: ['DEMO: Entering reported danger zone', 'DEMO: Late-night travel'], recommendations: ['Move to safer area'] });
      dispatch({ type: 'SET_STATUS', status: 'WARNING' });
    }
    addNotification({ type: 'danger', title: '🚨 [DEMO] Unsafe Zone', message: 'Entering high-risk area simulation' });
  };

  const demoSimulateShake = () => {
    sensorService.simulateShake();
    addNotification({ type: 'warning', title: '📳 [DEMO] Shake Detected', message: 'Emergency shake simulation triggered' });
  };

  const demoSimulateSos = () => {
    activateSos('DEMO');
    addNotification({ type: 'danger', title: '🚨 [DEMO] SOS Activated', message: 'Demo emergency scenario' });
  };

  const value = {
    ...state,
    // Actions
    login,
    register,
    logout,
    loadContacts,
    activateSos,
    cancelSos,
    startCountdown,
    cancelCountdown,
    enableSafetyMode,
    disableSafetyMode,
    updateRiskScore,
    addNotification,
    clearNotification,
    dispatch,
    // Demo
    demoSimulateUnsafeLocation,
    demoSimulateShake,
    demoSimulateSos,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
