const express = require('express');
const router = express.Router();

const {
  createPortfolio,
  getPortfolio,
  updatePortfolio,
  deletePortfolio,
} = require('../controllers/portfolio.controller');
const { validatePortfolio } = require('../middleware/validate');
const { createPortfolioLimiter } = require('../middleware/rateLimit');

router.post  ('/',      createPortfolioLimiter, validatePortfolio, createPortfolio);
router.get   ('/:code', getPortfolio);
router.put   ('/:code', validatePortfolio, updatePortfolio);
router.delete('/:code', deletePortfolio);

module.exports = router;
