const express = require('express');
const router = express.Router();
const { getDb, saveDb } = require('../db/database');

function rowToObj(db, sql) {
  const result = db.exec(sql);
  if (!result.length || !result[0].values.length) return null;
  const cols = result[0].columns;
  const vals = result[0].values[0];
  const obj = {};
  cols.forEach((c, i) => obj[c] = vals[i]);
  return obj;
}

function allRowsToObj(db, sql) {
  const result = db.exec(sql);
  if (!result.length) return [];
  const cols = result[0].columns;
  return result[0].values.map(vals => {
    const obj = {};
    cols.forEach((c, i) => obj[c] = vals[i]);
    return obj;
  });
}

router.post('/register', (req, res) => {
  const { cafeName, ownerName, waNumber, address } = req.body;
  if (!cafeName || !ownerName || !waNumber) {
    return res.status(400).json({ error: 'Nama kafe, nama pemilik, dan nomor WA wajib diisi' });
  }
  const db = getDb();
  db.run(
    'INSERT INTO partnership_registrations (cafe_name, owner_name, wa_number, address) VALUES (?, ?, ?, ?)',
    [cafeName, ownerName, waNumber, address || '']
  );
  saveDb();

  const inserted = rowToObj(db, 'SELECT * FROM partnership_registrations ORDER BY id DESC LIMIT 1');
  res.json({
    success: true,
    message: `Terima kasih ${cafeName}! Pendaftaran mitra Anda telah diterima. Tim COPLA akan menghubungi Anda dalam 1x24 jam.`,
    id: inserted ? inserted.id : null
  });
});

router.get('/registrations', (req, res) => {
  const db = getDb();
  const registrations = allRowsToObj(db, 'SELECT * FROM partnership_registrations ORDER BY created_at DESC');
  res.json(registrations);
});

router.patch('/registrations/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['pending', 'approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status tidak valid' });
  }
  const db = getDb();
  db.run('UPDATE partnership_registrations SET status = ? WHERE id = ?', [status, id]);
  saveDb();
  res.json({ success: true });
});

module.exports = router;
