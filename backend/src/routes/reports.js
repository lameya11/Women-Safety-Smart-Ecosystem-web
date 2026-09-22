// routes/reports.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

// GET all reports
router.get('/', auth, async (req, res) => {
  try {
    const reports = await db.getAll('reports');
    res.json(reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (e) { res.status(500).json({ error: 'Failed to load reports' }); }
});

// POST create report
router.post('/', auth, async (req, res) => {
  const { title, description, latitude, longitude, category } = req.body;
  if (!title || !description) return res.status(400).json({ error: 'Title and description required' });
  try {
    const report = await db.create('reports', {
      userId: req.user.userId,
      userName: req.user.name,
      title: title.trim(),
      description: description.trim(),
      latitude: latitude || null,
      longitude: longitude || null,
      category: category || 'General',
    });
    res.status(201).json(report);
  } catch (e) { res.status(500).json({ error: 'Failed to create report' }); }
});

module.exports = router;
