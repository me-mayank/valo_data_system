import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../src/app.js';
import { connectMongo, disconnectMongo } from '../../src/shared/db/mongo.js';
import { createAdmin } from '../../src/modules/auth/index.js';
import { Course } from '../../src/modules/courses/index.js';

let mongod;
let adminCookie;
const ADMIN_EMAIL = 'admin-courses@datavalosystem.com';
const ADMIN_PASSWORD = 'CorrectPassword123!';

describe('Courses Module Integration Tests (Task 2, Acceptance Criteria)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectMongo(mongod.getUri(), 'datavalo_test_courses');
    await createAdmin({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    const loginRes = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    adminCookie = loginRes.headers['set-cookie'].find((c) => c.startsWith('dv_admin='));

    // Create 1 draft and 2 published sample courses directly
    await Course.create([
      {
        title: 'ServiceNow ITSM Pro',
        slug: 'servicenow-itsm-pro',
        shortDescription: 'Master modern IT service management workflows.',
        category: 'ITSM',
        status: 'published',
        sortOrder: 1,
      },
      {
        title: 'Jira Project Management',
        slug: 'jira-project-management',
        shortDescription: 'Agile sprint planning and project delivery.',
        category: 'Project Management',
        status: 'published',
        sortOrder: 2,
      },
      {
        title: 'Advanced Incident Response (Draft)',
        slug: 'advanced-incident-response-draft',
        shortDescription: 'Internal draft curriculum for high-severity outages.',
        category: 'ITSM',
        status: 'draft',
        sortOrder: 3,
      },
    ]);
  });

  afterAll(async () => {
    await disconnectMongo();
    if (mongod) await mongod.stop();
  });

  describe('Public Courses Endpoints', () => {
    it('GET /api/public/courses returns only published courses (never drafts)', async () => {
      const res = await request(app).get('/api/public/courses');

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);

      const slugs = res.body.data.map((c) => c.slug);
      expect(slugs).toContain('servicenow-itsm-pro');
      expect(slugs).toContain('jira-project-management');
      expect(slugs).not.toContain('advanced-incident-response-draft');
    });

    it('GET /api/public/courses?category=ITSM filters by category', async () => {
      const res = await request(app).get('/api/public/courses?category=ITSM');

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].slug).toBe('servicenow-itsm-pro');
    });

    it('GET /api/public/courses/:slug returns 404 for draft course', async () => {
      const res = await request(app).get('/api/public/courses/advanced-incident-response-draft');

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('GET /api/public/courses/:slug returns 200 for published course', async () => {
      const res = await request(app).get('/api/public/courses/servicenow-itsm-pro');

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.title).toBe('ServiceNow ITSM Pro');
    });
  });

  describe('Admin Courses Endpoints (CRUD, Status, Reorder)', () => {
    let createdCourseId;

    it('POST /api/admin/courses creates course with auto-generated slug', async () => {
      const res = await request(app)
        .post('/api/admin/courses')
        .set('Cookie', [adminCookie])
        .send({
          title: 'Git Version Control Essentials',
          shortDescription: 'Learn collaborative branching and merging.',
          category: 'DevOps',
          level: 'beginner',
          mode: 'online',
        });

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.slug).toBe('git-version-control-essentials');
      expect(res.body.data.status).toBe('draft');
      createdCourseId = res.body.data._id;
    });

    it('POST /api/admin/courses returns 409 Conflict on duplicate slug', async () => {
      const res = await request(app)
        .post('/api/admin/courses')
        .set('Cookie', [adminCookie])
        .send({
          title: 'Another Title',
          slug: 'git-version-control-essentials', // Duplicate
          shortDescription: 'Duplicate slug test.',
          category: 'DevOps',
        });

      expect(res.status).toBe(409);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('PATCH /api/admin/courses/:id/status publishes a draft course', async () => {
      const res = await request(app)
        .patch(`/api/admin/courses/${createdCourseId}/status`)
        .set('Cookie', [adminCookie])
        .send({ status: 'published' });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.status).toBe('published');

      // Now it should be visible in public API!
      const pubRes = await request(app).get('/api/public/courses/git-version-control-essentials');
      expect(pubRes.status).toBe(200);
    });

    it('POST /api/admin/courses/reorder updates sortOrder using bulkWrite', async () => {
      const all = await Course.find().sort({ sortOrder: 1 });
      const items = [
        { id: all[0]._id.toString(), sortOrder: 10 },
        { id: all[1]._id.toString(), sortOrder: 20 },
      ];

      const res = await request(app)
        .post('/api/admin/courses/reorder')
        .set('Cookie', [adminCookie])
        .send({ items });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);

      const first = await Course.findById(all[0]._id);
      expect(first.sortOrder).toBe(10);
    });

    it('DELETE /api/admin/courses/:id deletes a course', async () => {
      const res = await request(app)
        .delete(`/api/admin/courses/${createdCourseId}`)
        .set('Cookie', [adminCookie]);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.deleted).toBe(true);

      const check = await Course.findById(createdCourseId);
      expect(check).toBeNull();
    });
  });
});
