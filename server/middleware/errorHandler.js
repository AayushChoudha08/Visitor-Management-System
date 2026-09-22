/**
 * Centralized Express Error Handling Middleware.
 * Emits uniform JSON error responses to the frontend.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  
  // Log server-side for observability without leaking internals to client
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);
  if (statusCode === 500 && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    errors: err.errors || null
  });
}

module.exports = errorHandler;
