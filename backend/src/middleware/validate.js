const validatePortfolio = (req, res, next) => {
  const { name, template_id } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res
      .status(400)
      .json({ success: false, error: '"name" is required and must be at least 2 characters' });
  }

  if (![1, 2, 3].includes(Number(template_id))) {
    return res
      .status(400)
      .json({ success: false, error: '"template_id" must be 1, 2, or 3' });
  }

  next();
};

module.exports = { validatePortfolio };
