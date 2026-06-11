const pino = require('pino');

// Single shared structured logger. Silent during tests to keep output clean;
// level is configurable via LOG_LEVEL (defaults to info).
const logger = pino({
  level: process.env.NODE_ENV === 'test' ? 'silent' : (process.env.LOG_LEVEL || 'info'),
});

module.exports = logger;
