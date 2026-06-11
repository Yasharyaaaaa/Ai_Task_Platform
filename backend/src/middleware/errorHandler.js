const logger = require('../config/logger');

// Centralized error handler — must be mounted LAST in the middleware chain.
// Controllers forward errors here via next(err). An optional err.status sets
// the HTTP code; anything >= 500 is logged and returned with a generic message
// so internals are never leaked to clients.
const errorHandler = (err, req, res, next) => {
  // Mongoose schema validation (e.g. enum / required) → 400
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }
  // Malformed ObjectId in a route param → 400
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}` });
  }

  const status = err.status || err.statusCode || 500;
  if (status >= 500) {
    // Prefer the per-request child logger (carries the request id) when present.
    (req.log || logger).error({ err }, 'Unhandled error');
  }

  res.status(status).json({
    message: status >= 500 ? 'Internal server error' : err.message,
  });
};

module.exports = errorHandler;
