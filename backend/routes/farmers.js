// ─── Farmer Routes ───────────────────────────────────────────────
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/connection');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();

// GET /api/farmers — admin only
router.get('/', authMiddleware, requireRole('admin'), (req, res) => {
  const db = getDb();
  const { county, verified, page = 1, limit = 20 } = req.query;
  let q = 'SELECT f.*, u.phone, u.email FROM farmers f JOIN users u ON f.user_id=u.id WHERE 1=1';
  const params = [];
  if (county) { q += ' AND f.county=?'; params.push(county); }
  if (verified !== undefined) { q += ' AND f.is_verified=?'; params.push(verified === 'true' ? 1 : 0); }
  q += ` LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), (parseInt(page)-1)*parseInt(limit));
  const rows = db.prepare(q).all(...params);
  const total = db.prepare('SELECT COUNT(*) as n FROM farmers').get().n;
  res.json({ farmers: rows, total, page: parseInt(page), limit: parseInt(limit) });
});

// GET /api/farmers/:id
router.get('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const farmer = db.prepare('SELECT f.*,u.phone,u.email FROM farmers f JOIN users u ON f.user_id=u.id WHERE f.id=?').get(req.params.id);
  if (!farmer) return res.status(404).json({ error: 'Farmer not found' });
  const plots = db.prepare('SELECT * FROM plots WHERE farmer_id=?').all(req.params.id);
  res.json({ farmer, plots });
});

// POST /api/farmers — create farmer profile
router.post('/', authMiddleware, (req, res) => {
  const db = getDb();
  const { full_name, national_id, county, sub_county, ward, latitude, longitude, farm_size_ha, primary_crop, lang_pref='sw' } = req.body;
  if (!full_name || !county) return res.status(400).json({ error: 'full_name and county required' });
  const id = uuidv4();
  db.prepare(`INSERT INTO farmers (id,user_id,full_name,national_id,county,sub_county,ward,latitude,longitude,farm_size_ha,primary_crop,lang_pref)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(id,req.user.id,full_name,national_id||null,county,sub_county||null,ward||null,latitude||null,longitude||null,farm_size_ha||null,primary_crop||null,lang_pref);
  res.status(201).json({ id, message: 'Farmer profile created' });
});

// PUT /api/farmers/:id
router.put('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const { full_name, county, sub_county, farm_size_ha, primary_crop, lang_pref } = req.body;
  db.prepare(`UPDATE farmers SET full_name=COALESCE(?,full_name), county=COALESCE(?,county),
              sub_county=COALESCE(?,sub_county), farm_size_ha=COALESCE(?,farm_size_ha),
              primary_crop=COALESCE(?,primary_crop), lang_pref=COALESCE(?,lang_pref)
              WHERE id=?`).run(full_name,county,sub_county,farm_size_ha,primary_crop,lang_pref,req.params.id);
  res.json({ message: 'Farmer updated' });
});

// GET /api/farmers/:id/plots
router.get('/:id/plots', authMiddleware, (req, res) => {
  const db = getDb();
  const plots = db.prepare('SELECT * FROM plots WHERE farmer_id=? ORDER BY created_at').all(req.params.id);
  res.json({ plots });
});

// POST /api/farmers/:id/plots
router.post('/:id/plots', authMiddleware, (req, res) => {
  const db = getDb();
  const { name, area_ha, crop, latitude, longitude, soil_type } = req.body;
  if (!name) return res.status(400).json({ error: 'Plot name required' });
  const id = uuidv4();
  db.prepare('INSERT INTO plots (id,farmer_id,name,area_ha,crop,latitude,longitude,soil_type) VALUES (?,?,?,?,?,?,?,?)')
    .run(id,req.params.id,name,area_ha||null,crop||null,latitude||null,longitude||null,soil_type||null);
  res.status(201).json({ id, message: 'Plot created' });
});

module.exports = router;
