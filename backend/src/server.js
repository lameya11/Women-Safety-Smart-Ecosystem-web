// src/server.js
// Main Express application entry point
// Women Safety Smart Ecosystem - Backend API

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { initializeFirebase } = require('./config/firebase');

const app = express();

// Trust ngrok/reverse proxy
app.set('trust proxy', 1);

// Initialize Firebase (or fallback to in-memory store)
initializeFirebase();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS - restrict to approved frontend origins
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Always allow localhost for development
const devOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
];

const allAllowedOrigins = [...new Set([...allowedOrigins, ...devOrigins])];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      if (allAllowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app') || origin.endsWith('.render.com') || origin.endsWith('.railway.app')) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked: ${origin}`);
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts' },
});

app.use(globalLimiter);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Women Safety Smart Ecosystem API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Women Safety Smart Ecosystem API',
    version: '1.0.0',
    docs: '/api/health',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET  /api/auth/me',
      'GET  /api/contacts',
      'POST /api/contacts',
      'POST /api/sos',
      'GET  /api/sos/active',
      'GET  /api/sos/history',
      'POST /api/location',
      'GET  /api/location/current',
      'GET  /api/reports',
      'POST /api/reports',
      'GET  /api/reports/danger-zones',
      'POST /api/risk/calculate',
    ],
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/sos', require('./routes/sos'));
app.use('/api/location', require('./routes/location'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/risk', require('./routes/risk'));

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith('CORS policy')) {
    return res.status(403).json({ error: err.message });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🛡️  Women Safety Smart Ecosystem API`);
  console.log(`   Running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});

module.exports = app;
