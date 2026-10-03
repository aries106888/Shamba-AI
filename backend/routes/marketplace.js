// ─── Marketplace Routes ─────────────────────────────────────────
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET /api/marketplace — available confirmed yields for buyers
router.get('/', (req, res) => {
  const db = getDb();
  const { county, crop, grade, maxPrice } = req.query;
  let q = `SELECT y.*, f.full_name as farmer_name, f.county
           FROM yield_registry y JOIN farmers f ON y.farmer_id=f.id
           WHERE y.status IN ('confirmed','pending') AND (y.confirmed_qty_kg > 0 OR y.expected_qty_kg > 0)`;
  const params = [];
  if (county)   { q += ' AND y.county=?';              params.push(county); }
  if (crop)     { q += ' AND LOWER(y.crop) LIKE ?';    params.push(`%${crop.toLowerCase()}%`); }
  if (grade)    { q += ' AND y.grade=?';               params.push(grade); }
  if (maxPrice) { q += ' AND y.price_ksh_kg <= ?';     params.push(parseFloat(maxPrice)); }
  q += ' ORDER BY y.harvest_date';
  res.json({ listings: db.prepare(q).all(...params) });
});

// POST /api/marketplace/match — buyer requests a match
router.post('/match', authMiddleware, (req, res) => {
  const db = getDb();
  const { yield_id, buyer_id, qty_kg, agreed_price } = req.body;
  if (!yield_id || !buyer_id || !qty_kg) return res.status(400).json({ error: 'yield_id, buyer_id and qty_kg required' });
  const yld = db.prepare('SELECT * FROM yield_registry WHERE id=?').get(yield_id);
  if (!yld) return res.status(404).json({ error: 'Yield not found' });

  const id = uuidv4();
  db.prepare('INSERT INTO matches (id,yield_id,buyer_id,qty_kg,agreed_price,status) VALUES (?,?,?,?,?,?)')
    .run(id, yield_id, buyer_id, qty_kg, agreed_price||yld.price_ksh_kg, 'proposed');
  db.prepare('UPDATE yield_registry SET status="matched" WHERE id=?').run(yield_id);

  res.status(201).json({ match_id: id, message: 'Match proposed — awaiting farmer confirmation' });
});

// GET /api/marketplace/matches/:buyerId
router.get('/matches/:buyerId', authMiddleware, (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT m.*, y.crop, y.county, y.grade, y.harvest_date, f.full_name as farmer_name
    FROM matches m
    JOIN yield_registry y ON m.yield_id=y.id
    JOIN farmers f ON y.farmer_id=f.id
    WHERE m.buyer_id=? ORDER BY m.matched_at DESC
  `).all(req.params.buyerId);
  res.json({ matches: rows });
});

// PATCH /api/marketplace/matches/:id/accept
router.patch('/matches/:id/accept', authMiddleware, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE matches SET status="accepted" WHERE id=?').run(req.params.id);
  res.json({ message: 'Match accepted' });
});

module.exports = router;
