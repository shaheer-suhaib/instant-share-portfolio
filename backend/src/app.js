const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { globalLimiter } = require('./middleware/rateLimit');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const portfolioRoutes = require('./routes/portfolio.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

// ── Global rate limit ────────────────────────────────────────────────────────
app.use(globalLimiter);

// ── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/upload', uploadRoutes);

// ── 404 + global error handler ───────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
