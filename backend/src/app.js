require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const pinoHttp = require('pino-http');
const swaggerUi = require('swagger-ui-express');
const logger = require('./config/logger');
const { authLimiter, taskLimiter, globalLimiter } = require('./middleware/rateLimiter');
const { getRedisClient } = require('./config/redis');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/errorHandler');
const openapiSpec = require('./openapi');

const app = express();

// Structured per-request logging (adds req.id + req.log)
app.use(pinoHttp({ logger }));

// Security Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Rate Limiting
app.use(globalLimiter);                 // catch-all on every route
app.use('/api/auth', authLimiter);      // strict: 10 req / 15 min
app.use('/api/tasks', taskLimiter);     // moderate: 100 req / 15 min

// API docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
app.get('/api/openapi.json', (req, res) => res.json(openapiSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Liveness: process is up
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Readiness: dependencies (Mongo + Redis) are reachable
app.get('/health/ready', async (req, res) => {
  const mongoUp = mongoose.connection.readyState === 1;
  let redisUp = false;
  try {
    const client = getRedisClient();
    if (client) {
      await client.ping();
      redisUp = true;
    }
  } catch {
    redisUp = false;
  }
  const ready = mongoUp && redisUp;
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not ready',
    mongo: mongoUp,
    redis: redisUp,
  });
});

// 404 for unmatched routes, then the centralized error handler (must be last)
app.use((req, res) => res.status(404).json({ message: 'Not found' }));
app.use(errorHandler);

module.exports = app;
