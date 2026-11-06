import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../src/app.js';
import { connectMongo, disconnectMongo } from '../../src/shared/db/mongo.js';
import { createAdmin } from '../../src/modules/auth/index.js';
import { Course } from '../../src/modules/courses/index.js';
import { Lead } from '../../src/modules/leads/index.js';

let mongod;
let adminCookie;
let testCourse1;
let testCourse2;

const ADMIN_EMAIL = 'admin-leads@datavalosystem.com';
const ADMIN_PASSWORD = 'AdminPassword123!';

describe('Admin Leads Management Integration Tests (Phase 9 FR-ADM-03 / FR-ADM-04)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectMongo(mongod.getUri(), 'datavalo_test_admin_leads');
    await createAdmin({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    const loginRes = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    adminCookie = loginRes.headers['set-cookie'].find((c) => c.startsWith('dv_admin='));

    testCourse1 = await Course.create({
      title: 'ServiceNow Masterclass',
      slug: 'servicenow-masterclass',
      shortDescription: 'Enterprise ServiceNow training',
      status: 'published',
      sortOrder: 1,
    });

    testCourse2 = await Course.create({
      title: 'Jira Agile Project Lead',
      slug: 'jira-agile-lead',
      shortDescription: 'Enterprise Jira agile training',
      status: 'published',
      sortOrder: 2,
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
  });

  describe('GET /api/admin/leads', () => {
    it('rejects unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/admin/leads');
      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
    });

    it('returns paginated list with mapped course titles', async () => {
      await Lead.create({
        fullName: 'Aarav Sharma',
        phone: '9876543210',
        email: 'aarav@iitbhu.ac.in',
        college: 'IIT (BHU) Varanasi',
        courseYear: '3rd Year',
        interestedCourseIds: [testCourse1._id],
        consent: true,
        source: 'campus-drive',
      });

      await Lead.create({
        fullName: 'Pooja Verma',
        phone: '9876543211',
        email: 'pooja@nit.ac.in',
        college: 'NIT Trichy',
        courseYear: '4th Year',
        interestedCourseIds: [testCourse2._id],
        consent: true,
        source: 'linkedin',
      });

      const res = await request(app)
        .get('/api/admin/leads?page=1&limit=10')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.items).toHaveLength(2);

      const firstLead = res.body.data.items[0];
      expect(firstLead.courses).toBeDefined();
      expect(firstLead.courses.length).toBeGreaterThan(0);
      expect(firstLead.courses[0].title).toBeDefined();
    });

    it('filters leads by search query matching name, email, phone, or college', async () => {
      await Lead.create([
        {
          fullName: 'Vikram Singh',
          phone: '9111111111',
          email: 'vikram@dtu.ac.in',
          college: 'Delhi Technological University',
          courseYear: '2nd Year',
          interestedCourseIds: [testCourse1._id],
          consent: true,
        },
        {
          fullName: 'Ananya Roy',
          phone: '9222222222',
          email: 'ananya@jadavpur.edu',
          college: 'Jadavpur University',
          courseYear: '4th Year',
          interestedCourseIds: [testCourse1._id],
          consent: true,
        },
      ]);

      const res = await request(app)
        .get('/api/admin/leads?search=Jadavpur')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(1);
      expect(res.body.data.items[0].fullName).toBe('Ananya Roy');
    });

    it('filters leads by source', async () => {
      await Lead.create([
        {
          fullName: 'Lead A',
          phone: '9333333331',
          email: 'a@test.com',
          college: 'College A',
          courseYear: '1st',
          interestedCourseIds: [testCourse1._id],
          consent: true,
          source: 'qr-iit-delhi',
        },
        {
          fullName: 'Lead B',
          phone: '9333333332',
          email: 'b@test.com',
          college: 'College B',
          courseYear: '1st',
          interestedCourseIds: [testCourse1._id],
          consent: true,
          source: 'website',
        },
      ]);

      const res = await request(app)
        .get('/api/admin/leads?source=qr-iit-delhi')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(1);
      expect(res.body.data.items[0].fullName).toBe('Lead A');
    });
  });

  describe('GET /api/admin/leads/:id', () => {
    it('returns 404 for non-existent lead', async () => {
      const res = await request(app)
        .get('/api/admin/leads/507f1f77bcf86cd799439011')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
    });

    it('returns single lead with mapped courses', async () => {
      const created = await Lead.create({
        fullName: 'Karan Mehra',
        phone: '9444444444',
        email: 'karan@college.edu',
        college: 'BITS Pilani',
        courseYear: '3rd Year',
        interestedCourseIds: [testCourse1._id],
        consent: true,
      });

      const res = await request(app)
        .get(`/api/admin/leads/${created._id}`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.fullName).toBe('Karan Mehra');
      expect(res.body.data.courses[0].title).toBe('ServiceNow Masterclass');
    });
  });

  describe('DELETE /api/admin/leads/:id', () => {
    it('deletes lead successfully', async () => {
      const created = await Lead.create({
        fullName: 'Delete Target',
        phone: '9555555555',
        email: 'delete@target.com',
        college: 'Temp College',
        courseYear: '1st',
        interestedCourseIds: [testCourse1._id],
        consent: true,
      });

      const delRes = await request(app)
        .delete(`/api/admin/leads/${created._id}`)
        .set('Cookie', adminCookie);

      expect(delRes.status).toBe(200);
      expect(delRes.body.ok).toBe(true);

      const check = await Lead.findById(created._id);
      expect(check).toBeNull();
    });
  });

  describe('GET /api/admin/leads/export (CSV Export & Formula Injection Defense)', () => {
    it('exports CSV with UTF-8 BOM and formula neutralization', async () => {
      // Create lead with formula injection payload
      await Lead.create({
        fullName: '=cmd|’ /C calc’!A0',
        phone: '+919999999999',
        email: '@malicious@evil.com',
        college: '-Dangerous College',
        courseYear: '4th Year',
        interestedCourseIds: [testCourse1._id],
        consent: true,
        source: 'test-calc',
      });

      const res = await request(app)
        .get('/api/admin/leads/export')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment');

      const csvText = res.text;
      // UTF-8 BOM check
      expect(csvText.charCodeAt(0)).toBe(0xfeff);

      // Verify formula injection prefixes
      // Cells starting with =, +, -, @ should be preceded by a single quote '
      expect(csvText).toContain('"\'=cmd|’ /C calc’!A0"');
      expect(csvText).toContain('"\'+919999999999"');
      expect(csvText).toContain('"\'@malicious@evil.com"');
      expect(csvText).toContain('"\' -Dangerous College"'.replace(' ', ''));
    });
  });
});
