// src/routes/reports.js
// Safety reports - community crowdsourced unsafe area reporting

const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const dataStore = require('../services/dataStore');

const router = express.Router();

// ─── GET /api/reports ─────────────────────────────────────────────────────────
// Get all safety reports (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const reports = await dataStore.getAll('safety_reports', 100);
    reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    // Anonymize reporter identity
    const safe = reports.map(({ userId, ...r }) => r);
    res.json(safe);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// ─── POST /api/reports ────────────────────────────────────────────────────────
// Submit a safety report
router.post(
  '/',
  authenticateToken,
  [
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
    body('incidentType').notEmpty().withMessage('Incident type required'),
    body('description').optional().isLength({ max: 500 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      latitude,
      longitude,
      incidentType,
      description,
      severity = 'MEDIUM',
      address,
    } = req.body;

    try {
      const report = await dataStore.create('safety_reports', {
        userId: req.user.userId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        incidentType, // HARASSMENT, THEFT, ASSAULT, SUSPICIOUS_ACTIVITY, POOR_LIGHTING, OTHER
        description: description || '',
        severity, // LOW, MEDIUM, HIGH
        address: address || '',
        verified: false,
        upvotes: 0,
      });

      // Return without userId for privacy
      const { userId, ...safeReport } = report;
      res.status(201).json(safeReport);
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit report' });
    }
  }
);

// ─── GET /api/reports/danger-zones ───────────────────────────────────────────
// Get all danger zones (seeded + generated from reports)
router.get('/danger-zones', optionalAuth, async (req, res) => {
  try {
    const zones = await dataStore.getAll('danger_zones');
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch danger zones' });
  }
});

// ─── GET /api/reports/nearby ──────────────────────────────────────────────────
router.get('/nearby', optionalAuth, async (req, res) => {
  const { lat, lng, radius = 1000 } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

  try {
    const { haversineDistance } = require('../services/riskEngine');
    const reports = await dataStore.getAll('safety_reports', 200);
    const nearby = reports.filter((r) => {
      const dist = haversineDistance(parseFloat(lat), parseFloat(lng), r.latitude, r.longitude);
      return dist <= parseFloat(radius);
    });
    res.json(nearby.map(({ userId, ...r }) => r));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch nearby reports' });
  }
});

module.exports = router;
