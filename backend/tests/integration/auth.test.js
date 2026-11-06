import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../src/app.js';
import { connectMongo, disconnectMongo } from '../../src/shared/db/mongo.js';
import { createAdmin } from '../../src/modules/auth/index.js';

let mongod;
const ADMIN_EMAIL = 'admin@datavalosystem.com';
const ADMIN_PASSWORD = 'CorrectPassword123!';

describe('Auth Module Integration Tests (Task 1, Acceptance Criteria)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectMongo(mongod.getUri(), 'datavalo_test_auth');
    await createAdmin({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  });

  afterAll(async () => {
    await disconnectMongo();
    if (mongod) await mongod.stop();
  });

  describe('POST /api/admin/auth/login', () => {
    it('returns generic error on wrong password', async () => {
      const res = await request(app)
        .post('/api/admin/auth/login')
        .send({ email: ADMIN_EMAIL, password: 'WrongPassword999!' });

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.message).toBe('Invalid email or password.');
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns the EXACT same generic error on unknown email (timing defense)', async () => {
      const res = await request(app)
        .post('/api/admin/auth/login')
        .send({ email: 'unknown@datavalosystem.com', password: 'WrongPassword999!' });

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.message).toBe('Invalid email or password.');
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('enforces rate limiting: 6th failed login from same IP returns 429', async () => {
      const testIp = '198.51.100.42';

      // 5 failed attempts
      for (let i = 0; i < 5; i++) {
        const res = await request(app)
          .post('/api/admin/auth/login')
          .set('X-Forwarded-For', testIp)
          .send({ email: ADMIN_EMAIL, password: 'BadPassword!' });
        expect(res.status).toBe(401);
      }

      // 6th attempt should be blocked
      const blockedRes = await request(app)
        .post('/api/admin/auth/login')
        .set('X-Forwarded-For', testIp)
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

      expect(blockedRes.status).toBe(429);
      expect(blockedRes.body.ok).toBe(false);
      expect(blockedRes.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('logs in successfully and returns dv_admin httpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/admin/auth/login')
        .set('X-Forwarded-For', '203.0.113.10') // Fresh IP
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.email).toBe(ADMIN_EMAIL);
      expect(res.body.data.id).toBeDefined();

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const adminCookie = cookies.find((c) => c.startsWith('dv_admin='));
      expect(adminCookie).toBeDefined();
      expect(adminCookie).toContain('HttpOnly');
      expect(adminCookie).toContain('Path=/');
      expect(adminCookie).toContain('SameSite=Lax');
    });
  });

  describe('Protected Admin Routes Session Verification', () => {
    let sessionCookie;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/admin/auth/login')
        .set('X-Forwarded-For', '203.0.113.20')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      sessionCookie = res.headers['set-cookie'].find((c) => c.startsWith('dv_admin='));
    });

    it('rejects GET /api/admin/auth/me without cookie', async () => {
      const res = await request(app).get('/api/admin/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
    });

    it('rejects GET /api/admin/auth/me with tampered cookie', async () => {
      const res = await request(app)
        .get('/api/admin/auth/me')
        .set('Cookie', ['dv_admin=invalid.tampered.token']);
      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
    });

    it('allows GET /api/admin/auth/me with valid session cookie', async () => {
      const res = await request(app)
        .get('/api/admin/auth/me')
        .set('Cookie', [sessionCookie]);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.email).toBe(ADMIN_EMAIL);
    });

    it('allows POST /api/admin/auth/logout with valid cookie and clears it', async () => {
      const res = await request(app)
        .post('/api/admin/auth/logout')
        .set('Cookie', [sessionCookie]);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);

      const cookies = res.headers['set-cookie'];
      const cleared = cookies.find((c) => c.startsWith('dv_admin=;'));
      expect(cleared).toBeDefined();
    });
  });
});
