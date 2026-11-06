import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../src/app.js';
import { connectMongo, disconnectMongo } from '../../src/shared/db/mongo.js';

describe('Health Check Endpoint (NFR-10, Task 5)', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await connectMongo(uri, 'datavalo_test');
  });

  afterAll(async () => {
    await disconnectMongo();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it('GET /api/health returns 200 with status up when database is connected', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      data: {
        status: 'up',
      },
    });
  });

  it('returns 404 for unknown routes using standard error envelope', async () => {
    const res = await request(app).get('/api/unknown-route');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      ok: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Cannot GET /api/unknown-route',
      },
    });
  });
});

