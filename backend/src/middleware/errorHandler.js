const ApiError = require('../utils/ApiError');

// 404 for unmatched routes.
function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Central error handler. Normalizes Mongoose/JWT errors into a consistent JSON shape.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // Mongoose bad ObjectId cast
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for '${err.path}'`;
  }

  // Duplicate key (unique index)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for '${field}'`;
  }

  if (statusCode >= 500) console.error(err);

  res.status(statusCode).json({ success: false, error: message });
}

module.exports = { notFound, errorHandler };
