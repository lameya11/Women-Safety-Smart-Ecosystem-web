// src/routes/sos.js
// SOS alert creation, management, and emergency events

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const dataStore = require('../services/dataStore');
const { calculateRisk } = require('../services/riskEngine');

const router = express.Router();

router.use(authenticateToken);

// ─── POST /api/sos ────────────────────────────────────────────────────────────
// Create/activate SOS alert
router.post('/', async (req, res) => {
  const {
    latitude,
    longitude,
    triggerType = 'MANUAL',
    movementData = null,
    message,
  } = req.body;

  try {
    // Calculate risk at SOS location
    const risk = await calculateRisk({ latitude, longitude, movementData, userId: req.user.userId });

    // Fetch trusted contacts for notification tracking
    const contacts = await dataStore.findWhere('trusted_contacts', 'userId', req.user.userId);
    const emergencyContacts = contacts.filter((c) => c.isEmergency);

    const sosAlert = await dataStore.create('sos_alerts', {
      userId: req.user.userId,
      userName: req.user.name,
      latitude: latitude || 0,
      longitude: longitude || 0,
      status: 'ACTIVE',
      triggerType, // MANUAL | SHAKE | COUNTDOWN | INACTIVITY | VOICE | DEMO
      riskScore: risk.score,
      riskLevel: risk.level,
      riskFactors: risk.factors,
      contactsNotified: emergencyContacts.map((c) => ({ id: c.id, name: c.name, phone: c.phone })),
      recordingStatus: 'NOT_STARTED',
      message: message || 'WOMEN SAFETY ALERT: I may be in danger. Please check my live location and contact me immediately.',
      isDemo: triggerType === 'DEMO',
    });

    // Update user status
    await dataStore.update('users', req.user.userId, { sosActive: true, lastSosId: sosAlert.id });

    // Log emergency event
    await dataStore.create('emergency_events', {
      userId: req.user.userId,
      sosId: sosAlert.id,
      eventType: 'SOS_ACTIVATED',
      details: { triggerType, riskScore: risk.score, contactsCount: emergencyContacts.length },
    });

    res.status(201).json({
      sos: sosAlert,
      risk,
      contactsNotified: emergencyContacts.length,
      message: emergencyContacts.length > 0
        ? `[SIMULATED] Alert sent to ${emergencyContacts.length} emergency contact(s)`
        : 'SOS activated. Add emergency contacts to notify them automatically.',
    });
  } catch (error) {
    console.error('SOS creation error:', error);
    res.status(500).json({ error: 'Failed to activate SOS' });
  }
});

// ─── GET /api/sos/active ──────────────────────────────────────────────────────
// Get user's active SOS
router.get('/active', async (req, res) => {
  try {
    const allSos = await dataStore.findWhere('sos_alerts', 'userId', req.user.userId);
    const active = allSos.filter((s) => s.status === 'ACTIVE').sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json(active[0] || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active SOS' });
  }
});

// ─── GET /api/sos/history ─────────────────────────────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const alerts = await dataStore.findWhere('sos_alerts', 'userId', req.user.userId);
    alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(alerts.slice(0, 20));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SOS history' });
  }
});

// ─── PUT /api/sos/:id/cancel ──────────────────────────────────────────────────
router.put('/:id/cancel', async (req, res) => {
  try {
    const sos = await dataStore.findById('sos_alerts', req.params.id);
    if (!sos) return res.status(404).json({ error: 'SOS not found' });
    if (sos.userId !== req.user.userId) return res.status(403).json({ error: 'Unauthorized' });

    const updated = await dataStore.update('sos_alerts', req.params.id, {
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString(),
    });

    await dataStore.update('users', req.user.userId, { sosActive: false });

    await dataStore.create('emergency_events', {
      userId: req.user.userId,
      sosId: req.params.id,
      eventType: 'SOS_CANCELLED',
      details: { reason: req.body.reason || 'User cancelled' },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel SOS' });
  }
});

// ─── PUT /api/sos/:id/resolve ─────────────────────────────────────────────────
router.put('/:id/resolve', async (req, res) => {
  try {
    const sos = await dataStore.findById('sos_alerts', req.params.id);
    if (!sos) return res.status(404).json({ error: 'SOS not found' });
    if (sos.userId !== req.user.userId) return res.status(403).json({ error: 'Unauthorized' });

    const updated = await dataStore.update('sos_alerts', req.params.id, {
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString(),
    });

    await dataStore.update('users', req.user.userId, { sosActive: false });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve SOS' });
  }
});

// ─── GET /api/sos/:id ─────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const sos = await dataStore.findById('sos_alerts', req.params.id);
    if (!sos) return res.status(404).json({ error: 'SOS not found' });
    if (sos.userId !== req.user.userId) return res.status(403).json({ error: 'Unauthorized' });
    res.json(sos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SOS' });
  }
});

module.exports = router;
