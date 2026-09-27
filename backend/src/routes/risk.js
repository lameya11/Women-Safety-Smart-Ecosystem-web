// src/routes/risk.js
// Risk calculation endpoint

const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const { calculateRisk } = require('../services/riskEngine');

const router = express.Router();

// ─── POST /api/risk/calculate ─────────────────────────────────────────────────
router.post('/calculate', optionalAuth, async (req, res) => {
  const { latitude, longitude, movementData } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'latitude and longitude required' });
  }

  try {
    const result = await calculateRisk({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      movementData: movementData || null,
      userId: req.user?.userId,
    });
    res.json(result);
  } catch (error) {
    console.error('Risk calculation error:', error);
    res.status(500).json({ error: 'Risk calculation failed' });
  }
});

module.exports = router;
