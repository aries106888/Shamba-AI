// ─── Buyers Routes ──────────────────────────────────────────────
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/connection');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, requireRole('admin'), (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT b.*,u.phone,u.email FROM buyers b JOIN users u ON b.user_id=u.id').all();
  res.json({ buyers: rows });
});

router.post('/', authMiddleware, (req, res) => {
  const db = getDb();
  const { org_name, contact_name, email, phone, buyer_type } = req.body;
  if (!org_name || !contact_name) return res.status(400).json({ error: 'org_name and contact_name required' });
  const id = uuidv4();
  db.prepare('INSERT INTO buyers (id,user_id,org_name,contact_name,email,phone,buyer_type) VALUES (?,?,?,?,?,?,?)')
    .run(id, req.user.id, org_name, contact_name, email||null, phone||null, buyer_type||'other');
  res.status(201).json({ id, message: 'Buyer profile created' });
});

router.get('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const buyer = db.prepare('SELECT b.*,u.phone,u.email FROM buyers b JOIN users u ON b.user_id=u.id WHERE b.id=?').get(req.params.id);
  if (!buyer) return res.status(404).json({ error: 'Buyer not found' });
  res.json({ buyer });
});

module.exports = router;
