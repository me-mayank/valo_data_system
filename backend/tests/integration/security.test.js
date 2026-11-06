import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../src/app.js';
import { connectMongo, disconnectMongo } from '../../src/shared/db/mongo.js';
import { hashIp } from '../../src/shared/utils/hash-ip.js';
import { checkRateLimit } from '../../src/shared/rate-limit/rate-limit.service.js';

describe('Security & Protection Quality Gates (NFR-05)', () => {
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

  it('rejects request with $-prefixed keys with 400 INVALID_OPERATOR_KEYS', async () => {
    const res = await request(app)
      .post('/api/health') // any route through app pipeline
      .send({ '$gt': '' });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe('INVALID_OPERATOR_KEYS');
  });

  it('rejects request with dotted keys with 400 INVALID_OPERATOR_KEYS', async () => {
    const res = await request(app)
      .post('/api/health')
      .send({ 'nested.key': 'attack' });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe('INVALID_OPERATOR_KEYS');
  });

  it('rejects state-changing request from foreign Origin with 403 FORBIDDEN_ORIGIN', async () => {
    const res = await request(app)
      .post('/api/health')
      .set('Origin', 'http://malicious-site.com')
      .send({ validKey: 'value' });

    expect(res.status).toBe(403);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN_ORIGIN');
  });

  it('allows state-changing request when Origin matches FRONTEND_ORIGIN', async () => {
    const res = await request(app)
      .post('/api/health')
      .set('Origin', 'http://localhost:3000')
      .send({ validKey: 'value' });

    // Reaches route handler (returns 404 since /api/health only has GET, but origin passes)
    expect(res.status).toBe(404);
  });

  it('hashes IP address with HMAC-SHA256 and never produces raw IP', () => {
    const ip = '192.168.1.100';
    const hash = hashIp(ip, 'test_secret_32_characters_minimum_!');

    expect(hash).toHaveLength(64);
    expect(hash).not.toContain(ip);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('rate limit service records events and enforces maximum request thresholds', async () => {
    const ipHash = hashIp('10.0.0.1', 'test_secret_32_characters_minimum_!');
    const route = '/api/public/leads';

    // 2 allowed requests
    const res1 = await checkRateLimit({ ipHash, route, maxRequests: 2, windowMs: 60000 });
    expect(res1.allowed).toBe(true);

    const res2 = await checkRateLimit({ ipHash, route, maxRequests: 2, windowMs: 60000 });
    expect(res2.allowed).toBe(true);

    // 3rd request exceeds limit -> throws RateLimitError (429)
    await expect(
      checkRateLimit({ ipHash, route, maxRequests: 2, windowMs: 60000 })
    ).rejects.toThrowError();
  });
});

