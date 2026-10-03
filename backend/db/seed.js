// ═══════════════════════════════════════════════════════════════════
// Seed Data — ShambaPoint Climate
// Realistic Kenya sample data for development / demo
// ═══════════════════════════════════════════════════════════════════
require('dotenv').config();
const { Database } = require('node-sqlite3-wasm');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'shambapoint.db');
const db = new Database(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');

console.log('🌱 Seeding ShambaPoint Climate database...\n');

const now = new Date().toISOString();
const hash = (pw) => bcrypt.hashSync(pw, 10);

// ─── Users ────────────────────────────────────────────────────────
const users = [
  { id: uuidv4(), email: 'wanjiru@example.co.ke', phone: '+254711000001', password: hash('farmer123'), role: 'farmer' },
  { id: uuidv4(), email: 'kipchoge@example.co.ke', phone: '+254722000002', password: hash('farmer123'), role: 'farmer' },
  { id: uuidv4(), email: 'amina@example.co.ke',   phone: '+254733000003', password: hash('farmer123'), role: 'farmer' },
  { id: uuidv4(), email: 'buyer@naivas.co.ke',     phone: '+254700100001', password: hash('buyer123'),  role: 'buyer'  },
  { id: uuidv4(), email: 'buyer@carrefour.co.ke',  phone: '+254700100002', password: hash('buyer123'),  role: 'buyer'  },
  { id: uuidv4(), email: 'admin@shambapoint.co.ke',phone: '+254700000000', password: hash('admin123'),  role: 'admin'  },
];
const insUser = db.prepare(`INSERT OR IGNORE INTO users (id,email,phone,password,role,created_at,updated_at) VALUES (?,?,?,?,?,?,?)`);
users.forEach(u => insUser.run(u.id, u.email, u.phone, u.password, u.role, now, now));
console.log('  ✓ Users seeded:', users.length);

// ─── Farmers ──────────────────────────────────────────────────────
const farmers = [
  { id: uuidv4(), user_id: users[0].id, full_name: 'Wanjiru Kamau',    national_id: '12345678', county: 'Kirinyaga',   sub_county: 'Mwea',         latitude: -0.625,  longitude: 37.38,  farm_size_ha: 2.5, primary_crop: 'Rice',     is_verified: 1, lang_pref: 'sw' },
  { id: uuidv4(), user_id: users[1].id, full_name: 'Kipchoge Bett',    national_id: '23456789', county: 'Kericho',     sub_county: 'Kericho East', latitude: -0.37,   longitude: 35.28,  farm_size_ha: 4.0, primary_crop: 'Tea',      is_verified: 1, lang_pref: 'sw' },
  { id: uuidv4(), user_id: users[2].id, full_name: 'Amina Osman',      national_id: '34567890', county: 'Garissa',     sub_county: 'Garissa',      latitude: -0.455,  longitude: 39.646, farm_size_ha: 1.2, primary_crop: 'Tomatoes', is_verified: 1, lang_pref: 'sw' },
];
const insFarmer = db.prepare(`INSERT OR IGNORE INTO farmers (id,user_id,full_name,national_id,county,sub_county,latitude,longitude,farm_size_ha,primary_crop,is_verified,lang_pref,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
farmers.forEach(f => insFarmer.run(f.id,f.user_id,f.full_name,f.national_id,f.county,f.sub_county,f.latitude,f.longitude,f.farm_size_ha,f.primary_crop,f.is_verified,f.lang_pref,now));
console.log('  ✓ Farmers seeded:', farmers.length);

// ─── Plots ────────────────────────────────────────────────────────
const plots = [
  { id: uuidv4(), farmer_id: farmers[0].id, name: 'Plot A1', area_ha: 1.2, crop: 'Maize',   latitude: -0.63, longitude: 37.38, soil_type: 'Loam',  ndvi_score: 0.72, health: 'good' },
  { id: uuidv4(), farmer_id: farmers[0].id, name: 'Plot A2', area_ha: 1.3, crop: 'Beans',   latitude: -0.62, longitude: 37.40, soil_type: 'Clay',  ndvi_score: 0.58, health: 'fair' },
  { id: uuidv4(), farmer_id: farmers[1].id, name: 'Tea Block 1', area_ha: 2.0, crop: 'Tea', latitude: -0.37, longitude: 35.28, soil_type: 'Loam',  ndvi_score: 0.85, health: 'excellent' },
  { id: uuidv4(), farmer_id: farmers[2].id, name: 'Main Field', area_ha: 1.2, crop: 'Tomatoes', latitude: -0.46, longitude: 39.65, soil_type: 'Sandy', ndvi_score: 0.44, health: 'fair' },
];
const insPlot = db.prepare(`INSERT OR IGNORE INTO plots (id,farmer_id,name,area_ha,crop,latitude,longitude,soil_type,ndvi_score,health,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
plots.forEach(p => insPlot.run(p.id,p.farmer_id,p.name,p.area_ha,p.crop,p.latitude,p.longitude,p.soil_type,p.ndvi_score,p.health,now));
console.log('  ✓ Plots seeded:', plots.length);

// ─── Forecasts (7-day for major counties) ─────────────────────────
const counties = ['Nairobi','Nakuru','Kericho','Kirinyaga','Meru','Nyeri','Garissa','Kisumu','Uasin Gishu','Machakos','Kitui','Mombasa'];
const risks = ['low','low','moderate','moderate','high','critical'];
const insForecast = db.prepare(`INSERT OR IGNORE INTO forecasts (id,county,date,min_temp_c,max_temp_c,rainfall_mm,humidity_pct,wind_kmh,rain_chance_pct,dry_spell_risk,risk_score,soil_moisture,forecast_note,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
counties.forEach(county => {
  for (let d = 0; d < 7; d++) {
    const date = new Date(Date.now() + d * 86400000).toISOString().split('T')[0];
    const risk = risks[Math.floor(Math.random() * risks.length)];
    const riskScore = { low: Math.floor(Math.random()*25+5), moderate: Math.floor(Math.random()*25+30), high: Math.floor(Math.random()*25+55), critical: Math.floor(Math.random()*20+80) }[risk];
    insForecast.run(
      uuidv4(), county, date,
      +(15 + Math.random()*8).toFixed(1), +(24 + Math.random()*10).toFixed(1),
      +(Math.random()*15).toFixed(1), +(50 + Math.random()*35).toFixed(0),
      +(8 + Math.random()*20).toFixed(0), +(Math.random()*70).toFixed(0),
      risk, riskScore, +(40 + Math.random()*50).toFixed(1),
      `${county} 7-day forecast — uncertainty ±15%`, now
    );
  }
});
console.log('  ✓ Forecasts seeded:', counties.length * 7, 'records');

// ─── Yield Registry ───────────────────────────────────────────────
const yields = [
  { id: uuidv4(), farmer_id: farmers[0].id, plot_id: plots[0].id, crop: 'Maize',    variety: 'DH04', expected_qty_kg: 3200, confirmed_qty_kg: 2900, harvest_date: '2026-11-15', county: 'Kirinyaga', grade: 'A',  price_ksh_kg: 38,  status: 'confirmed' },
  { id: uuidv4(), farmer_id: farmers[1].id, plot_id: plots[2].id, crop: 'Tea',      variety: 'TRFK', expected_qty_kg: 5000, confirmed_qty_kg: null, harvest_date: '2026-12-01', county: 'Kericho',   grade: 'A',  price_ksh_kg: 220, status: 'pending'   },
  { id: uuidv4(), farmer_id: farmers[2].id, plot_id: plots[3].id, crop: 'Tomatoes', variety: 'Anna F1', expected_qty_kg: 1800, confirmed_qty_kg: 1600, harvest_date: '2026-10-20', county: 'Garissa',   grade: 'B',  price_ksh_kg: 75,  status: 'matched'   },
];
const insYield = db.prepare(`INSERT OR IGNORE INTO yield_registry (id,farmer_id,plot_id,crop,variety,expected_qty_kg,confirmed_qty_kg,harvest_date,county,grade,price_ksh_kg,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
yields.forEach(y => insYield.run(y.id,y.farmer_id,y.plot_id,y.crop,y.variety,y.expected_qty_kg,y.confirmed_qty_kg||null,y.harvest_date,y.county,y.grade,y.price_ksh_kg,y.status,now));
console.log('  ✓ Yields seeded:', yields.length);

// ─── Buyers ───────────────────────────────────────────────────────
const buyers = [
  { id: uuidv4(), user_id: users[3].id, org_name: 'Naivas Supermarkets Ltd',   contact_name: 'James Njoroge', email: 'buyer@naivas.co.ke',    phone: '+254700100001', buyer_type: 'supermarket', is_verified: 1 },
  { id: uuidv4(), user_id: users[4].id, org_name: 'Carrefour Kenya',            contact_name: 'Fatuma Said',  email: 'buyer@carrefour.co.ke', phone: '+254700100002', buyer_type: 'supermarket', is_verified: 1 },
];
const insBuyer = db.prepare(`INSERT OR IGNORE INTO buyers (id,user_id,org_name,contact_name,email,phone,buyer_type,is_verified,created_at) VALUES (?,?,?,?,?,?,?,?,?)`);
buyers.forEach(b => insBuyer.run(b.id,b.user_id,b.org_name,b.contact_name,b.email,b.phone,b.buyer_type,b.is_verified,now));
console.log('  ✓ Buyers seeded:', buyers.length);

// ─── Match ────────────────────────────────────────────────────────
const match1Id = uuidv4();
db.prepare(`INSERT OR IGNORE INTO matches (id,yield_id,buyer_id,qty_kg,agreed_price,status,matched_at) VALUES (?,?,?,?,?,?,?)`).run(match1Id, yields[0].id, buyers[0].id, 2000, 40, 'accepted', now);

// ─── Logistics ────────────────────────────────────────────────────
const log1Id = uuidv4();
db.prepare(`INSERT OR IGNORE INTO logistics (id,match_id,pickup_county,delivery_county,pickup_date,driver_name,driver_phone,truck_reg,distance_km,cost_ksh,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(log1Id, match1Id, 'Kirinyaga', 'Nairobi', '2026-11-18', 'Peter Mwangi', '+254722555888', 'KCB 123X', 142, 12500, 'booked', now);

// ─── Alerts ───────────────────────────────────────────────────────
const alerts = [
  { id: uuidv4(), farmer_id: farmers[0].id, county: 'Kirinyaga', type: 'drought', channel: 'sms', lang: 'sw', message_sw: 'SHAMBAPOINT: Tahadhari — ukame unatarajiwa kwa siku 5 zijazo. Mwagilia mazao sasa.', message_en: 'SHAMBAPOINT: Warning — dry spell expected for 5 days. Irrigate now.', status: 'sent' },
  { id: uuidv4(), farmer_id: farmers[1].id, county: 'Kericho',   type: 'rain',   channel: 'whatsapp', lang: 'sw', message_sw: 'Habari! Mvua inatarajiwa Alhamisi. Subiri kumwagilia hadi Ijumaa.', message_en: 'Good news! Rain expected Thursday. Hold irrigation until Friday.', status: 'sent' },
  { id: uuidv4(), farmer_id: farmers[2].id, county: 'Garissa',   type: 'market', channel: 'sms', lang: 'sw', message_sw: 'Mnunuzi amepatikana kwa nyanya zako — KSh 75/kg. Thibitisha kupitia *483*12#.', message_en: 'Buyer found for your tomatoes — KSh 75/kg. Confirm via *483*12#.', status: 'sent' },
];
const insAlert = db.prepare(`INSERT OR IGNORE INTO alerts (id,farmer_id,county,type,channel,lang,message_sw,message_en,sent_at,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
alerts.forEach(a => insAlert.run(a.id,a.farmer_id,a.county,a.type,a.channel,a.lang,a.message_sw,a.message_en,now,a.status,now));
console.log('  ✓ Alerts seeded:', alerts.length);

// ─── Pilot Applications ───────────────────────────────────────────
const pilots = [
  { id: uuidv4(), type: 'farmer', full_name: 'Daniel Otieno', phone: '+254744001122', county: 'Kisumu',   crop: 'Rice',    status: 'pending' },
  { id: uuidv4(), type: 'buyer',  org_name: 'Jacaranda Hotel', contact_name: 'Grace Muthoni', email: 'grace@jacaranda.co.ke', buyer_type: 'hotel', status: 'pending' },
];
const insPilot = db.prepare(`INSERT OR IGNORE INTO pilot_applications (id,type,full_name,org_name,phone,email,county,crop,buyer_type,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
pilots.forEach(p => insPilot.run(p.id,p.type,p.full_name||null,p.org_name||null,p.phone||null,p.email||null,p.county||null,p.crop||null,p.buyer_type||null,p.status,now));
console.log('  ✓ Pilot applications seeded:', pilots.length);

console.log('\n✅  Database seeded successfully!\n');
db.close();
