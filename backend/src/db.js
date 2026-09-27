// db.js — Firebase Firestore with in-memory fallback
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

let db = null;

// ── In-memory fallback ────────────────────────────────────────────────────────
const mem = { users: [], contacts: [], sos: [], reports: [] };

function initDb() {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.warn('Firebase env vars missing — using in-memory store');
    return;
  }
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          // Works whether the key has literal \n or real newlines
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    }
    db = admin.firestore();
    console.log('Firestore connected');
  } catch (e) {
    console.warn('Firestore init failed, using in-memory:', e.message);
  }
}

// ── Generic helpers ───────────────────────────────────────────────────────────
async function create(col, data) {
  const id = uuidv4();
  const doc = { id, ...data, createdAt: new Date().toISOString() };
  if (db) { await db.collection(col).doc(id).set(doc); return doc; }
  mem[col] = mem[col] || [];
  mem[col].push(doc);
  return doc;
}

async function findById(col, id) {
  if (db) {
    const snap = await db.collection(col).doc(id).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  }
  return (mem[col] || []).find(r => r.id === id) || null;
}

async function findOne(col, field, value) {
  if (db) {
    const snap = await db.collection(col).where(field, '==', value).limit(1).get();
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
  }
  return (mem[col] || []).find(r => r[field] === value) || null;
}

async function findWhere(col, field, value) {
  if (db) {
    const snap = await db.collection(col).where(field, '==', value).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  return (mem[col] || []).filter(r => r[field] === value);
}

async function update(col, id, data) {
  if (db) {
    await db.collection(col).doc(id).update({ ...data, updatedAt: new Date().toISOString() });
    return findById(col, id);
  }
  const idx = (mem[col] || []).findIndex(r => r.id === id);
  if (idx === -1) return null;
  mem[col][idx] = { ...mem[col][idx], ...data, updatedAt: new Date().toISOString() };
  return mem[col][idx];
}

async function remove(col, id) {
  if (db) { await db.collection(col).doc(id).delete(); return true; }
  const idx = (mem[col] || []).findIndex(r => r.id === id);
  if (idx === -1) return false;
  mem[col].splice(idx, 1);
  return true;
}

async function getAll(col, field, value) {
  if (field !== undefined) return findWhere(col, field, value);
  if (db) {
    const snap = await db.collection(col).limit(200).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  return mem[col] || [];
}

module.exports = { initDb, create, findById, findOne, findWhere, update, remove, getAll };
