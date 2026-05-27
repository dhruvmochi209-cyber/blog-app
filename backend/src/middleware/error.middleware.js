/**
 * Global Error Handler Middleware
 *
 * Must be registered as the LAST middleware in app.js with exactly
 * four parameters (err, req, res, next) — Express identifies it as
 * an error handler by its arity.
 *
 * Handles:
 *  - Mongoose validation errors     → 400
 *  - Mongoose duplicate key errors  → 409
 *  - Mongoose cast errors           → 400 (invalid ObjectId)
 *  - JWT errors                     → 401
 *  - Custom AppError instances      → status from error
 *  - Everything else                → 500
 */

// ─── Custom Application Error ─────────────────────────────────────────────────

/**
 * Use AppError to throw structured errors from controllers.
 *
 * Example:
 *   throw new AppError('Post not found', 404);
 *   throw new AppError('Email already in use', 409);
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Flag to distinguish app errors from crashes
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Global Error Handler ─────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = null;

  // ── Mongoose: Validation errors ────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ── Mongoose: Duplicate key (unique constraint) ────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue?.[field];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' is already in use.`;
  }

  // ── Mongoose: Invalid ObjectId / cast error ────────────────────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: '${err.value}' is not a valid ID.`;
  }

  // ── JWT errors ─────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired.';
  }

  // ── Log non-operational (unexpected) errors in development ─────────────────
  if (!err.isOperational && process.env.NODE_ENV !== 'production') {
    console.error('💥 Unexpected Error:', err);
  }

  // ── Send response ──────────────────────────────────────────────────────────
  const response = {
    success: false,
    message,
  };

  if (errors) response.errors = errors;

  // Only expose stack traces in development
  if (process.env.NODE_ENV === 'development' && !err.isOperational) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
