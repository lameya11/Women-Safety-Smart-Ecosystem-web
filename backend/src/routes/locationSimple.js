// routes/locationSimple.js — Live location updates using db.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

// POST /api/location — store current position
router.post('/', auth, async (req, res) => {
  const { latitude, longitude, accuracy } = req.body;
  if (latitude === undefined || longitude === undefined)
    return res.status(400).json({ error: 'latitude and longitude required' });
  try {
    const loc = await db.create('location_updates', {
      userId: req.user.userId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: accuracy || null,
    });
    res.json(loc);
  } catch (e) { res.status(500).json({ error: 'Failed to update location' }); }
});

// GET /api/location/current — get latest location
router.get('/current', auth, async (req, res) => {
  try {
    const updates = await db.findWhere('location_updates', 'userId', req.user.userId);
    if (!updates.length) return res.json(null);
    const latest = updates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    res.json(latest);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch location' }); }
});

// GET /api/location/track/:userId — tracking page (minimal public data, no auth)
router.get('/track/:userId', async (req, res) => {
  try {
    const updates = await db.findWhere('location_updates', 'userId', req.params.userId);
    if (!updates.length) return res.json({ found: false });
    const latest = updates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    res.json({
      found: true,
      latitude: latest.latitude,
      longitude: latest.longitude,
      accuracy: latest.accuracy,
      updatedAt: latest.createdAt,
    });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch tracked location' }); }
});

module.exports = router;
