// src/routes/contacts.js
// Trusted contacts management

const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const dataStore = require('../services/dataStore');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ─── GET /api/contacts ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const contacts = await dataStore.findWhere('trusted_contacts', 'userId', req.user.userId);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// ─── POST /api/contacts ───────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Name required'),
    body('phone').notEmpty().withMessage('Phone number required'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('isEmergency').optional().isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, email, isEmergency = false, relationship } = req.body;

    try {
      const contact = await dataStore.create('trusted_contacts', {
        userId: req.user.userId,
        name,
        phone,
        email: email || '',
        relationship: relationship || '',
        isEmergency: Boolean(isEmergency),
      });
      res.status(201).json(contact);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create contact' });
    }
  }
);

// ─── PUT /api/contacts/:id ────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const contact = await dataStore.findById('trusted_contacts', req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    if (contact.userId !== req.user.userId) return res.status(403).json({ error: 'Unauthorized' });

    const { name, phone, email, isEmergency, relationship } = req.body;
    const updated = await dataStore.update('trusted_contacts', req.params.id, {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(email !== undefined && { email }),
      ...(isEmergency !== undefined && { isEmergency: Boolean(isEmergency) }),
      ...(relationship !== undefined && { relationship }),
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// ─── DELETE /api/contacts/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const contact = await dataStore.findById('trusted_contacts', req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    if (contact.userId !== req.user.userId) return res.status(403).json({ error: 'Unauthorized' });

    await dataStore.remove('trusted_contacts', req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

module.exports = router;
