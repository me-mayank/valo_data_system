import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../src/app.js';
import { connectMongo, disconnectMongo } from '../../src/shared/db/mongo.js';
import { CampusRequest } from '../../src/modules/campus-requests/index.js';
import { RateLimitEvent } from '../../src/shared/rate-limit/rate-limit-event.model.js';
import { eventBus } from '../../src/shared/events/event-bus.js';

let mongod;

describe('Campus Requests Module Integration Tests (Phase 7 Acceptance Criteria)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectMongo(mongod.getUri(), 'datavalo_test_campus');
  });

  afterAll(async () => {
    await disconnectMongo();
    if (mongod) {
      await mongod.stop();
    }
  });

  beforeEach(async () => {
    await CampusRequest.deleteMany({});
    await RateLimitEvent.deleteMany({});
  });

  describe('POST /api/public/campus-requests', () => {
    it('creates a new campus request with consent, consentAt, and emits campus-request.created', async () => {
      let eventPayload = null;
      eventBus.on('campus-request.created', (payload) => {
        eventPayload = payload;
      });

      const res = await request(app)
        .post('/api/public/campus-requests')
        .set('Origin', 'http://localhost:3000')
        .send({
          institution: 'IIT (BHU) Varanasi',
          contactPerson: 'Dr. S. K. Singh',
          designation: 'Head of Training & Placement Cell',
          email: 'tpo@iitbhu.ac.in',
          phone: '9876543210',
          approxStudents: 150,
          preferredFormat: 'on-campus',
          message: 'Interested in a 2-day hands-on ServiceNow workshop for CSE 3rd years.',
          consent: true,
          source: 'campus-drive',
          pagePath: '/colleges',
          deviceType: 'desktop',
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);

      const saved = await CampusRequest.findOne({ email: 'tpo@iitbhu.ac.in' });
      expect(saved).not.toBeNull();
      expect(saved.institution).toBe('IIT (BHU) Varanasi');
      expect(saved.contactPerson).toBe('Dr. S. K. Singh');
      expect(saved.designation).toBe('Head of Training & Placement Cell');
      expect(saved.phone).toBe('9876543210');
      expect(saved.consent).toBe(true);
      expect(saved.consentAt).toBeInstanceOf(Date);
      expect(saved.source).toBe('campus-drive');

      // Verify no raw IP stored
      const rawDoc = saved.toObject();
      expect(rawDoc.ip).toBeUndefined();
      expect(rawDoc.clientIp).toBeUndefined();

      // Verify event was emitted
      expect(eventPayload).not.toBeNull();
      expect(eventPayload.institution).toBe('IIT (BHU) Varanasi');
    });

    it('silently drops honeypot submission: returns 200 { ok: true } and stores nothing', async () => {
      const res = await request(app)
        .post('/api/public/campus-requests')
        .set('Origin', 'http://localhost:3000')
        .send({
          institution: 'Fake College Bot',
          contactPerson: 'Bot Admin',
          designation: 'Bot',
          email: 'bot@college.edu',
          phone: '9876543210',
          consent: true,
          _hp: 'automated_spam_bot_fill',
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);

      const count = await CampusRequest.countDocuments();
      expect(count).toBe(0);
    });

    it('rejects submission when consent is false (400)', async () => {
      const res = await request(app)
        .post('/api/public/campus-requests')
        .set('Origin', 'http://localhost:3000')
        .send({
          institution: 'NIT Trichy',
          contactPerson: 'Prof. R. Kumar',
          designation: 'TPO Coordinator',
          email: 'tpo@nitt.edu',
          phone: '9876543210',
          consent: false,
        });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);

      const count = await CampusRequest.countDocuments();
      expect(count).toBe(0);
    });

    it('enforces rate limit: 11th request from same IP returns 429', async () => {
      const fixedIp = '198.51.100.55';

      for (let i = 1; i <= 10; i++) {
        const res = await request(app)
          .post('/api/public/campus-requests')
          .set('Origin', 'http://localhost:3000')
          .set('X-Forwarded-For', fixedIp)
          .send({
            institution: `Test College ${i}`,
            contactPerson: `Coordinator ${i}`,
            designation: 'TPO',
            email: `tpo${i}@college.edu`,
            phone: `98765432${i.toString().padStart(2, '0')}`,
            consent: true,
          });

        expect(res.status).toBe(200);
      }

      const res11 = await request(app)
        .post('/api/public/campus-requests')
        .set('Origin', 'http://localhost:3000')
        .set('X-Forwarded-For', fixedIp)
        .send({
          institution: 'Test College 11',
          contactPerson: 'Coordinator 11',
          designation: 'TPO',
          email: 'tpo11@college.edu',
          phone: '9876543299',
          consent: true,
        });

      expect(res11.status).toBe(429);
      expect(res11.body.ok).toBe(false);
      expect(res11.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });
});
