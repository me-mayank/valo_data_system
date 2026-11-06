import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../src/app.js';
import { connectMongo, disconnectMongo } from '../../src/shared/db/mongo.js';
import { createAdmin } from '../../src/modules/auth/index.js';
import { env } from '../../src/config/env.js';
import { generateSignature, uploadsService } from '../../src/modules/uploads/uploads.service.js';

let mongod;
let adminCookie;
const ADMIN_EMAIL = 'admin-uploads@datavalosystem.com';
const ADMIN_PASSWORD = 'CorrectPassword123!';

describe('Uploads Module Integration Tests (Task 3, Acceptance Criteria)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectMongo(mongod.getUri(), 'datavalo_test_uploads');
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

  it('POST /api/admin/uploads/sign returns 501 when Cloudinary is unconfigured', async () => {
    // Cloudinary credentials are not set in test environment by default
    const res = await request(app)
      .post('/api/admin/uploads/sign')
      .set('Cookie', [adminCookie]);

    expect(res.status).toBe(501);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe('NOT_IMPLEMENTED');
    expect(res.body.error.message).toContain('Image upload service is not configured');
  });

  it('generates valid Cloudinary signature when credentials exist', async () => {
    // Temporarily supply mock credentials to verify signature generation logic
    const origCloud = env.CLOUDINARY_CLOUD_NAME;
    const origKey = env.CLOUDINARY_API_KEY;
    const origSecret = env.CLOUDINARY_API_SECRET;

    env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    env.CLOUDINARY_API_KEY = 'test-key-123';
    env.CLOUDINARY_API_SECRET = 'test-secret-456';

    try {
      const res = await request(app)
        .post('/api/admin/uploads/sign')
        .set('Cookie', [adminCookie]);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.cloudName).toBe('test-cloud');
      expect(res.body.data.apiKey).toBe('test-key-123');
      expect(res.body.data.folder).toBe('datavalo/courses');
      expect(res.body.data.signature).toBeDefined();
      expect(res.body.data.allowedFormats).toEqual(['jpg', 'png', 'webp']);
      expect(res.body.data.maxFileSize).toBe(2 * 1024 * 1024);
    } finally {
      env.CLOUDINARY_CLOUD_NAME = origCloud;
      env.CLOUDINARY_API_KEY = origKey;
      env.CLOUDINARY_API_SECRET = origSecret;
    }
  });

  it('verifies deterministic parameter hashing in generateSignature', () => {
    const params = { folder: 'datavalo/courses', timestamp: 1700000000 };
    const secret = 'my-sample-secret';
    const sig1 = generateSignature(params, secret);
    const sig2 = generateSignature(params, secret);

    expect(sig1).toBe(sig2);
    expect(typeof sig1).toBe('string');
    expect(sig1.length).toBe(40); // SHA-1 is 40 hex chars
  });

  it('safe image deletion does not throw when unconfigured or invalid', async () => {
    await expect(uploadsService.deleteImage('non-existent-public-id')).resolves.not.toThrow();
    await expect(uploadsService.deleteImage(null)).resolves.not.toThrow();
  });
});
