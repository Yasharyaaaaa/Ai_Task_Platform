const { createClient } = require('redis');
const logger = require('./logger');

let client;

const connectRedis = async () => {
  client = createClient({ url: process.env.REDIS_URL });
  client.on('error', (err) => logger.error({ err }, 'Redis error'));
  await client.connect();
  logger.info('✅ Redis Connected');
  return client;
};

const getRedisClient = () => client;

module.exports = { connectRedis, getRedisClient };
