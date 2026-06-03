// Redis is mocked so importing the app (which pulls in the task controller)
// doesn't require a live Redis connection.
jest.mock('../src/config/redis', () => ({
  connectRedis: jest.fn(),
  getRedisClient: () => ({ lPush: jest.fn().mockResolvedValue(1) }),
}));

const request = require('supertest');
const app = require('../src/app');

describe('Auth routes', () => {
  const valid = { name: 'Ada', email: 'ada@example.com', password: 'secret123' };

  describe('POST /api/auth/register', () => {
    it('registers a new user and returns a token', async () => {
      const res = await request(app).post('/api/auth/register').send(valid);
      expect(res.status).toBe(201);
      expect(res.body.token).toBeTruthy();
      expect(res.body.user).toMatchObject({ name: 'Ada', email: 'ada@example.com' });
      expect(res.body.user.password).toBeUndefined();
    });

    it('rejects invalid email with 400', async () => {
      const res = await request(app).post('/api/auth/register').send({ ...valid, email: 'not-an-email' });
      expect(res.status).toBe(400);
    });

    it('rejects short password with 400', async () => {
      const res = await request(app).post('/api/auth/register').send({ ...valid, password: '123' });
      expect(res.status).toBe(400);
    });

    it('rejects a duplicate email with 400', async () => {
      await request(app).post('/api/auth/register').send(valid);
      const res = await request(app).post('/api/auth/register').send(valid);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/exists/i);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(valid);
    });

    it('logs in with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: valid.email, password: valid.password });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
    });

    it('rejects wrong password with 401', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: valid.email, password: 'wrongpass' });
      expect(res.status).toBe(401);
    });

    it('rejects missing fields with 400', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: valid.email });
      expect(res.status).toBe(400);
    });
  });
});
