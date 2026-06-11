// Redis mocked with a working ping so the readiness probe reports it as up.
jest.mock('../src/config/redis', () => ({
  connectRedis: jest.fn(),
  getRedisClient: () => ({
    lPush: jest.fn().mockResolvedValue(1),
    ping: jest.fn().mockResolvedValue('PONG'),
  }),
}));

const request = require('supertest');
const app = require('../src/app');

describe('Health & docs', () => {
  it('GET /health returns ok (liveness)', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /health/ready reports Mongo + Redis up', async () => {
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.mongo).toBe(true);
    expect(res.body.redis).toBe(true);
  });

  it('GET /api/openapi.json serves a valid spec', async () => {
    const res = await request(app).get('/api/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBeTruthy();
    expect(res.body.paths['/auth/login']).toBeDefined();
    expect(res.body.paths['/tasks']).toBeDefined();
  });
});
