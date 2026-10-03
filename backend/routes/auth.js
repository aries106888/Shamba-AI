// ─── Auth Routes ────────────────────────────────────────────────
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'shambapoint-dev-secret-change-in-prod';
const JWT_EXPIRES = '7d';

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { phone, email, password, role = 'farmer' } = req.body;
  if (!phone || !password) return res.status(400).json({ error: 'Phone and password required' });
  if (!['farmer','buyer'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE phone=?').get(phone);
  if (existing) return res.status(409).json({ error: 'Phone already registered' });

  const id = uuidv4();
  const hashed = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (id,email,phone,password,role) VALUES (?,?,?,?,?)').run(id, email||null, phone, hashed, role);

  const token = jwt.sign({ id, phone, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.status(201).json({ token, user: { id, phone, email, role } });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: 'Phone and password required' });

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE phone=?').get(phone);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid phone or password' });
  }

  const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ token, user: { id: user.id, phone: user.phone, email: user.email, role: user.role } });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id,email,phone,role,created_at FROM users WHERE id=?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

module.exports = router;
