import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../src/app.js';
import { connectMongo, disconnectMongo } from '../../src/shared/db/mongo.js';
import { Course } from '../../src/modules/courses/index.js';
import { Lead } from '../../src/modules/leads/index.js';
import { RateLimitEvent } from '../../src/shared/rate-limit/rate-limit-event.model.js';
import { eventBus } from '../../src/shared/events/event-bus.js';

let mongod;
let publishedCourse1;
let publishedCourse2;
let draftCourse;

describe('Leads Module Integration Tests (Phase 7 Acceptance Criteria)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectMongo(mongod.getUri(), 'datavalo_test_leads');

    publishedCourse1 = await Course.create({
      title: 'ServiceNow Fundamentals',
      slug: 'servicenow-fundamentals',
      shortDescription: 'Core platform workflows.',
      status: 'published',
      sortOrder: 1,
    });

    publishedCourse2 = await Course.create({
      title: 'Jira Software & Agile',
      slug: 'jira-agile',
      shortDescription: 'Enterprise issue tracking.',
      status: 'published',
      sortOrder: 2,
    });

    draftCourse = await Course.create({
      title: 'Unpublished Internal Workshop',
      slug: 'unpublished-internal',
      shortDescription: 'Draft only.',
      status: 'draft',
      sortOrder: 3,
    });
  });

  afterAll(async () => {
    await disconnectMongo();
    if (mongod) {
      await mongod.stop();
    }
  });

  beforeEach(async () => {
    await Lead.deleteMany({});
    await RateLimitEvent.deleteMany({});
  });

  describe('POST /api/public/leads', () => {
    it('creates a new lead with consent, consentAt, and emits lead.created', async () => {
      let eventPayload = null;
      eventBus.on('lead.created', (payload) => {
        eventPayload = payload;
      });

      const res = await request(app)
        .post('/api/public/leads')
        .set('Origin', 'http://localhost:3000')
        .send({
          fullName: 'Aarav Sharma',
          phone: '9876543210',
          email: 'aarav@iitbhu.ac.in',
          college: 'IIT (BHU) Varanasi',
          courseYear: 'B.Tech CSE, 3rd year',
          interestedCourseIds: [publishedCourse1._id.toString()],
          consent: true,
          source: 'iit-bhu',
          pagePath: '/courses/servicenow-fundamentals',
          deviceType: 'desktop',
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);

      const saved = await Lead.findOne({ email: 'aarav@iitbhu.ac.in' });
      expect(saved).not.toBeNull();
      expect(saved.fullName).toBe('Aarav Sharma');
      expect(saved.phone).toBe('9876543210');
      expect(saved.consent).toBe(true);
      expect(saved.consentAt).toBeInstanceOf(Date);
      expect(saved.source).toBe('iit-bhu');
      expect(saved.interestedCourseIds).toHaveLength(1);
      expect(saved.interestedCourseIds[0].toString()).toBe(publishedCourse1._id.toString());

      // Verify no raw IP stored
      const rawDoc = saved.toObject();
      expect(rawDoc.ip).toBeUndefined();
      expect(rawDoc.clientIp).toBeUndefined();

      // Verify event was emitted
      expect(eventPayload).not.toBeNull();
      expect(eventPayload.email).toBe('aarav@iitbhu.ac.in');
      expect(eventPayload.isUpdate).toBe(false);
    });

    it('rejects submission when consent is false or missing (400)', async () => {
      const res = await request(app)
        .post('/api/public/leads')
        .set('Origin', 'http://localhost:3000')
        .send({
          fullName: 'Pooja Verma',
          phone: '9876543211',
          email: 'pooja@college.edu',
          college: 'NIT Trichy',
          courseYear: 'B.Tech IT, 2nd year',
          interestedCourseIds: [publishedCourse1._id.toString()],
          consent: false,
        });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);

      const count = await Lead.countDocuments();
      expect(count).toBe(0);
    });

    it('rejects operator-injection payloads with 400', async () => {
      const res = await request(app)
        .post('/api/public/leads')
        .set('Origin', 'http://localhost:3000')
        .send({
          fullName: 'Malicious Attacker',
          phone: '9876543212',
          email: { $ne: null },
          college: 'Test College',
          courseYear: '4th year',
          interestedCourseIds: [publishedCourse1._id.toString()],
          consent: true,
        });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    });

    it('rejects foreign origin on state-changing POST request with 403', async () => {
      const res = await request(app)
        .post('/api/public/leads')
        .set('Origin', 'https://attacker.evil.com')
        .send({
          fullName: 'Foreign Origin Test',
          phone: '9876543213',
          email: 'foreign@test.com',
          college: 'Some College',
          courseYear: '3rd year',
          interestedCourseIds: [publishedCourse1._id.toString()],
          consent: true,
        });

      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN_ORIGIN');
    });

    it('silently drops honeypot submission: returns 200 { ok: true } and stores nothing', async () => {
      const res = await request(app)
        .post('/api/public/leads')
        .set('Origin', 'http://localhost:3000')
        .send({
          fullName: 'Bot User',
          phone: '9876543214',
          email: 'bot@spam.com',
          college: 'Bot University',
          courseYear: '1st year',
          interestedCourseIds: [publishedCourse1._id.toString()],
          consent: true,
          _hp: 'automated_spam_bot_fill',
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);

      const count = await Lead.countDocuments();
      expect(count).toBe(0);
    });

    it('rejects course IDs that are not published courses (400)', async () => {
      const res = await request(app)
        .post('/api/public/leads')
        .set('Origin', 'http://localhost:3000')
        .send({
          fullName: 'Siddharth Rao',
          phone: '9876543215',
          email: 'sid@college.edu',
          college: 'BITS Pilani',
          courseYear: '3rd year',
          interestedCourseIds: [draftCourse._id.toString()],
          consent: true,
        });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.message).toContain('published');
    });

    it('deduplicates: merges interestedCourseIds and updates optional fields when email or phone matches', async () => {
      // 1. Initial submission with course 1
      await request(app)
        .post('/api/public/leads')
        .set('Origin', 'http://localhost:3000')
        .send({
          fullName: 'Rohan Gupta',
          phone: '9876543216',
          email: 'rohan@college.edu',
          college: 'DTU',
          courseYear: '2nd year',
          interestedCourseIds: [publishedCourse1._id.toString()],
          consent: true,
        });

      expect(await Lead.countDocuments()).toBe(1);

      // 2. Second submission with same email, course 2, and new optional fields
      const res2 = await request(app)
        .post('/api/public/leads')
        .set('Origin', 'http://localhost:3000')
        .send({
          fullName: 'Rohan Gupta',
          phone: '9876543216',
          email: 'rohan@college.edu',
          college: 'DTU',
          courseYear: '2nd year',
          interestedCourseIds: [publishedCourse2._id.toString()],
          consent: true,
          city: 'New Delhi',
          preferredMode: 'Online',
          skillLevel: 'Beginner',
        });

      expect(res2.status).toBe(200);
      expect(res2.body.ok).toBe(true);

      // Still exactly 1 lead in database
      const leads = await Lead.find({});
      expect(leads).toHaveLength(1);

      const merged = leads[0];
      expect(merged.interestedCourseIds).toHaveLength(2);
      expect(merged.interestedCourseIds.map((id) => id.toString())).toContain(
        publishedCourse1._id.toString()
      );
      expect(merged.interestedCourseIds.map((id) => id.toString())).toContain(
        publishedCourse2._id.toString()
      );
      expect(merged.city).toBe('New Delhi');
      expect(merged.preferredMode).toBe('Online');
    });

    it('enforces rate limit: 11th request from same IP within an hour returns 429', async () => {
      const fixedIp = '198.51.100.42';

      // Submit 10 valid requests from fixedIp
      for (let i = 1; i <= 10; i++) {
        const res = await request(app)
          .post('/api/public/leads')
          .set('Origin', 'http://localhost:3000')
          .set('X-Forwarded-For', fixedIp)
          .send({
            fullName: `Test User ${i}`,
            phone: `98765432${i.toString().padStart(2, '0')}`,
            email: `user${i}@college.edu`,
            college: 'Test College',
            courseYear: '3rd year',
            interestedCourseIds: [publishedCourse1._id.toString()],
            consent: true,
          });

        expect(res.status).toBe(200);
      }

      // 11th request from same IP
      const res11 = await request(app)
        .post('/api/public/leads')
        .set('Origin', 'http://localhost:3000')
        .set('X-Forwarded-For', fixedIp)
        .send({
          fullName: 'Test User 11',
          phone: '9876543299',
          email: 'user11@college.edu',
          college: 'Test College',
          courseYear: '3rd year',
          interestedCourseIds: [publishedCourse1._id.toString()],
          consent: true,
        });

      expect(res11.status).toBe(429);
      expect(res11.body.ok).toBe(false);
      expect(res11.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });
});
