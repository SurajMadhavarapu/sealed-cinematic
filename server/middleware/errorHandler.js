const { logApiError } = require('../utils/securityLogger');

// Global error handler
const errorHandler = (err, req, res, next) => {
  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Postgres errors
  if (err.code === '23505') {
    // Unique violation
    statusCode = 400;
    message = 'Duplicate entry - this record already exists';
  }

  if (err.code === '23503') {
    // Foreign key violation
    statusCode = 400;
    message = 'Related record not found';
  }

  if (err.code === '22P02') {
    // Invalid input syntax
    statusCode = 400;
    message = 'Invalid input format';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired - please login again';
  }

  logApiError(err, req, statusCode);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
