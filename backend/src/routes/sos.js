// routes/sos.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

// POST activate SOS
router.post('/', auth, async (req, res) => {
  const { latitude, longitude, message } = req.body;
  try {
    const alert = await db.create('sos', {
      userId: req.user.userId,
      userName: req.user.name,
      latitude: latitude || null,
      longitude: longitude || null,
      message: message || 'SOS Alert',
      status: 'active',
    });
    res.status(201).json(alert);
  } catch (e) { res.status(500).json({ error: 'Failed to create SOS alert' }); }
});

// GET history
router.get('/history', auth, async (req, res) => {
  try {
    const alerts = await db.findWhere('sos', 'userId', req.user.userId);
    res.json(alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (e) { res.status(500).json({ error: 'Failed to load history' }); }
});

// PUT cancel
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const alert = await db.findById('sos', req.params.id);
    if (!alert || alert.userId !== req.user.userId)
      return res.status(404).json({ error: 'Alert not found' });
    const updated = await db.update('sos', req.params.id, { status: 'cancelled' });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: 'Failed to cancel alert' }); }
});

module.exports = router;
