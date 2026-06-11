// Hand-maintained OpenAPI 3 spec served via Swagger UI at /api/docs and as raw
// JSON at /api/openapi.json. Paths are relative to the /api server base.

const taskOperations = [
  'uppercase', 'lowercase', 'reverse', 'wordcount',
  'summarize', 'rewrite', 'translate', 'keywords', 'sentiment', 'explain', 'custom',
];

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'AI Task Platform API',
    version: '1.0.0',
    description: 'Async text-processing tasks (string ops + Claude AI) with JWT auth.',
  },
  servers: [{ url: '/api' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Task: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          inputText: { type: 'string' },
          operation: { type: 'string', enum: taskOperations },
          prompt: { type: 'string', nullable: true },
          model: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['pending', 'running', 'success', 'failed'] },
          result: { type: 'string', nullable: true },
          logs: {
            type: 'array',
            items: {
              type: 'object',
              properties: { message: { type: 'string' }, timestamp: { type: 'string', format: 'date-time' } },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: { type: 'object', properties: { message: { type: 'string' } } },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Created — returns token + user' },
          400: { description: 'Validation error or email already exists' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in and receive a JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'OK — returns token + user' },
          400: { description: 'Validation error' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'List the authenticated user\'s tasks (filter/search/paginate)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['all', 'pending', 'running', 'success', 'failed'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50 } },
        ],
        responses: { 200: { description: 'Paginated tasks + status counts' }, 401: { description: 'Unauthorized' } },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create and enqueue a task',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'inputText', 'operation'],
                properties: {
                  title: { type: 'string' },
                  inputText: { type: 'string' },
                  operation: { type: 'string', enum: taskOperations },
                  prompt: { type: 'string', description: 'Required when operation is "custom"' },
                  model: { type: 'string', enum: ['claude-haiku-4-5', 'claude-sonnet-4-6', 'claude-opus-4-8'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } } },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
          503: { description: 'Task queue unavailable' },
        },
      },
    },
    '/tasks/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Tasks'],
        summary: 'Fetch a single task',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } },
      },
      put: {
        tags: ['Tasks'],
        summary: 'Re-run a task (reset to pending and re-enqueue)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' }, 503: { description: 'Queue unavailable' } },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete a task',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Deleted' }, 404: { description: 'Not found' } },
      },
    },
  },
};
