require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { initDb, saveDb } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Terlalu banyak permintaan, silakan coba lagi nanti' }
});
app.use('/api/', limiter);

function basicAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).json({ error: 'Autentikasi diperlukan' });
  }
  const base64 = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');
  if (username !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASS) {
    return res.status(403).json({ error: 'Username atau password salah' });
  }
  next();
}

app.use('/api/b2b', require('./routes/b2b'));
app.use('/api/partnership', require('./routes/partnership'));
app.use('/api/impact', require('./routes/impact'));

app.get('/api/admin/stats', basicAuth, (req, res) => {
  const db = require('./db/database').getDb();
  const b2bCount = db.exec('SELECT COUNT(*) as count FROM b2b_inquiries')[0]?.values[0][0] || 0;
  const partnerCount = db.exec('SELECT COUNT(*) as count FROM partnership_registrations')[0]?.values[0][0] || 0;
  const calcCount = db.exec('SELECT COUNT(*) as count FROM impact_calculations')[0]?.values[0][0] || 0;
  const pendingB2b = db.exec("SELECT COUNT(*) as count FROM b2b_inquiries WHERE status='pending'")[0]?.values[0][0] || 0;
  const pendingPartner = db.exec("SELECT COUNT(*) as count FROM partnership_registrations WHERE status='pending'")[0]?.values[0][0] || 0;
  res.json({
    totalB2b: b2bCount,
    totalPartners: partnerCount,
    totalCalculations: calcCount,
    pendingB2b: pendingB2b,
    pendingPartners: pendingPartner
  });
});

app.use('/admin', basicAuth, express.static(path.join(__dirname, 'public', 'admin')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});

initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`COPLA Backend running on http://localhost:${PORT}`);
    console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
  });
});
