import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../src/app.js';
import { connectMongo, disconnectMongo } from '../../src/shared/db/mongo.js';
import { createAdmin } from '../../src/modules/auth/index.js';
import { CampusRequest } from '../../src/modules/campus-requests/index.js';

let mongod;
let adminCookie;

const ADMIN_EMAIL = 'admin-campus@datavalosystem.com';
const ADMIN_PASSWORD = 'AdminPassword123!';

describe('Admin Campus Requests Integration Tests (Phase 9 FR-ADM-05)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectMongo(mongod.getUri(), 'datavalo_test_admin_campus');
    await createAdmin({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    const loginRes = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    adminCookie = loginRes.headers['set-cookie'].find((c) => c.startsWith('dv_admin='));
  });

  afterAll(async () => {
    await disconnectMongo();
    if (mongod) {
      await mongod.stop();
    }
  });

  beforeEach(async () => {
    await CampusRequest.deleteMany({});
  });

  describe('GET /api/admin/campus-requests', () => {
    it('rejects unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/admin/campus-requests');
      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
    });

    it('returns paginated campus requests', async () => {
      await CampusRequest.create({
        institution: 'Indian Institute of Technology, Bombay',
        contactPerson: 'Prof. Sharma',
        designation: 'HOD Computer Science',
        email: 'sharma@iitb.ac.in',
        phone: '9876543210',
        approxStudents: '120+',
        preferredFormat: 'On-Campus',
        consent: true,
      });

      const res = await request(app)
        .get('/api/admin/campus-requests?page=1&limit=10')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.total).toBe(1);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].institution).toContain('Indian Institute of Technology');
    });

    it('filters by search query matching institution or contact', async () => {
      await CampusRequest.create([
        {
          institution: 'Vellore Institute of Technology',
          contactPerson: 'Dr. Kumar',
          designation: 'Director Placements',
          email: 'kumar@vit.ac.in',
          phone: '9123456780',
          consent: true,
        },
        {
          institution: 'Manipal Academy',
          contactPerson: 'Dr. Rao',
          designation: 'Dean',
          email: 'rao@manipal.edu',
          phone: '9123456781',
          consent: true,
        },
      ]);

      const res = await request(app)
        .get('/api/admin/campus-requests?search=Vellore')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(1);
      expect(res.body.data.items[0].contactPerson).toBe('Dr. Kumar');
    });
  });

  describe('GET /api/admin/campus-requests/:id', () => {
    it('returns single campus request detail', async () => {
      const created = await CampusRequest.create({
        institution: 'NIT Warangal',
        contactPerson: 'Prof. Reddy',
        designation: 'Placement Officer',
        email: 'reddy@nitw.ac.in',
        phone: '9876500000',
        consent: true,
      });

      const res = await request(app)
        .get(`/api/admin/campus-requests/${created._id}`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.institution).toBe('NIT Warangal');
    });
  });

  describe('DELETE /api/admin/campus-requests/:id', () => {
    it('deletes campus request', async () => {
      const created = await CampusRequest.create({
        institution: 'Temporary College',
        contactPerson: 'Person',
        designation: 'Role',
        email: 'temp@college.in',
        phone: '9876511111',
        consent: true,
      });

      const delRes = await request(app)
        .delete(`/api/admin/campus-requests/${created._id}`)
        .set('Cookie', adminCookie);

      expect(delRes.status).toBe(200);
      expect(delRes.body.ok).toBe(true);

      const check = await CampusRequest.findById(created._id);
      expect(check).toBeNull();
    });
  });

  describe('GET /api/admin/campus-requests/export', () => {
    it('exports CSV with formula defense and UTF-8 BOM', async () => {
      await CampusRequest.create({
        institution: '=HYPERLINK("http://evil.com")',
        contactPerson: '+Dr. Evil',
        designation: 'Head',
        email: 'evil@inst.edu',
        phone: '-9876543210',
        consent: true,
      });

      const res = await request(app)
        .get('/api/admin/campus-requests/export')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text.charCodeAt(0)).toBe(0xfeff);
      expect(res.text).toContain('"\'=HYPERLINK(""http://evil.com"")"');
      expect(res.text).toContain('"\'+Dr. Evil"');
      expect(res.text).toContain('"\' -9876543210"'.replace(' ', ''));
    });
  });
});
