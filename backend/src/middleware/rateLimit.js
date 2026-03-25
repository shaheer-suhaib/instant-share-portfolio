const rateLimit = require('express-rate-limit');

const fmt = (msg) => ({ success: false, error: msg });

// Applied globally to every route
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: fmt('Too many requests. Please slow down.'),
});

// Applied only to POST /api/portfolio (creating portfolios)
const createPortfolioLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: fmt('Portfolio creation limit reached. Try again in 1 hour.'),
});

// Applied only to upload endpoints
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: fmt('Upload limit reached. Try again in 15 minutes.'),
});

module.exports = { globalLimiter, createPortfolioLimiter, uploadLimiter };
