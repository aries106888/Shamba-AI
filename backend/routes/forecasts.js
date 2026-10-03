// ─── Forecast Routes ────────────────────────────────────────────
const express = require('express');
const { getDb } = require('../db/connection');
const router = express.Router();

// GET /api/forecasts?county=Nairobi&days=7
router.get('/', (req, res) => {
  const db = getDb();
  const { county, days = 7 } = req.query;
  let query = 'SELECT * FROM forecasts WHERE date >= date("now") ORDER BY county, date LIMIT ?';
  let params = [parseInt(days) * 47]; // all counties
  if (county) {
    query = 'SELECT * FROM forecasts WHERE county=? AND date >= date("now") ORDER BY date LIMIT ?';
    params = [county, parseInt(days)];
  }
  const rows = db.prepare(query).all(...params);
  res.json({ forecasts: rows });
});

// GET /api/forecasts/county/:county
router.get('/county/:county', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM forecasts WHERE county=? AND date >= date("now") ORDER BY date').all(req.params.county);
  if (!rows.length) return res.status(404).json({ error: 'No forecast found for this county' });
  res.json({ county: req.params.county, forecasts: rows });
});

// GET /api/forecasts/risk-map — county-level risk summary for map overlay
router.get('/risk-map', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT county,
           ROUND(AVG(risk_score),0) AS avg_risk,
           MIN(risk_score) AS min_risk,
           MAX(risk_score) AS max_risk,
           AVG(rainfall_mm) AS avg_rain,
           AVG(soil_moisture) AS avg_soil_moisture,
           (SELECT dry_spell_risk FROM forecasts f2 WHERE f2.county=f.county AND date >= date("now") ORDER BY date LIMIT 1) AS current_risk_level
    FROM forecasts f
    WHERE date >= date("now") AND date <= date("now","+7 days")
    GROUP BY county
  `).all();
  res.json({ riskMap: rows });
});

// GET /api/forecasts/today — today's summary for all counties
router.get('/today', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM forecasts WHERE date = date("now") ORDER BY county`).all();
  res.json({ date: new Date().toISOString().split('T')[0], forecasts: rows });
});

module.exports = router;
