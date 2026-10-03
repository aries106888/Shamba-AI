// ─── Pilot Applications Routes ──────────────────────────────────
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/connection');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();

// POST /api/alerts/pilot — public pilot signup (no auth)
router.post('/', (req, res) => {
  const db = getDb();
  const { type, full_name, org_name, phone, email, county, crop, buyer_type, produce } = req.body;
  if (!type || !['farmer','buyer'].includes(type)) return res.status(400).json({ error: "type must be 'farmer' or 'buyer'" });
  if (type === 'farmer' && !phone)    return res.status(400).json({ error: 'Phone required for farmer applications' });
  if (type === 'buyer'  && !email)    return res.status(400).json({ error: 'Email required for buyer applications' });
  const id = uuidv4();
  db.prepare(`INSERT INTO pilot_applications (id,type,full_name,org_name,phone,email,county,crop,buyer_type,produce,status)
              VALUES (?,?,?,?,?,?,?,?,?,?,'pending')`).run(id,type,full_name||null,org_name||null,phone||null,email||null,county||null,crop||null,buyer_type||null,produce||null);
  res.status(201).json({ id, message: 'Application received — we will be in touch soon. Asante!' });
});

// GET /api/alerts/pilot — admin only
router.get('/', authMiddleware, requireRole('admin'), (req, res) => {
  const db = getDb();
  const { type, status } = req.query;
  let q = 'SELECT * FROM pilot_applications WHERE 1=1';
  const params = [];
  if (type)   { q += ' AND type=?';   params.push(type); }
  if (status) { q += ' AND status=?'; params.push(status); }
  q += ' ORDER BY created_at DESC';
  res.json({ applications: db.prepare(q).all(...params) });
});

module.exports = router;
