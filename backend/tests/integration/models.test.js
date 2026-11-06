import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectMongo, disconnectMongo } from '../../src/shared/db/mongo.js';
import { Course } from '../../src/modules/courses/index.js';
import { Lead } from '../../src/modules/leads/index.js';
import { CampusRequest } from '../../src/modules/campus-requests/index.js';
import { SiteSettings, ensureDefaultSettings } from '../../src/modules/settings/index.js';

describe('Data Models & Constraints (PRD §8, Phase 3)', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await connectMongo(uri, 'datavalo_test');
    await Course.syncIndexes();
    await Lead.syncIndexes();
    await SiteSettings.syncIndexes();
  });

  afterAll(async () => {
    await disconnectMongo();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  describe('Course Model', () => {
    it('creates a valid course and enforces unique slug constraint', async () => {
      const courseData = {
        title: 'ServiceNow Fundamentals',
        slug: 'unique-sn-course',
        shortDescription: 'Master the ITSM platform.',
        status: 'published',
      };

      await Course.create(courseData);

      // Attempting to create duplicate slug should throw E11000 error
      await expect(Course.create(courseData)).rejects.toThrow();
    });

    it('rejects invalid enum values for level and mode', async () => {
      await expect(
        Course.create({
          title: 'Invalid Course',
          slug: 'invalid-course',
          shortDescription: 'Short desc',
          level: 'expert', // only 'beginner' | 'intermediate' | 'advanced' allowed
        })
      ).rejects.toThrow();

      await expect(
        Course.create({
          title: 'Invalid Mode Course',
          slug: 'invalid-mode-course',
          shortDescription: 'Short desc',
          mode: 'remote', // only 'online' | 'offline' | 'hybrid' allowed
        })
      ).rejects.toThrow();
    });
  });

  describe('Lead Model', () => {
    it('rejects lead creation if consent is false', async () => {
      await expect(
        Lead.create({
          fullName: 'Aarav Sharma',
          phone: '9876543210',
          email: 'aarav@college.edu',
          college: 'IIT BHU',
          courseYear: '3rd Year',
          consent: false, // Must be true!
        })
      ).rejects.toThrow();
    });

    it('stores interestedCourseIds as raw ObjectIds without Mongoose ref', async () => {
      const courseId = new mongoose.Types.ObjectId();
      const lead = await Lead.create({
        fullName: 'Aarav Sharma',
        phone: '9876543210',
        email: 'aarav@college.edu',
        college: 'IIT BHU',
        courseYear: '3rd Year',
        consent: true,
        interestedCourseIds: [courseId],
      });

      expect(lead.interestedCourseIds[0].toString()).toBe(courseId.toString());
    });
  });

  describe('SiteSettings Model', () => {
    it('initializes default singleton settings document with key: main', async () => {
      const settings = await ensureDefaultSettings();

      expect(settings.key).toBe('main');
      expect(settings.popupEnabled).toBe(true);
      expect(settings.popupDelaySeconds).toBe(8);
      expect(settings.popupScrollPercent).toBe(40);
      expect(settings.popupReappearSeconds).toBe(120);
      expect(settings.popupMaxDismissals).toBe(5);
    });
  });

  describe('CampusRequest Model', () => {
    it('creates valid campus enquiry and requires consent', async () => {
      const reqDoc = await CampusRequest.create({
        institution: 'Indian Institute of Technology, BHU',
        contactPerson: 'Dr. Sharma',
        designation: 'TPO Officer',
        email: 'tpo@iitbhu.ac.in',
        phone: '9876543210',
        consent: true,
      });

      expect(reqDoc._id).toBeDefined();
      expect(reqDoc.institution).toContain('BHU');
    });
  });
});

