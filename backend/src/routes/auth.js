// routes/auth.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const SECRET = process.env.JWT_SECRET || 'safeguard-secret';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

function makeToken(user) {
  return jwt.sign({ userId: user.id, email: user.email, name: user.name }, SECRET, { expiresIn: EXPIRES });
}

function safe(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  try {
    const existing = await db.findOne('users', 'email', email.toLowerCase());
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.create('users', {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      phone: phone || '',
      role: 'user',
    });
    res.status(201).json({ token: makeToken(user), user: safe(user) });
  } catch (e) {
    console.error('register:', e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });
  try {
    const user = await db.findOne('users', 'email', email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ token: makeToken(user), user: safe(user) });
  } catch (e) {
    console.error('login:', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
const auth = require('../middleware/auth');
router.get('/me', auth, async (req, res) => {
  try {
    const user = await db.findById('users', req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(safe(user));
  } catch (e) {
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  const { name, phone } = req.body;
  try {
    const updated = await db.update('users', req.user.userId, {
      ...(name && { name: name.trim() }),
      ...(phone !== undefined && { phone }),
    });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(safe(updated));
  } catch (e) {
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
