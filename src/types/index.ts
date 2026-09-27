// Application-wide TypeScript types

export type SafetyStatus = 'SAFE' | 'CAUTION' | 'DANGER';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isEmergency: boolean;
  userId: string;
}

export interface AlertEvent {
  id: string;
  type: 'SOS_ACTIVATED' | 'SAFETY_CHECK_MISSED' | 'MANUAL_SOS' | 'DANGER_ZONE';
  timestamp: string;
  location?: string;
  lat?: number;
  lng?: number;
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELLED';
  userId: string;
  notes?: string;
}

export interface TravelSession {
  id: string;
  destination: string;
  startTime: string;
  nextCheckIn: string;
  intervalMinutes: number;
  active: boolean;
  missedCheckIns: number;
}

export interface AppSettings {
  notifications: boolean;
  darkMode: boolean;
  locationSharing: boolean;
  shakeDetection: boolean;
  autoSOSOnMissedCheckIn: boolean;
  checkInInterval: number;
}

export interface LocationData {
  lat: number;
  lng: number;
  address?: string;
  accuracy?: number;
  timestamp?: string;
}

export interface DemoState {
  isDemoMode: boolean;
  simulatedStatus: SafetyStatus;
  simulatedLocation: LocationData | null;
}
