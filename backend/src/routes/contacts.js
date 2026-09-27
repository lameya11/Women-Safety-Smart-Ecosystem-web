// routes/contacts.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

// GET all contacts for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const contacts = await db.findWhere('contacts', 'userId', req.user.userId);
    res.json(contacts);
  } catch (e) { res.status(500).json({ error: 'Failed to load contacts' }); }
});

// POST create contact
router.post('/', auth, async (req, res) => {
  const { name, phone, relationship, isEmergency } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });
  try {
    const contact = await db.create('contacts', {
      userId: req.user.userId,
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship || 'Other',
      isEmergency: isEmergency === true || isEmergency === 'true',
    });
    res.status(201).json(contact);
  } catch (e) { res.status(500).json({ error: 'Failed to create contact' }); }
});

// PUT update contact
router.put('/:id', auth, async (req, res) => {
  try {
    const existing = await db.findById('contacts', req.params.id);
    if (!existing || existing.userId !== req.user.userId)
      return res.status(404).json({ error: 'Contact not found' });
    const { name, phone, relationship, isEmergency } = req.body;
    const updated = await db.update('contacts', req.params.id, {
      ...(name !== undefined && { name: name.trim() }),
      ...(phone !== undefined && { phone: phone.trim() }),
      ...(relationship !== undefined && { relationship }),
      ...(isEmergency !== undefined && { isEmergency: isEmergency === true || isEmergency === 'true' }),
    });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: 'Failed to update contact' }); }
});

// DELETE contact
router.delete('/:id', auth, async (req, res) => {
  try {
    const existing = await db.findById('contacts', req.params.id);
    if (!existing || existing.userId !== req.user.userId)
      return res.status(404).json({ error: 'Contact not found' });
    await db.remove('contacts', req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Failed to delete contact' }); }
});

module.exports = router;
