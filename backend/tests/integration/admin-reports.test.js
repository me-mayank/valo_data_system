import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../src/app.js';
import { connectMongo, disconnectMongo } from '../../src/shared/db/mongo.js';
import { createAdmin } from '../../src/modules/auth/index.js';
import { Course } from '../../src/modules/courses/index.js';
import { Lead } from '../../src/modules/leads/index.js';
import { CampusRequest } from '../../src/modules/campus-requests/index.js';

let mongod;
let adminCookie;

const ADMIN_EMAIL = 'admin-reports@datavalosystem.com';
const ADMIN_PASSWORD = 'AdminPassword123!';

describe('Admin Reports Overview Integration Tests (Phase 9 FR-ADM-06)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectMongo(mongod.getUri(), 'datavalo_test_admin_reports');
    await createAdmin({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    const loginRes = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    adminCookie = loginRes.headers['set-cookie'].find((c) => c.startsWith('dv_admin='));

    // Create courses
    const c1 = await Course.create({
      title: 'ServiceNow Pro',
      slug: 'servicenow-pro',
      shortDescription: 'Enterprise ITSM',
      status: 'published',
      sortOrder: 1,
    });

    await Course.create({
      title: 'Jira Core (Draft)',
      slug: 'jira-core-draft',
      shortDescription: 'Draft only',
      status: 'draft',
      sortOrder: 2,
    });

    // Create leads
    await Lead.create([
      {
        fullName: 'Student One',
        phone: '9000000001',
        email: 's1@test.com',
        college: 'IIT Delhi',
        courseYear: '3rd Year',
        interestedCourseIds: [c1._id],
        source: 'campus-fair',
        consent: true,
      },
      {
        fullName: 'Student Two',
        phone: '9000000002',
        email: 's2@test.com',
        college: 'IIT Bombay',
        courseYear: '4th Year',
        interestedCourseIds: [c1._id],
        source: 'campus-fair',
        consent: true,
      },
      {
        fullName: 'Student Three',
        phone: '9000000003',
        email: 's3@test.com',
        college: 'IIT Madras',
        courseYear: '2nd Year',
        interestedCourseIds: [c1._id],
        source: 'instagram',
        consent: true,
      },
    ]);

    // Create campus request
    await CampusRequest.create({
      institution: 'IIT Kanpur',
      contactPerson: 'Placement Head',
      designation: 'Officer',
      email: 'head@iitk.ac.in',
      phone: '9888888888',
      consent: true,
    });
  });

  afterAll(async () => {
    await disconnectMongo();
    if (mongod) {
      await mongod.stop();
    }
  });

  it('rejects unauthenticated overview access with 401', async () => {
    const res = await request(app).get('/api/admin/overview');
    expect(res.status).toBe(401);
  });

  it('returns comprehensive dashboard overview metrics', async () => {
    const res = await request(app)
      .get('/api/admin/overview')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const { data } = res.body;
    expect(data.totalLeads).toBe(3);
    expect(data.leadsLast7Days).toBe(3);
    expect(data.publishedCoursesCount).toBe(1);
    expect(data.campusRequestCount).toBe(1);

    // Top sources
    expect(data.topSources).toBeDefined();
    expect(data.topSources.length).toBeGreaterThan(0);
    expect(data.topSources[0].source).toBe('campus-fair');
    expect(data.topSources[0].count).toBe(2);

    // Top courses
    expect(data.topCourses).toBeDefined();
    expect(data.topCourses.length).toBeGreaterThan(0);
    expect(data.topCourses[0].title).toBe('ServiceNow Pro');
    expect(data.topCourses[0].count).toBe(3);

    // Latest leads
    expect(data.latestLeads).toBeDefined();
    expect(data.latestLeads).toHaveLength(3);
    expect(data.latestLeads[0].courses[0].title).toBe('ServiceNow Pro');
  });
});

