// src/config/firebase.js
// Firebase Admin SDK initialization
// Uses environment variables - never hardcode credentials

const admin = require('firebase-admin');

let db = null;
let isFirebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK
 * Falls back to in-memory store if Firebase credentials are not configured
 */
function initializeFirebase() {
  if (isFirebaseInitialized) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey || projectId === 'your-firebase-project-id') {
    console.warn('⚠️  Firebase credentials not configured. Using in-memory store (demo mode).');
    console.warn('   Set FIREBASE_* environment variables to enable persistent storage.');
    isFirebaseInitialized = true;
    return;
  }

  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    }
    db = admin.firestore();
    isFirebaseInitialized = true;
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.warn('⚠️  Firebase initialization failed:', error.message);
    console.warn('   Falling back to in-memory store (demo mode).');
    isFirebaseInitialized = true;
  }
}

/**
 * Get Firestore instance (or null if using in-memory)
 */
function getDb() {
  return db;
}

/**
 * Check if Firebase is available
 */
function isFirebaseAvailable() {
  return db !== null;
}

module.exports = { initializeFirebase, getDb, isFirebaseAvailable };
