import { leadsRepository } from './leads.repository.js';
import { getPublishedCourseIds, getCourseTitles } from '../courses/index.js';
import { checkRateLimit } from '../../shared/rate-limit/rate-limit.service.js';
import { hashIp } from '../../shared/utils/hash-ip.js';
import { eventBus } from '../../shared/events/event-bus.js';
import { LEAD_EVENTS } from './leads.events.js';
import { logger } from '../../shared/logger.js';
import { ValidationError, NotFoundError } from '../../shared/errors/index.js';
import { escapeRegex } from '../../shared/utils/escape-regex.js';
import { generateCsv } from '../../shared/utils/csv.js';

export class LeadsService {
  /**
   * Submits a student lead with honeypot defense, rate limiting, and deduplication.
   * @param {object} data Validated lead submission payload
   * @param {string} clientIp Client IP address for hashing
   * @returns {Promise<{ ok: boolean, stored?: boolean }>}
   */
  async submitLead(data, clientIp) {
    if (data._hp && data._hp.trim() !== '') {
      logger.warn({ ipHash: hashIp(clientIp) }, 'Honeypot triggered for lead submission — silently dropping');
      return { ok: true, stored: false };
    }

    const ipHash = hashIp(clientIp);
    await checkRateLimit({
      ipHash,
      route: '/api/public/leads',
      maxRequests: 10,
      windowMs: 60 * 60 * 1000,
    });

    const verifiedCourseIds = await getPublishedCourseIds(data.interestedCourseIds);
    if (!verifiedCourseIds || verifiedCourseIds.length === 0) {
      throw new ValidationError('None of the selected courses are currently published');
    }

    const existing = await leadsRepository.findOneByEmailOrPhone(data.email, data.phone);
    let lead;

    if (existing) {
      const updateFields = {};
      if (data.city) updateFields.city = data.city;
      if (data.preferredMode) updateFields.preferredMode = data.preferredMode;
      if (data.skillLevel) updateFields.skillLevel = data.skillLevel;
      if (data.heardFrom) updateFields.heardFrom = data.heardFrom;
      if (data.source) updateFields.source = data.source;
      if (data.pagePath) updateFields.pagePath = data.pagePath;
      if (data.deviceType) updateFields.deviceType = data.deviceType;
      if (data.formVariant) updateFields.formVariant = data.formVariant;

      lead = await leadsRepository.mergeLead(existing._id, {
        interestedCourseIds: verifiedCourseIds,
        updateFields,
      });

      logger.info(
        { leadId: existing._id, email: data.email },
        'Existing lead updated and course interests merged'
      );
    } else {
      lead = await leadsRepository.create({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        college: data.college,
        courseYear: data.courseYear,
        interestedCourseIds: verifiedCourseIds,
        consent: true,
        consentAt: new Date(),
        city: data.city,
        preferredMode: data.preferredMode,
        skillLevel: data.skillLevel,
        heardFrom: data.heardFrom,
        source: data.source,
        pagePath: data.pagePath,
        deviceType: data.deviceType,
        formVariant: data.formVariant || 'popup',
      });

      logger.info({ leadId: lead._id, email: data.email }, 'New student lead created');
    }

    eventBus.emit(LEAD_EVENTS.LEAD_CREATED, {
      id: lead._id.toString(),
      fullName: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      college: lead.college,
      courseYear: lead.courseYear,
      interestedCourseIds: lead.interestedCourseIds,
      source: lead.source,
      formVariant: lead.formVariant,
      isUpdate: Boolean(existing),
    });

    return { ok: true };
  }

  buildFilter({ search, college, source, courseId, formVariant, startDate, endDate }) {
    const filter = {};

    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      filter.$or = [
        { fullName: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { phone: { $regex: escaped, $options: 'i' } },
        { college: { $regex: escaped, $options: 'i' } },
      ];
    }

    if (college && college.trim()) {
      filter.college = { $regex: escapeRegex(college.trim()), $options: 'i' };
    }

    if (source && source.trim()) {
      filter.source = source.trim();
    }

    if (formVariant && formVariant.trim()) {
      filter.formVariant = formVariant.trim();
    }

    if (courseId && courseId.trim()) {
      filter.interestedCourseIds = courseId.trim();
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    return filter;
  }

  async getAdminLeads({
    search,
    college,
    source,
    courseId,
    formVariant,
    startDate,
    endDate,
    sort = '-createdAt',
    page = 1,
    limit = 25,
  }) {
    const filter = this.buildFilter({
      search,
      college,
      source,
      courseId,
      formVariant,
      startDate,
      endDate,
    });

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 25));
    const skip = (parsedPage - 1) * parsedLimit;

