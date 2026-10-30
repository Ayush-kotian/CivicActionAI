export function errorHandler(err, req, res, next) {
  console.error('[Server Error]', err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate key error in database entry.'
    });
  }

  if (err.message && err.message.includes('Invalid file format')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'An internal operational error occurred. Please try again later.'
      : err.message
  });
}
