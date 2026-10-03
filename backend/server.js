// ═══════════════════════════════════════════════════════════════════
// ShambaPoint Climate — Backend API Server
// Express + SQLite | REST API for Kenya Agri-Logistics Platform
// ═══════════════════════════════════════════════════════════════════
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Routes
const authRoutes = require('./routes/auth');
const farmerRoutes = require('./routes/farmers');
const yieldRoutes = require('./routes/yields');
const buyerRoutes = require('./routes/buyers');
const forecastRoutes = require('./routes/forecasts');
const alertRoutes = require('./routes/alerts');
const logisticsRoutes = require('./routes/logistics');
const marketplaceRoutes = require('./routes/marketplace');
const dashboardRoutes = require('./routes/dashboard');
const pilotRoutes     = require('./routes/alerts_pilot');
const aiRoutes        = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// ─── Health check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ShambaPoint Climate API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/yields', yieldRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/forecasts', forecastRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pilot',    pilotRoutes);
app.use('/api/ai',       aiRoutes);

// ─── 404 handler ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global error handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Start server ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌿 ShambaPoint Climate API running on http://localhost:${PORT}`);
  console.log(`   Env: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   DB:  ${process.env.DB_PATH || './db/shambapoint.db'}\n`);
});

module.exports = app;