    const sortObj = {};
    if (sort.startsWith('-')) {
      sortObj[sort.slice(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    const [total, rawLeads] = await Promise.all([
      leadsRepository.count(filter),
      leadsRepository.find(filter, skip, parsedLimit, sortObj),
    ]);

    // Gather distinct course IDs to resolve titles
    const allCourseIds = new Set();
    for (const lead of rawLeads) {
      for (const cId of lead.interestedCourseIds || []) {
        allCourseIds.add(cId.toString());
      }
    }

    const titleMap = await getCourseTitles(Array.from(allCourseIds));

    const items = rawLeads.map((lead) => {
      const doc = lead.toObject();
      doc.courses = (doc.interestedCourseIds || []).map((id) => ({
        id: id.toString(),
        title: titleMap[id.toString()] || 'Unknown Course',
      }));
      return doc;
    });

    return {
      items,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
    };
  }

  async getLeadById(id) {
    const lead = await leadsRepository.findById(id);
    if (!lead) {
      throw new NotFoundError(`Lead with ID '${id}' not found`);
    }

    const doc = lead.toObject();
    const titleMap = await getCourseTitles(
      (doc.interestedCourseIds || []).map((cId) => cId.toString())
    );

    doc.courses = (doc.interestedCourseIds || []).map((cId) => ({
      id: cId.toString(),
      title: titleMap[cId.toString()] || 'Unknown Course',
    }));

    return doc;
  }

  async deleteLead(id) {
    const lead = await leadsRepository.findById(id);
    if (!lead) {
      throw new NotFoundError(`Lead with ID '${id}' not found`);
    }
    await leadsRepository.deleteById(id);
    return { deleted: true, id };
  }

  async exportLeadsCsv(params = {}) {
    const filter = this.buildFilter(params);
    const leads = await leadsRepository.find(filter, 0, 5000, { createdAt: -1 });

    const allCourseIds = new Set();
    for (const lead of leads) {
      for (const cId of lead.interestedCourseIds || []) {
        allCourseIds.add(cId.toString());
      }
    }

    const titleMap = await getCourseTitles(Array.from(allCourseIds));

    const columns = [
      { key: 'createdAt', label: 'Registered At' },
      { key: 'fullName', label: 'Full Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'college', label: 'College' },
      { key: 'courseYear', label: 'Course & Year' },
      { key: 'courseTitles', label: 'Interested Courses' },
      { key: 'city', label: 'City' },
      { key: 'preferredMode', label: 'Preferred Mode' },
      { key: 'skillLevel', label: 'Skill Level' },
      { key: 'heardFrom', label: 'Heard From' },
      { key: 'source', label: 'Source Tag' },
      { key: 'formVariant', label: 'Form Variant' },
      { key: 'consent', label: 'Consent' },
    ];

    const rows = leads.map((lead) => {
      const titles = (lead.interestedCourseIds || [])
        .map((id) => titleMap[id.toString()] || id.toString())
        .join('; ');

      return {
        createdAt: lead.createdAt ? lead.createdAt.toISOString() : '',
        fullName: lead.fullName,
        email: lead.email,
        phone: lead.phone,
        college: lead.college,
        courseYear: lead.courseYear,
        courseTitles: titles,
        city: lead.city || '',
        preferredMode: lead.preferredMode || '',
        skillLevel: lead.skillLevel || '',
        heardFrom: lead.heardFrom || '',
        source: lead.source || '',
        formVariant: lead.formVariant || 'popup',
        consent: lead.consent ? 'YES' : 'NO',
      };
    });

    return generateCsv(columns, rows);
  }

  async getTopSources(limit = 5) {
    return leadsRepository.getTopSources(limit);
  }

  async getTopCourses(limit = 5) {
    const raw = await leadsRepository.getTopCourses(limit);
    const ids = raw.map((r) => r.courseId);
    const titleMap = await getCourseTitles(ids);

    return raw.map((r) => ({
      courseId: r.courseId,
      title: titleMap[r.courseId] || 'Unknown Program',
      count: r.count,
    }));
  }

  async getLeadStats() {
    const total = await leadsRepository.count();
    const last7Days = await leadsRepository.count({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });
    return { total, last7Days };
  }

  async getLatestLeads(n = 10) {
    const leads = await leadsRepository.find({}, 0, n, { createdAt: -1 });
    const allCourseIds = new Set();
    for (const lead of leads) {
      for (const cId of lead.interestedCourseIds || []) {
        allCourseIds.add(cId.toString());
      }
    }

    const titleMap = await getCourseTitles(Array.from(allCourseIds));

    return leads.map((lead) => {
      const doc = lead.toObject();
      doc.courses = (doc.interestedCourseIds || []).map((id) => ({
        id: id.toString(),
        title: titleMap[id.toString()] || 'Unknown Course',
      }));
      return doc;
    });
  }
}

export const leadsService = new LeadsService();
