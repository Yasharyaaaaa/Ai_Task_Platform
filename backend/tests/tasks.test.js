// Shared Redis mock; mockLPush lets us assert the task was enqueued.
const mockLPush = jest.fn().mockResolvedValue(1);
jest.mock('../src/config/redis', () => ({
  connectRedis: jest.fn(),
  getRedisClient: () => ({ lPush: mockLPush }),
}));

const request = require('supertest');
const app = require('../src/app');

async function registerUser(email = 'owner@example.com') {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Owner', email, password: 'secret123' });
  return res.body.token;
}

const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe('Task routes', () => {
  let token;
  beforeEach(async () => {
    mockLPush.mockClear();
    token = await registerUser();
  });

  describe('POST /api/tasks', () => {
    it('requires authentication', async () => {
      const res = await request(app).post('/api/tasks').send({ title: 'x', inputText: 'y', operation: 'uppercase' });
      expect(res.status).toBe(401);
    });

    it('creates a task and enqueues it', async () => {
      const res = await request(app)
        .post('/api/tasks').set(auth(token))
        .send({ title: 'Greet', inputText: 'hello', operation: 'uppercase' });
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('pending');
      expect(mockLPush).toHaveBeenCalledTimes(1);
    });

    it('rejects a missing title with 400', async () => {
      const res = await request(app)
        .post('/api/tasks').set(auth(token))
        .send({ inputText: 'hello', operation: 'uppercase' });
      expect(res.status).toBe(400);
    });

    it('rejects an invalid operation with 400', async () => {
      const res = await request(app)
        .post('/api/tasks').set(auth(token))
        .send({ title: 'x', inputText: 'y', operation: 'bogus' });
      expect(res.status).toBe(400);
    });

    it('rejects a custom operation with no prompt', async () => {
      const res = await request(app)
        .post('/api/tasks').set(auth(token))
        .send({ title: 'x', inputText: 'y', operation: 'custom' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      await request(app).post('/api/tasks').set(auth(token)).send({ title: 'A', inputText: 'one', operation: 'uppercase' });
      await request(app).post('/api/tasks').set(auth(token)).send({ title: 'B', inputText: 'two', operation: 'reverse' });
    });

    it('returns paginated results with counts', async () => {
      const res = await request(app).get('/api/tasks').set(auth(token));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.tasks)).toBe(true);
      expect(res.body.total).toBe(2);
      expect(res.body.counts.total).toBe(2);
      expect(res.body.counts.pending).toBe(2);
    });

    it('filters by search term', async () => {
      const res = await request(app).get('/api/tasks?search=one').set(auth(token));
      expect(res.body.tasks).toHaveLength(1);
      expect(res.body.tasks[0].title).toBe('A');
    });

    it('respects the limit query param', async () => {
      const res = await request(app).get('/api/tasks?limit=1').set(auth(token));
      expect(res.body.tasks).toHaveLength(1);
      expect(res.body.pages).toBe(2);
    });
  });

  describe('GET/PUT/DELETE /api/tasks/:id', () => {
    let taskId;
    beforeEach(async () => {
      const res = await request(app).post('/api/tasks').set(auth(token)).send({ title: 'A', inputText: 'one', operation: 'uppercase' });
      taskId = res.body._id;
    });

    it('fetches a task by id', async () => {
      const res = await request(app).get(`/api/tasks/${taskId}`).set(auth(token));
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('A');
    });

    it('does not leak another user\'s task', async () => {
      const otherToken = await registerUser('intruder@example.com');
      const res = await request(app).get(`/api/tasks/${taskId}`).set(auth(otherToken));
      expect(res.status).toBe(404);
    });

    it('re-runs a task (resets to pending, re-enqueues)', async () => {
      mockLPush.mockClear();
      const res = await request(app).put(`/api/tasks/${taskId}`).set(auth(token));
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('pending');
      expect(res.body.result).toBeNull();
      expect(mockLPush).toHaveBeenCalledTimes(1);
    });

    it('deletes a task', async () => {
      const del = await request(app).delete(`/api/tasks/${taskId}`).set(auth(token));
      expect(del.status).toBe(200);
      const get = await request(app).get(`/api/tasks/${taskId}`).set(auth(token));
      expect(get.status).toBe(404);
    });
  });
});
