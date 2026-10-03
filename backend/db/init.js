// ═══════════════════════════════════════════════════════════════════
// Database Initialisation — SQLite schema for ShambaPoint Climate
// ═══════════════════════════════════════════════════════════════════
const { Database } = require('node-sqlite3-wasm');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'shambapoint.db');

// Ensure directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for concurrency
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

// ─── Schema ───────────────────────────────────────────────────────
db.exec(`

-- Users (shared authentication table)
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE,
  phone       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  role        TEXT NOT NULL CHECK(role IN ('farmer','buyer','admin')),
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- Farmers
CREATE TABLE IF NOT EXISTS farmers (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  national_id   TEXT UNIQUE,
  county        TEXT NOT NULL,
  sub_county    TEXT,
  ward          TEXT,
  latitude      REAL,
  longitude     REAL,
  farm_size_ha  REAL,
  primary_crop  TEXT,
  is_verified   INTEGER DEFAULT 0,
  lang_pref     TEXT DEFAULT 'sw' CHECK(lang_pref IN ('sw','en')),
  created_at    TEXT DEFAULT (datetime('now'))
);

-- Farm Plots
CREATE TABLE IF NOT EXISTS plots (
  id          TEXT PRIMARY KEY,
  farmer_id   TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  area_ha     REAL,
  crop        TEXT,
  latitude    REAL,
  longitude   REAL,
  soil_type   TEXT,
  ndvi_score  REAL,
  health      TEXT CHECK(health IN ('excellent','good','fair','poor')),
  created_at  TEXT DEFAULT (datetime('now'))
);

-- Climate Forecasts (micro-level per county)
CREATE TABLE IF NOT EXISTS forecasts (
  id              TEXT PRIMARY KEY,
  county          TEXT NOT NULL,
  date            TEXT NOT NULL,
  min_temp_c      REAL,
  max_temp_c      REAL,
  rainfall_mm     REAL,
  humidity_pct    REAL,
  wind_kmh        REAL,
  rain_chance_pct REAL,
  dry_spell_risk  TEXT CHECK(dry_spell_risk IN ('low','moderate','high','critical')),
  risk_score      INTEGER CHECK(risk_score BETWEEN 0 AND 100),
  soil_moisture   REAL,
  forecast_note   TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);

-- Irrigation Schedules
CREATE TABLE IF NOT EXISTS irrigation_schedules (
  id              TEXT PRIMARY KEY,
  plot_id         TEXT NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
  scheduled_date  TEXT NOT NULL,
  water_liters    REAL,
  duration_min    INTEGER,
  method          TEXT,
  status          TEXT DEFAULT 'pending' CHECK(status IN ('pending','done','skipped')),
  ai_reason       TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);

-- Yield Registry
CREATE TABLE IF NOT EXISTS yield_registry (
  id                TEXT PRIMARY KEY,
  farmer_id         TEXT NOT NULL REFERENCES farmers(id),
  plot_id           TEXT REFERENCES plots(id),
  crop              TEXT NOT NULL,
  variety           TEXT,
  expected_qty_kg   REAL NOT NULL,
  confirmed_qty_kg  REAL,
  harvest_date      TEXT,
  county            TEXT NOT NULL,
  grade             TEXT CHECK(grade IN ('AA','A','B','C')),
  price_ksh_kg      REAL,
  status            TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','matched','delivered')),
  created_at        TEXT DEFAULT (datetime('now'))
);

-- Buyers
CREATE TABLE IF NOT EXISTS buyers (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_name      TEXT NOT NULL,
  contact_name  TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  buyer_type    TEXT CHECK(buyer_type IN ('supermarket','hotel','processor','exporter','wholesaler','other')),
  is_verified   INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now'))
);

-- Buyer Produce Interests
CREATE TABLE IF NOT EXISTS buyer_interests (
  id         TEXT PRIMARY KEY,
  buyer_id   TEXT NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  crop       TEXT NOT NULL,
  min_qty_kg REAL,
  max_price  REAL,
  county_pref TEXT
);

-- Yield–Buyer Matches
CREATE TABLE IF NOT EXISTS matches (
  id           TEXT PRIMARY KEY,
  yield_id     TEXT NOT NULL REFERENCES yield_registry(id),
  buyer_id     TEXT NOT NULL REFERENCES buyers(id),
  qty_kg       REAL NOT NULL,
  agreed_price REAL,
  status       TEXT DEFAULT 'proposed' CHECK(status IN ('proposed','accepted','rejected','fulfilled')),
  matched_at   TEXT DEFAULT (datetime('now'))
);

-- Logistics Bookings
CREATE TABLE IF NOT EXISTS logistics (
  id              TEXT PRIMARY KEY,
  match_id        TEXT NOT NULL REFERENCES matches(id),
  pickup_county   TEXT,
  delivery_county TEXT,
  pickup_date     TEXT,
  driver_name     TEXT,
  driver_phone    TEXT,
  truck_reg       TEXT,
  distance_km     REAL,
  cost_ksh        REAL,
  status          TEXT DEFAULT 'booked' CHECK(status IN ('booked','in_transit','delivered','cancelled')),
  delivery_proof  TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);

-- M-Pesa Payments
CREATE TABLE IF NOT EXISTS payments (
  id              TEXT PRIMARY KEY,
  logistics_id    TEXT NOT NULL REFERENCES logistics(id),
  match_id        TEXT REFERENCES matches(id),
  payer_phone     TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  amount_ksh      REAL NOT NULL,
  mpesa_ref       TEXT,
  status          TEXT DEFAULT 'pending' CHECK(status IN ('pending','held','released','failed','refunded')),
  held_at         TEXT,
  released_at     TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id          TEXT PRIMARY KEY,
  farmer_id   TEXT REFERENCES farmers(id),
  county      TEXT,
  type        TEXT CHECK(type IN ('drought','rain','frost','pest','market','payment')),
  channel     TEXT CHECK(channel IN ('sms','ussd','whatsapp','push')),
  lang        TEXT DEFAULT 'sw',
  message_sw  TEXT,
  message_en  TEXT,
  sent_at     TEXT,
  status      TEXT DEFAULT 'queued' CHECK(status IN ('queued','sent','failed')),
  created_at  TEXT DEFAULT (datetime('now'))
);

-- Pilot Applications
CREATE TABLE IF NOT EXISTS pilot_applications (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL CHECK(type IN ('farmer','buyer')),
  full_name   TEXT,
  org_name    TEXT,
  phone       TEXT,
  email       TEXT,
  county      TEXT,
  crop        TEXT,
  buyer_type  TEXT,
  produce     TEXT,
  status      TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','waitlisted','rejected')),
  created_at  TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_forecasts_county_date ON forecasts(county, date);
CREATE INDEX IF NOT EXISTS idx_yield_farmer ON yield_registry(farmer_id);
CREATE INDEX IF NOT EXISTS idx_yield_status ON yield_registry(status);
CREATE INDEX IF NOT EXISTS idx_matches_buyer ON matches(buyer_id);
CREATE INDEX IF NOT EXISTS idx_alerts_farmer ON alerts(farmer_id);
CREATE INDEX IF NOT EXISTS idx_logistics_match ON logistics(match_id);
`);

console.log('✅  Database schema initialised at', DB_PATH);
db.close();
