// ─── Yield Registry Routes ──────────────────────────────────────
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET /api/yields
router.get('/', (req, res) => {
  const db = getDb();
  const { county, crop, status, grade } = req.query;
  let q = `SELECT y.*, f.full_name as farmer_name, f.county as farmer_county
           FROM yield_registry y JOIN farmers f ON y.farmer_id=f.id WHERE 1=1`;
  const params = [];
  if (county) { q += ' AND y.county=?'; params.push(county); }
  if (crop)   { q += ' AND LOWER(y.crop) LIKE ?'; params.push(`%${crop.toLowerCase()}%`); }
  if (status) { q += ' AND y.status=?'; params.push(status); }
  if (grade)  { q += ' AND y.grade=?';  params.push(grade); }
  q += ' ORDER BY y.harvest_date';
  res.json({ yields: db.prepare(q).all(...params) });
});

// GET /api/yields/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const y = db.prepare(`SELECT y.*, f.full_name as farmer_name FROM yield_registry y JOIN farmers f ON y.farmer_id=f.id WHERE y.id=?`).get(req.params.id);
  if (!y) return res.status(404).json({ error: 'Yield not found' });
  res.json({ yield: y });
});

// POST /api/yields — farmer registers a yield
router.post('/', authMiddleware, (req, res) => {
  const db = getDb();
  const { farmer_id, plot_id, crop, variety, expected_qty_kg, harvest_date, county, grade, price_ksh_kg } = req.body;
  if (!farmer_id || !crop || !expected_qty_kg || !county) {
    return res.status(400).json({ error: 'farmer_id, crop, expected_qty_kg and county are required' });
  }
  const id = uuidv4();
  db.prepare(`INSERT INTO yield_registry (id,farmer_id,plot_id,crop,variety,expected_qty_kg,harvest_date,county,grade,price_ksh_kg,status)
              VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(id,farmer_id,plot_id||null,crop,variety||null,expected_qty_kg,harvest_date||null,county,grade||null,price_ksh_kg||null,'pending');
  res.status(201).json({ id, message: 'Yield registered' });
});

// PATCH /api/yields/:id/confirm
router.patch('/:id/confirm', authMiddleware, (req, res) => {
  const db = getDb();
  const { confirmed_qty_kg } = req.body;
  db.prepare('UPDATE yield_registry SET status="confirmed", confirmed_qty_kg=? WHERE id=?').run(confirmed_qty_kg, req.params.id);
  res.json({ message: 'Yield confirmed' });
});

// GET /api/yields/farmer/:farmerId
router.get('/farmer/:farmerId', authMiddleware, (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM yield_registry WHERE farmer_id=? ORDER BY created_at DESC').all(req.params.farmerId);
  res.json({ yields: rows });
});

module.exports = router;
