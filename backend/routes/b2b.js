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

router.post('/submit', (req, res) => {
  const { companyName, contactName, waNumber, orderQty, customReq } = req.body;
  if (!companyName || !contactName || !waNumber || !orderQty) {
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  }
  const qty = parseInt(orderQty);
  if (qty < 50) {
    return res.status(400).json({ error: 'Minimum pemesanan adalah 50 unit' });
  }
  const db = getDb();
  db.run(
    'INSERT INTO b2b_inquiries (company_name, contact_name, wa_number, order_qty, custom_req) VALUES (?, ?, ?, ?, ?)',
    [companyName, contactName, waNumber, qty, customReq || '']
  );
  saveDb();

  const inserted = rowToObj(db, 'SELECT * FROM b2b_inquiries ORDER BY id DESC LIMIT 1');
  res.json({
    success: true,
    message: `Terima kasih ${companyName}! Permintaan penawaran Anda telah kami terima. Tim COPLA akan segera menghubungi Anda.`,
    id: inserted ? inserted.id : null
  });
});

router.get('/inquiries', (req, res) => {
  const db = getDb();
  const inquiries = allRowsToObj(db, 'SELECT * FROM b2b_inquiries ORDER BY created_at DESC');
  res.json(inquiries);
});

router.patch('/inquiries/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['pending', 'contacted', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status tidak valid' });
  }
  const db = getDb();
  db.run('UPDATE b2b_inquiries SET status = ? WHERE id = ?', [status, id]);
  saveDb();
  res.json({ success: true });
});

module.exports = router;
