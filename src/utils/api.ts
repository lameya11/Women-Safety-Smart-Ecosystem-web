/**
 * api.ts — Centralised HTTP client for the SafeGuard backend.
 *
 * Base URL: VITE_API_URL env var (required in production).
 * Falls back gracefully — every caller must handle ApiError
 * and degrade to localStorage when the backend is unreachable.
 *
 * JWT token is read from localStorage key 'shesafe_token'.
 * NEVER store or forward AI API keys from this file.
 */

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  try { return localStorage.getItem('shesafe_token'); } catch { return null; }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  requiresAuth = true
): Promise<T> {
  if (!BASE) throw new ApiError(0, 'Backend not configured (VITE_API_URL missing)');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (requiresAuth) {
    const token = getToken();
    if (!token) throw new ApiError(401, 'Not authenticated');
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? `HTTP ${res.status}`);
  return data as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: ApiUser;
}

export const authApi = {
  register: (name: string, email: string, password: string, phone?: string) =>
    request<AuthResponse>('POST', '/api/auth/register', { name, email, password, phone }, false),

  login: (email: string, password: string) =>
    request<AuthResponse>('POST', '/api/auth/login', { email, password }, false),

  me: () => request<ApiUser>('GET', '/api/auth/me'),

  updateProfile: (updates: { name?: string; phone?: string }) =>
    request<ApiUser>('PUT', '/api/auth/profile', updates),
};

// ─── Contacts ────────────────────────────────────────────────────────────────

export interface ApiContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
  isEmergency: boolean;
  createdAt: string;
}

export const contactsApi = {
  list: () => request<ApiContact[]>('GET', '/api/contacts'),

  create: (data: { name: string; phone: string; relationship: string; isEmergency: boolean }) =>
    request<ApiContact>('POST', '/api/contacts', data),

  update: (id: string, data: Partial<{ name: string; phone: string; relationship: string; isEmergency: boolean }>) =>
    request<ApiContact>('PUT', `/api/contacts/${id}`, data),

  delete: (id: string) => request<{ success: boolean }>('DELETE', `/api/contacts/${id}`),
};

// ─── SOS ─────────────────────────────────────────────────────────────────────

export interface ApiSosAlert {
  id: string;
  userId: string;
  latitude: number | null;
  longitude: number | null;
  message: string;
  status: 'active' | 'cancelled' | 'resolved';
  createdAt: string;
}

export const sosApi = {
  activate: (latitude?: number, longitude?: number, message?: string) =>
    request<ApiSosAlert>('POST', '/api/sos', { latitude, longitude, message }),

  cancel: (id: string) => request<ApiSosAlert>('PUT', `/api/sos/${id}/cancel`, {}),

  history: () => request<ApiSosAlert[]>('GET', '/api/sos/history'),
};

// ─── Location ────────────────────────────────────────────────────────────────

export interface ApiLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  updatedAt?: string;
}

export const locationApi = {
  update: (lat: number, lng: number, accuracy?: number) =>
    request<ApiLocation>('POST', '/api/location', { latitude: lat, longitude: lng, accuracy }),

  current: () => request<ApiLocation | null>('GET', '/api/location/current'),
};

// ─── AI proxy ────────────────────────────────────────────────────────────────
// AI keys live on the backend only — never in client code.

export interface AiMessage { role: 'user' | 'assistant'; content: string; }

export const aiApi = {
  chat: (messages: AiMessage[], context?: string) =>
    request<{ reply: string; model: string }>('POST', '/api/ai/chat', { messages, context }),
};
