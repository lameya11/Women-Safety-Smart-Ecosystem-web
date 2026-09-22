// src/routes/location.js
// Live location tracking and updates

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const dataStore = require('../services/dataStore');

const router = express.Router();

router.use(authenticateToken);

// ─── POST /api/location ───────────────────────────────────────────────────────
// Update user's current location
router.post('/', async (req, res) => {
  const { latitude, longitude, accuracy, speed, heading, altitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'latitude and longitude required' });
  }

  try {
    const locationUpdate = await dataStore.create('location_updates', {
      userId: req.user.userId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: accuracy || null,
      speed: speed || null,
      heading: heading || null,
      altitude: altitude || null,
    });

    // Update user's current location
    await dataStore.update('users', req.user.userId, {
      currentLatitude: parseFloat(latitude),
      currentLongitude: parseFloat(longitude),
      locationUpdatedAt: new Date().toISOString(),
    });

    res.json(locationUpdate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// ─── GET /api/location/current ────────────────────────────────────────────────
// Get user's latest location
router.get('/current', async (req, res) => {
  try {
    const latest = await dataStore.getLatestWhere('location_updates', 'userId', req.user.userId);
    if (!latest) return res.json(null);
    res.json(latest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

// ─── GET /api/location/history ────────────────────────────────────────────────
// Get location history for route display
router.get('/history', async (req, res) => {
  try {
    const allUpdates = await dataStore.findWhere('location_updates', 'userId', req.user.userId);
    // Return last 50, newest first
    allUpdates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(allUpdates.slice(0, 50));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch location history' });
  }
});

// ─── GET /api/location/track/:userId ─────────────────────────────────────────
// Allow trusted contact to view a user's location (public tracking link)
router.get('/track/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const latest = await dataStore.getLatestWhere('location_updates', 'userId', userId);

    // Only return minimal, non-sensitive location data
    if (!latest) return res.json({ found: false });

    res.json({
      found: true,
      latitude: latest.latitude,
      longitude: latest.longitude,
      updatedAt: latest.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tracked location' });
  }
});

module.exports = router;
