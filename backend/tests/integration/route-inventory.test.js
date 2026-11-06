import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../../src/app.js';
import { connectMongo, disconnectMongo } from '../../src/shared/db/mongo.js';

let mongod;

/**
 * Recursively extracts all routes and methods registered on an Express application or router.
 */
function extractRoutes(stack, prefix = '') {
  const routes = [];

  for (const layer of stack) {
    if (layer.route) {
      const path = prefix + layer.route.path;
      const methods = Object.keys(layer.route.methods).filter((m) => layer.route.methods[m]);
      for (const method of methods) {
        routes.push({ method: method.toLowerCase(), path });
      }
    } else if (layer.name === 'router' && layer.handle?.stack) {
      // Router middleware mounted with a regex or path
      let matchPath = '';
      if (layer.regexp) {
        const str = layer.regexp.source;
        // Basic extraction for Express mount path regexp
        const cleaned = str
          .replace('\\/?(?=\\/|$)', '')
          .replace('^', '')
          .replace('\\/', '/')
          .replace('(?=\\/|$)', '')
          .replace('/?$', '')
          .replace(/\\\//g, '/');
        matchPath = cleaned.split('(?=')[0].replace(/\$$/, '');
      }
      routes.push(...extractRoutes(layer.handle.stack, prefix + matchPath));
    }
  }

  return routes;
}

describe('Route Inventory Security Test (Acceptance Criterion)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectMongo(mongod.getUri());
  });

  afterAll(async () => {
    await disconnectMongo();
    if (mongod) await mongod.stop();
  });

  it('asserts every route under /api/admin/* (except login) returns 401 without a session', async () => {
    const allRoutes = extractRoutes(app._router.stack);

    // Filter for routes matching /api/admin/*
    const adminRoutes = allRoutes.filter((r) => r.path.startsWith('/api/admin/'));

    expect(adminRoutes.length).toBeGreaterThan(0);

    for (const route of adminRoutes) {
      // Exclude public login route
      if (route.method === 'post' && route.path === '/api/admin/auth/login') {
        continue;
      }

      // Replace path parameters like :id or :slug with dummy values
      const testPath = route.path
        .replace(/:id/g, new mongoose.Types.ObjectId().toString())
        .replace(/:[a-zA-Z0-9_]+/g, 'sample-test-slug');

      const req = request(app)[route.method](testPath);

      // Send a dummy body for state-changing methods to bypass 400 validation if called before auth
      if (['post', 'put', 'patch'].includes(route.method)) {
        req.send({});
      }

      const res = await req;

      expect(
        res.status,
        `Expected ${route.method.toUpperCase()} ${route.path} to return 401 UNAUTHORIZED when called anonymously, got ${res.status}`
      ).toBe(401);

      expect(res.body.ok).toBe(false);
      expect(res.body.error?.code).toBe('UNAUTHORIZED');
    }
  });
});
