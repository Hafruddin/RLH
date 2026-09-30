// backend/middlewares/errorHandler.js
// Centralized error handler — never leaks stack traces in production.

export function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  console.error(`[ERROR] ${req.method} ${req.path}`, err.message);

  return res.status(status).json({
    success: false,
    errorCode: err.code || "INTERNAL_ERROR",
    message: isProduction
      ? status === 500
        ? "An internal server error occurred."
        : err.message
      : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
}

/**
 * Wrap async route handlers to forward thrown errors to errorHandler.
 * Usage: router.get("/path", asyncHandler(myController))
 */
export function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
