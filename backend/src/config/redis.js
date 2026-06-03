const { createClient } = require('redis');

let client;

const connectRedis = async () => {
  client = createClient({ url: process.env.REDIS_URL });
  client.on('error', (err) => console.error('Redis Error:', err));
  await client.connect();
  console.log('✅ Redis Connected');
  return client;
};

const getRedisClient = () => client;

module.exports = { connectRedis, getRedisClient };