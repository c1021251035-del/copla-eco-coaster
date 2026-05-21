const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const rawPath = process.env.DB_PATH || path.join(__dirname, 'copla.db');
const DB_PATH = path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);

let db;

function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS b2b_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      wa_number TEXT NOT NULL,
      order_qty INTEGER NOT NULL,
      custom_req TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS partnership_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cafe_name TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      wa_number TEXT NOT NULL,
      address TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS impact_calculations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      coaster_count INTEGER NOT NULL,
      coffee_grams REAL NOT NULL,
      plastic_grams REAL NOT NULL,
      carbon_kg REAL NOT NULL,
      session_id TEXT,
      created_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  saveDb();
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, buffer);
}

module.exports = { getDb, initDb, saveDb };
