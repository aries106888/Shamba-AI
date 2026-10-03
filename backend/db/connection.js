// db/connection.js — Pure WebAssembly SQLite (no native compilation required)
// Uses node-sqlite3-wasm — works on any Node.js version, any OS, no build tools.
'use strict';

const { Database } = require('node-sqlite3-wasm');
const path = require('path');
const fs   = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'shambapoint.db');

// Ensure directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

let _db = null;

function getDb() {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  // Performance pragmas
  _db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA synchronous = NORMAL;
    PRAGMA cache_size = 5000;
  `);
  console.log(`✅  SQLite (WASM) connected → ${DB_PATH}`);
  return _db;
}

module.exports = { getDb };
