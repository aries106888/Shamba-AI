// ─── Logistics Routes ───────────────────────────────────────────
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET /api/logistics
router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT l.*, m.qty_kg, m.agreed_price, y.crop, y.county as pickup_from, b.org_name as buyer_name
    FROM logistics l
    JOIN matches m ON l.match_id=m.id
    JOIN yield_registry y ON m.yield_id=y.id
    JOIN buyers b ON m.buyer_id=b.id
    ORDER BY l.created_at DESC
  `).all();
  res.json({ bookings: rows });
});

// POST /api/logistics — book a truck
router.post('/', authMiddleware, (req, res) => {
  const db = getDb();
  const { match_id, pickup_county, delivery_county, pickup_date, driver_name, driver_phone, truck_reg, distance_km, cost_ksh } = req.body;
  if (!match_id || !pickup_date) return res.status(400).json({ error: 'match_id and pickup_date required' });
  const id = uuidv4();
  db.prepare(`INSERT INTO logistics (id,match_id,pickup_county,delivery_county,pickup_date,driver_name,driver_phone,truck_reg,distance_km,cost_ksh,status)
              VALUES (?,?,?,?,?,?,?,?,?,?,'booked')`).run(id,match_id,pickup_county,delivery_county,pickup_date,driver_name,driver_phone,truck_reg,distance_km,cost_ksh);
  res.status(201).json({ id, message: 'Logistics booked' });
});

// PATCH /api/logistics/:id/status — update delivery status
router.patch('/:id/status', authMiddleware, (req, res) => {
  const db = getDb();
  const { status, delivery_proof } = req.body;
  const valid = ['booked','in_transit','delivered','cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: `Status must be one of: ${valid.join(', ')}` });
  db.prepare('UPDATE logistics SET status=?, delivery_proof=COALESCE(?,delivery_proof) WHERE id=?').run(status, delivery_proof||null, req.params.id);

  // If delivered, trigger M-Pesa escrow release (stub)
  if (status === 'delivered') {
    const log = db.prepare('SELECT * FROM logistics WHERE id=?').get(req.params.id);
    const match = db.prepare('SELECT * FROM matches WHERE id=?').get(log.match_id);
    const paymentId = uuidv4();
    const amount = (match.qty_kg * match.agreed_price).toFixed(2);
    db.prepare(`INSERT INTO payments (id,logistics_id,match_id,payer_phone,recipient_phone,amount_ksh,status)
                VALUES (?,?,?,?,?,?,'released')`).run(paymentId, req.params.id, log.match_id, '+254000000000', '+254000000001', amount);
    db.prepare('UPDATE matches SET status="fulfilled" WHERE id=?').run(log.match_id);
    return res.json({ message: 'Delivered — M-Pesa escrow released (stub)', payment_id: paymentId, amount_ksh: amount });
  }
  res.json({ message: `Status updated to ${status}` });
});

// GET /api/logistics/:id
router.get('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM logistics WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Booking not found' });
  res.json({ booking: row });
});

module.exports = router;
