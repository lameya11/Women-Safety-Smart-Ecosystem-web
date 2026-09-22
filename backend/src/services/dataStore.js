// src/services/dataStore.js
// Abstraction layer for data persistence
// Supports Firebase Firestore OR in-memory store (demo/fallback)

const { getDb, isFirebaseAvailable } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

// ─── In-Memory Store (Demo Mode) ─────────────────────────────────────────────
const memStore = {
  users: [],
  trusted_contacts: [],
  sos_alerts: [],
  location_updates: [],
  safety_reports: [],
  danger_zones: [],
  emergency_events: [],
  alert_history: [],
};

// Seed demo danger zones
memStore.danger_zones = [
  {
    id: 'zone-1',
    name: 'High Risk Zone - North Market',
    latitude: 28.6129,
    longitude: 77.2295,
    radius: 500,
    riskLevel: 'HIGH',
    riskScore: 85,
    reports: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'zone-2',
    name: 'Medium Risk Zone - Old Station',
    latitude: 28.6219,
    longitude: 77.2080,
    radius: 400,
    riskLevel: 'MEDIUM',
    riskScore: 55,
    reports: 6,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'zone-3',
    name: 'Caution Area - Night Market',
    latitude: 28.6304,
    longitude: 77.2177,
    radius: 300,
    riskLevel: 'MEDIUM',
    riskScore: 45,
    reports: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'zone-4',
    name: 'Low Risk Zone - City Park',
    latitude: 28.6448,
    longitude: 77.2167,
    radius: 600,
    riskLevel: 'LOW',
    riskScore: 15,
    reports: 1,
    createdAt: new Date().toISOString(),
  },
];

// ─── Generic CRUD helpers ─────────────────────────────────────────────────────

async function create(collection, data) {
  const id = uuidv4();
  const record = { id, ...data, createdAt: new Date().toISOString() };

  if (isFirebaseAvailable()) {
    const db = getDb();
    await db.collection(collection).doc(id).set(record);
    return record;
  }

  memStore[collection] = memStore[collection] || [];
  memStore[collection].push(record);
  return record;
}

async function findById(collection, id) {
  if (isFirebaseAvailable()) {
    const db = getDb();
    const doc = await db.collection(collection).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  return (memStore[collection] || []).find((r) => r.id === id) || null;
}

async function findWhere(collection, field, value) {
  if (isFirebaseAvailable()) {
    const db = getDb();
    const snap = await db.collection(collection).where(field, '==', value).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  return (memStore[collection] || []).filter((r) => r[field] === value);
}

async function findOne(collection, field, value) {
  const results = await findWhere(collection, field, value);
  return results[0] || null;
}

async function update(collection, id, data) {
  const updatedAt = new Date().toISOString();

  if (isFirebaseAvailable()) {
    const db = getDb();
    await db.collection(collection).doc(id).update({ ...data, updatedAt });
    return findById(collection, id);
  }

  const idx = (memStore[collection] || []).findIndex((r) => r.id === id);
  if (idx === -1) return null;
  memStore[collection][idx] = { ...memStore[collection][idx], ...data, updatedAt };
  return memStore[collection][idx];
}

async function remove(collection, id) {
  if (isFirebaseAvailable()) {
    const db = getDb();
    await db.collection(collection).doc(id).delete();
    return true;
  }

  const idx = (memStore[collection] || []).findIndex((r) => r.id === id);
  if (idx === -1) return false;
  memStore[collection].splice(idx, 1);
  return true;
}

async function getAll(collection, limit = 100) {
  if (isFirebaseAvailable()) {
    const db = getDb();
    const snap = await db.collection(collection).limit(limit).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  return (memStore[collection] || []).slice(-limit);
}

async function getLatestWhere(collection, field, value, orderByField = 'createdAt') {
  if (isFirebaseAvailable()) {
    const db = getDb();
    const snap = await db
      .collection(collection)
      .where(field, '==', value)
      .orderBy(orderByField, 'desc')
      .limit(1)
      .get();
    return snap.docs.length ? { id: snap.docs[0].id, ...snap.docs[0].data() } : null;
  }

  const records = (memStore[collection] || [])
    .filter((r) => r[field] === value)
    .sort((a, b) => new Date(b[orderByField]) - new Date(a[orderByField]));
  return records[0] || null;
}

module.exports = {
  create,
  findById,
  findWhere,
  findOne,
  update,
  remove,
  getAll,
  getLatestWhere,
  memStore,
};
