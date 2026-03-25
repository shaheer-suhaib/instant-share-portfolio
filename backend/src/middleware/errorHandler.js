const errorHandler = (err, req, res, _next) => {
  console.error(`[error] ${new Date().toISOString()} ${req.method} ${req.path}`, err.message);

  // multer file-type / size errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, error: 'File too large' });
  }

  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal server error'
      : err.message;

  res.status(status).json({ success: false, error: message });
};

const notFound = (req, res) =>
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });

module.exports = { errorHandler, notFound };
