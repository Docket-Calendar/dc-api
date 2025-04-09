const { environment } = require('../config/server');

/**
 * Error handling middleware
 */

// 404 Not Found middleware
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Default to 500 Internal Server Error if status code is not set
  const statusCode = err.statusCode || 500;
  
  // Prepare error response
  const errorResponse = {
    success: false,
    error: statusCode === 500 && process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' // Generic message in production for 500 errors
      : err.message,
    status: statusCode
  };

  // Add stack trace in development, but not in production
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    errorResponse.stack = err.stack;
  }

  // Log the error for server-side debugging
  console.error(`[${new Date().toISOString()}] ${statusCode} - ${err.message}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Send the error response
  res.status(statusCode).json(errorResponse);
};

module.exports = {
  notFound,
  errorHandler
}; 