require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const connectDB = require('./config/db');
const seedAdmin = require('./utils/seedAdmin');

const authRoutes = require('./routes/authRoutes');
const staffRoutes = require('./routes/staffRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const salesRoutes = require('./routes/salesRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

app.use(helmet());
app.use(express.json());

// Allow the deployed Vercel frontend (and any other origins listed in FRONTEND_URL)
// FRONTEND_URL can be a comma-separated list, e.g.:
//   https://ndelies.vercel.app,http://localhost:5500
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests (curl, mobile apps)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, '');
      const isAllowed =
        allowedOrigins.length === 0 ||
        allowedOrigins.some(o => o.replace(/\/$/, '') === cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.startsWith('http://localhost:') ||
        cleanOrigin.startsWith('http://127.0.0.1:') ||
        cleanOrigin === 'http://localhost' ||
        cleanOrigin === 'http://127.0.0.1';

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true
  })
);

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: "N'delie's Enterprise API" });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => seedAdmin())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

      // ── Keep-alive ping ──────────────────────────────────────────────────
      // Render's free tier spins down after 15 min of inactivity.
      // Ping our own /api/health every 14 min to stay awake.
      const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
      const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

      if (process.env.NODE_ENV === 'production') {
        setInterval(() => {
          const url = `${SELF_URL}/api/health`;
          const client = url.startsWith('https') ? require('https') : require('http');
          client.get(url, (res) => {
            console.log(`[keep-alive] ping → ${url} | status: ${res.statusCode}`);
          }).on('error', (err) => {
            console.warn(`[keep-alive] ping failed: ${err.message}`);
          });
        }, PING_INTERVAL_MS);

        console.log(`[keep-alive] Self-ping scheduled every 14 min → ${SELF_URL}/api/health`);
      }
      // ─────────────────────────────────────────────────────────────────────
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });

