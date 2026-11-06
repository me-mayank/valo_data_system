import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../src/app.js';
import { connectMongo, disconnectMongo } from '../../src/shared/db/mongo.js';
import { createAdmin } from '../../src/modules/auth/index.js';

let mongod;
let adminCookie;
const ADMIN_EMAIL = 'admin-settings@datavalosystem.com';
const ADMIN_PASSWORD = 'CorrectPassword123!';

describe('Settings Module Integration Tests (Task 4, Acceptance Criteria)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectMongo(mongod.getUri(), 'datavalo_test_settings');
    await createAdmin({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    const loginRes = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    adminCookie = loginRes.headers['set-cookie'].find((c) => c.startsWith('dv_admin='));
  });

  afterAll(async () => {
    await disconnectMongo();
    if (mongod) await mongod.stop();
  });

  describe('Public Settings Endpoint', () => {
    it('GET /api/public/settings returns only public popup and contact fields', async () => {
      const res = await request(app).get('/api/public/settings');

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);

      const data = res.body.data;
      expect(data.popupEnabled).toBeDefined();
      expect(data.popupDelaySeconds).toBe(8);
      expect(data.popupScrollPercent).toBe(40);
      expect(data.popupReappearSeconds).toBe(120);
      expect(data.popupMaxDismissals).toBe(5);
      expect(data.contactEmail).toBeDefined();
      expect(data.contactPhone).toBeDefined();

      // Ensure no internal DB fields leaked
      expect(data._id).toBeUndefined();
      expect(data.__v).toBeUndefined();
      expect(data.key).toBeUndefined();
    });
  });

  describe('Admin Settings Endpoints', () => {
    it('GET /api/admin/settings returns full settings singleton', async () => {
      const res = await request(app)
        .get('/api/admin/settings')
        .set('Cookie', [adminCookie]);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.key).toBe('main');
      expect(res.body.data.popupEnabled).toBe(true);
    });

    it('PUT /api/admin/settings rejects out-of-range parameters', async () => {
      const res = await request(app)
        .put('/api/admin/settings')
        .set('Cookie', [adminCookie])
        .send({
          popupDelaySeconds: 999, // Max allowed is 120
        });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.fields?.popupDelaySeconds).toBeDefined();
    });

    it('PUT /api/admin/settings updates settings and persists changes', async () => {
      const res = await request(app)
        .put('/api/admin/settings')
        .set('Cookie', [adminCookie])
        .send({
          popupDelaySeconds: 15,
          popupScrollPercent: 50,
          contactEmail: 'contact@datavalosystem.com',
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.popupDelaySeconds).toBe(15);
      expect(res.body.data.popupScrollPercent).toBe(50);
      expect(res.body.data.contactEmail).toBe('contact@datavalosystem.com');

      // Verify public endpoint reflects updated settings
      const pubRes = await request(app).get('/api/public/settings');
      expect(pubRes.body.data.popupDelaySeconds).toBe(15);
      expect(pubRes.body.data.contactEmail).toBe('contact@datavalosystem.com');
    });
  });
});
