const rateLimit = require('express-rate-limit');

/**
 * Generic factory — lets you create a limiter with custom options
 * while keeping sane defaults.
 */
const createLimiter = (options) =>
  rateLimit({
    standardHeaders: true,   // Return rate-limit info in RateLimit-* headers
    legacyHeaders: false,    // Disable the old X-RateLimit-* headers
    skip: () => process.env.NODE_ENV === 'test', // don't throttle the test suite
    handler: (req, res) => {
      res.status(429).json({
        message: 'Too many requests, please try again later.',
        retryAfter: Math.ceil(options.windowMs / 1000 / 60), // minutes
      });
    },
    ...options,
  });

/**
 * Auth limiter — strict.
 * Prevents brute-force on /api/auth/login and /api/auth/register.
 * 10 attempts per 15 minutes per IP.
 */
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many auth attempts, please try again after 15 minutes.',
});

/**
 * Task limiter — moderate.
 * Protects task CRUD endpoints from abuse.
 * 100 requests per 15 minutes per IP.
 */
const taskLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

/**
 * Global limiter — light catch-all applied to all routes.
 * Provides a baseline layer of protection.
 * 300 requests per 15 minutes per IP.
 */
const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
});

module.exports = { authLimiter, taskLimiter, globalLimiter };
