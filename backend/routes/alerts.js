// ─── Alerts Routes ──────────────────────────────────────────────
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/connection');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();

// GET /api/alerts
router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const { county, type, status } = req.query;
  let q = 'SELECT * FROM alerts WHERE 1=1';
  const params = [];
  if (county) { q += ' AND county=?'; params.push(county); }
  if (type)   { q += ' AND type=?';   params.push(type); }
  if (status) { q += ' AND status=?'; params.push(status); }
  q += ' ORDER BY created_at DESC LIMIT 100';
  res.json({ alerts: db.prepare(q).all(...params) });
});

// GET /api/alerts/farmer/:farmerId
router.get('/farmer/:farmerId', authMiddleware, (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM alerts WHERE farmer_id=? ORDER BY created_at DESC LIMIT 50').all(req.params.farmerId);
  res.json({ alerts: rows });
});

// POST /api/alerts — create and queue alert (admin / system)
router.post('/', authMiddleware, requireRole('admin'), (req, res) => {
  const db = getDb();
  const { farmer_id, county, type, channel, lang='sw', message_sw, message_en } = req.body;
  if (!type || !message_sw) return res.status(400).json({ error: 'type and message_sw required' });
  const id = uuidv4();
  // In production: send via Africa's Talking SMS API / Twilio WhatsApp here
  db.prepare(`INSERT INTO alerts (id,farmer_id,county,type,channel,lang,message_sw,message_en,sent_at,status)
              VALUES (?,?,?,?,?,?,?,?,datetime('now'),'sent')`).run(id,farmer_id||null,county||null,type,channel||'sms',lang,message_sw,message_en||null);
  res.status(201).json({ id, message: 'Alert queued (stub — integrate Africa\'s Talking for live SMS)' });
});

// POST /api/alerts/broadcast — send to all farmers in a county
router.post('/broadcast', authMiddleware, requireRole('admin'), (req, res) => {
  const db = getDb();
  const { county, type, channel='sms', message_sw, message_en } = req.body;
  if (!county || !message_sw) return res.status(400).json({ error: 'county and message_sw required' });
  const farmers = db.prepare('SELECT id FROM farmers WHERE county=?').all(county);
  const insert = db.prepare(`INSERT INTO alerts (id,farmer_id,county,type,channel,lang,message_sw,message_en,sent_at,status)
                             VALUES (?,?,?,?,?,?,?,?,datetime('now'),'sent')`);
  const insertAll = db.transaction(() => {
    farmers.forEach(f => insert.run(uuidv4(), f.id, county, type, channel, 'sw', message_sw, message_en||null));
  });
  insertAll();
  res.json({ message: `Broadcast queued for ${farmers.length} farmers in ${county}` });
});

module.exports = router;
