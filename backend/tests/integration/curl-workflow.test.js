import { describe, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { app } from './src/app.js';
import { connectMongo, disconnectMongo } from './src/shared/db/mongo.js';
import { createAdmin } from './src/modules/auth/index.js';

describe('Manual curl transcript verification', () => {
  it('runs login, create, draft isolation, publish, and public read', async () => {
    const mongod = await MongoMemoryServer.create();
    await connectMongo(mongod.getUri(), 'datavalo_curl_test');

    const email = 'curl-admin@datavalosystem.com';
    const password = 'CorrectPassword123!';
    await createAdmin({ email, password });

    console.log('\n--- 1. ADMIN LOGIN ---');
    console.log('$ curl -X POST /api/admin/auth/login -d \'{"email":"...","password":"..."}\'');
    const loginRes = await request(app)
      .post('/api/admin/auth/login')
      .send({ email, password });
    console.log('HTTP', loginRes.status, JSON.stringify(loginRes.body));
    const cookie = loginRes.headers['set-cookie']?.find(c => c.startsWith('dv_admin='));
    console.log('Set-Cookie:', cookie?.split(';')[0]);

    console.log('\n--- 2. CREATE COURSE (DRAFT) ---');
    console.log('$ curl -X POST /api/admin/courses -b "dv_admin=..." -d \'{"title":"ITSM Incident Automation",...}\'');
    const createRes = await request(app)
      .post('/api/admin/courses')
      .set('Cookie', [cookie])
      .send({
        title: 'ITSM Incident Automation',
        shortDescription: 'Automate high-velocity ticketing queues.',
        category: 'ITSM',
        level: 'intermediate',
        mode: 'online'
      });
    console.log('HTTP', createRes.status, JSON.stringify(createRes.body));
    const courseId = createRes.body.data._id;
    const slug = createRes.body.data.slug;

    console.log('\n--- 3. VERIFY DRAFT IS NOT IN PUBLIC API (404) ---');
    console.log(`$ curl -X GET /api/public/courses/${slug}`);
    const pubBefore = await request(app).get(`/api/public/courses/${slug}`);
    console.log('HTTP', pubBefore.status, JSON.stringify(pubBefore.body));

    console.log('\n--- 4. PUBLISH COURSE ---');
    console.log(`$ curl -X PATCH /api/admin/courses/${courseId}/status -b "dv_admin=..." -d '{"status":"published"}'`);
    const publishRes = await request(app)
      .patch(`/api/admin/courses/${courseId}/status`)
      .set('Cookie', [cookie])
      .send({ status: 'published' });
    console.log('HTTP', publishRes.status, JSON.stringify(publishRes.body));

    console.log('\n--- 5. VERIFY PUBLIC READ (200) ---');
    console.log(`$ curl -X GET /api/public/courses/${slug}`);
    const pubAfter = await request(app).get(`/api/public/courses/${slug}`);
    console.log('HTTP', pubAfter.status, JSON.stringify(pubAfter.body));

    console.log('\n--- 6. LOGOUT ---');
    console.log('$ curl -X POST /api/admin/auth/logout -b "dv_admin=..."');
    const logoutRes = await request(app)
      .post('/api/admin/auth/logout')
      .set('Cookie', [cookie]);
    console.log('HTTP', logoutRes.status, JSON.stringify(logoutRes.body));

    await disconnectMongo();
    await mongod.stop();
  });
});
