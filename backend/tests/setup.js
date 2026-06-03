// Global Jest setup: spin up an in-memory MongoDB so tests run without an
// external database, and provide a JWT secret. Redis is mocked per test file.
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

let mongod;

beforeAll(async () => {
  // First run downloads the mongod binary, which can be slow.
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}, 120000);

afterEach(async () => {
  // Clear all collections between tests for isolation.
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});
