require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initDb } = require('./db');

const app = express();
app.set('trust proxy', 1);

// Init database
initDb();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS — allow all Vercel/Netlify origins + any configured FRONTEND_URL
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const allowed = (process.env.FRONTEND_URL || '')
      .split(',').map(s => s.trim()).filter(Boolean);
    if (
      allowed.includes(origin) ||
      /\.vercel\.app$/.test(origin) ||
      /\.netlify\.app$/.test(origin)
    ) return cb(null, true);
    cb(new Error('CORS: ' + origin + ' not allowed'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// Rate limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }));

app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/sos',      require('./routes/sos'));
app.use('/api/reports',  require('./routes/reports'));

// Health
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));
app.get('/',       (_req, res) => res.json({ app: 'SafeGuard API', version: '2.0' }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, _req, res, _next) => {
  if (err.message?.startsWith('CORS')) return res.status(403).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SafeGuard API running on ${PORT}`));

module.exports = app;
