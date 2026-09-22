// src/routes/auth.js
// User registration and login endpoints

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const dataStore = require('../services/dataStore');

const router = express.Router();

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    try {
      // Check if email already exists
      const existing = await dataStore.findOne('users', 'email', email);
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await dataStore.create('users', {
        name,
        email,
        passwordHash,
        phone: phone || '',
        role: 'user',
        safetyModeEnabled: false,
        sosActive: false,
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET || 'fallback-secret-change-me',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      const { passwordHash: _, ...safeUser } = user;
      res.status(201).json({ token, user: safeUser });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await dataStore.findOne('users', 'email', email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET || 'fallback-secret-change-me',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      const { passwordHash: _, ...safeUser } = user;
      res.json({ token, user: safeUser });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const { authenticateToken } = require('../middleware/auth');

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await dataStore.findById('users', req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { passwordHash: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
router.put('/profile', authenticateToken, async (req, res) => {
  const { name, phone } = req.body;
  try {
    const updated = await dataStore.update('users', req.user.userId, {
      ...(name && { name }),
      ...(phone && { phone }),
    });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    const { passwordHash: _, ...safeUser } = updated;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: 'Profile update failed' });
  }
});

module.exports = router;
