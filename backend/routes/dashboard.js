// ─── Dashboard Routes ───────────────────────────────────────────
const express = require('express');
const { getDb } = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET /api/dashboard/summary — platform-wide stats
router.get('/summary', (req, res) => {
  const db = getDb();
  const farmers_count  = db.prepare('SELECT COUNT(*) as n FROM farmers WHERE is_verified=1').get().n;
  const plots_count    = db.prepare('SELECT COUNT(*) as n FROM plots').get().n;
  const yields_pending = db.prepare("SELECT COUNT(*) as n FROM yield_registry WHERE status='pending'").get().n;
  const yields_matched = db.prepare("SELECT COUNT(*) as n FROM yield_registry WHERE status='matched'").get().n;
  const total_qty_kg   = db.prepare("SELECT COALESCE(SUM(confirmed_qty_kg),0) as n FROM yield_registry WHERE status IN ('confirmed','matched','delivered')").get().n;
  const buyers_count   = db.prepare('SELECT COUNT(*) as n FROM buyers WHERE is_verified=1').get().n;
  const payments_total = db.prepare("SELECT COALESCE(SUM(amount_ksh),0) as n FROM payments WHERE status='released'").get().n;
  res.json({
    farmers_count, plots_count, yields_pending, yields_matched,
    total_qty_kg: parseFloat(total_qty_kg),
    buyers_count,
    payments_total_ksh: parseFloat(payments_total),
    note: 'Sample pilot data — not live operational figures'
  });
});

// GET /api/dashboard/farmer/:farmerId — farmer-specific dashboard
router.get('/farmer/:farmerId', authMiddleware, (req, res) => {
  const db = getDb();
  const { farmerId } = req.params;
  const farmer = db.prepare('SELECT * FROM farmers WHERE id=?').get(farmerId);
  if (!farmer) return res.status(404).json({ error: 'Farmer not found' });

  const plots    = db.prepare('SELECT * FROM plots WHERE farmer_id=?').all(farmerId);
  const yields   = db.prepare('SELECT * FROM yield_registry WHERE farmer_id=? ORDER BY created_at DESC LIMIT 10').all(farmerId);
  const alerts   = db.prepare('SELECT * FROM alerts WHERE farmer_id=? ORDER BY created_at DESC LIMIT 5').all(farmerId);
  const forecast = db.prepare('SELECT * FROM forecasts WHERE county=? AND date >= date("now") ORDER BY date LIMIT 7').all(farmer.county);
  const payments = db.prepare(`
    SELECT p.* FROM payments p
    JOIN logistics l ON p.logistics_id=l.id
    JOIN matches m ON l.match_id=m.id
    JOIN yield_registry y ON m.yield_id=y.id
    WHERE y.farmer_id=? ORDER BY p.created_at DESC LIMIT 5
  `).all(farmerId);

  res.json({ farmer, plots, yields, alerts, forecast, payments });
});

// GET /api/dashboard/buyer/:buyerId
router.get('/buyer/:buyerId', authMiddleware, (req, res) => {
  const db = getDb();
  const buyer   = db.prepare('SELECT * FROM buyers WHERE id=?').get(req.params.buyerId);
  const matches = db.prepare(`
    SELECT m.*, y.crop, y.county, y.grade, y.harvest_date, f.full_name as farmer_name
    FROM matches m JOIN yield_registry y ON m.yield_id=y.id JOIN farmers f ON y.farmer_id=f.id
    WHERE m.buyer_id=? ORDER BY m.matched_at DESC
  `).all(req.params.buyerId);
  const logistics_active = db.prepare(`
    SELECT l.* FROM logistics l JOIN matches m ON l.match_id=m.id
    WHERE m.buyer_id=? AND l.status IN ('booked','in_transit')
  `).all(req.params.buyerId);
  res.json({ buyer, matches, logistics_active });
});

module.exports = router;
