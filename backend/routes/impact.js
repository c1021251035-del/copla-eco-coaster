const express = require('express');
const router = express.Router();
const { getDb, saveDb } = require('../db/database');

router.post('/calculate', (req, res) => {
  const { count, sessionId } = req.body;
  const num = parseInt(count);
  if (!num || num < 1) {
    return res.status(400).json({ error: 'Jumlah coaster harus minimal 1' });
  }

  const COFFEE_GRAMS = 70;
  const PLASTIC_GRAMS = 80;
  const CARBON_KG = 0.596;

  const result = {
    count: num,
    coffeeGrams: num * COFFEE_GRAMS,
    plasticGrams: num * PLASTIC_GRAMS,
    carbonKg: parseFloat((num * CARBON_KG).toFixed(1))
  };

  const db = getDb();
  db.run(
    'INSERT INTO impact_calculations (coaster_count, coffee_grams, plastic_grams, carbon_kg, session_id) VALUES (?, ?, ?, ?, ?)',
    [num, result.coffeeGrams, result.plasticGrams, result.carbonKg, sessionId || null]
  );
  saveDb();
  res.json(result);
});

router.get('/history', (req, res) => {
  const db = getDb();
  const result = db.exec('SELECT * FROM impact_calculations ORDER BY created_at DESC LIMIT 100');
  if (!result.length) return res.json([]);
  const cols = result[0].columns;
  const rows = result[0].values.map(vals => {
    const obj = {};
    cols.forEach((c, i) => obj[c] = vals[i]);
    return obj;
  });
  res.json(rows);
});

module.exports = router;
