import { campusRequestsRepository } from './campus-requests.repository.js';
import { checkRateLimit } from '../../shared/rate-limit/rate-limit.service.js';
import { hashIp } from '../../shared/utils/hash-ip.js';
import { eventBus } from '../../shared/events/event-bus.js';
import { CAMPUS_REQUEST_EVENTS } from './campus-requests.events.js';
import { logger } from '../../shared/logger.js';
import { NotFoundError } from '../../shared/errors/index.js';
import { escapeRegex } from '../../shared/utils/escape-regex.js';
import { generateCsv } from '../../shared/utils/csv.js';

export class CampusRequestsService {
  /**
   * Submits an institutional campus workshop request.
   * @param {object} data Validated campus request payload
   * @param {string} clientIp Client IP address
   * @returns {Promise<{ ok: boolean, stored?: boolean }>}
   */
  async submitCampusRequest(data, clientIp) {
    // 1. Honeypot check: silently accept and discard if filled
    if (data._hp && data._hp.trim() !== '') {
      logger.warn(
        { ipHash: hashIp(clientIp) },
        'Honeypot triggered for campus-request submission — silently dropping'
      );
      return { ok: true, stored: false };
    }

    // 2. Sliding-window rate limit (10 requests per 1 hour per IP hash)
    const ipHash = hashIp(clientIp);
    await checkRateLimit({
      ipHash,
      route: '/api/public/campus-requests',
      maxRequests: 10,
      windowMs: 60 * 60 * 1000,
    });

    // 3. Persist campus request
    const record = await campusRequestsRepository.create({
      institution: data.institution,
      contactPerson: data.contactPerson,
      designation: data.designation,
      email: data.email,
      phone: data.phone,
      approxStudents: data.approxStudents,
      preferredFormat: data.preferredFormat,
      message: data.message,
      consent: true,
      consentAt: new Date(),
      source: data.source,
      pagePath: data.pagePath,
      deviceType: data.deviceType,
    });

    logger.info(
      { campusRequestId: record._id, institution: data.institution },
      'New campus workshop request created'
    );

    // 4. Emit event for asynchronous processing (e.g. notifications)
    eventBus.emit(CAMPUS_REQUEST_EVENTS.CAMPUS_REQUEST_CREATED, {
      id: record._id.toString(),
      institution: record.institution,
      contactPerson: record.contactPerson,
      designation: record.designation,
      email: record.email,
      phone: record.phone,
      approxStudents: record.approxStudents,
      preferredFormat: record.preferredFormat,
      message: record.message,
    });

    return { ok: true };
  }

  buildFilter({ search, preferredFormat, startDate, endDate }) {
    const filter = {};

    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      filter.$or = [
        { institution: { $regex: escaped, $options: 'i' } },
        { contactPerson: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { phone: { $regex: escaped, $options: 'i' } },
        { designation: { $regex: escaped, $options: 'i' } },
      ];
    }

    if (preferredFormat && preferredFormat.trim()) {
      filter.preferredFormat = preferredFormat.trim();
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

  async getAdminCampusRequests({
    search,
    preferredFormat,
    startDate,
    endDate,
    sort = '-createdAt',
    page = 1,
    limit = 25,
  }) {
    const filter = this.buildFilter({ search, preferredFormat, startDate, endDate });

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 25));
    const skip = (parsedPage - 1) * parsedLimit;

    const sortObj = {};
    if (sort.startsWith('-')) {
      sortObj[sort.slice(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    const [total, items] = await Promise.all([
      campusRequestsRepository.count(filter),
      campusRequestsRepository.find(filter, skip, parsedLimit, sortObj),
    ]);

    return {
      items,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
    };
  }

  async getCampusRequestById(id) {
    const request = await campusRequestsRepository.findById(id);
    if (!request) {
      throw new NotFoundError(`Campus request with ID '${id}' not found`);
    }
    return request;
  }

  async deleteCampusRequest(id) {
    const request = await campusRequestsRepository.findById(id);
    if (!request) {
      throw new NotFoundError(`Campus request with ID '${id}' not found`);
    }
    await campusRequestsRepository.deleteById(id);
    return { deleted: true, id };
  }

  async exportCampusRequestsCsv(params = {}) {
    const filter = this.buildFilter(params);
    const requests = await campusRequestsRepository.find(filter, 0, 5000, { createdAt: -1 });

    const columns = [
      { key: 'createdAt', label: 'Submitted At' },
      { key: 'institution', label: 'Institution' },
      { key: 'contactPerson', label: 'Contact Person' },
      { key: 'designation', label: 'Designation' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'approxStudents', label: 'Approx Students' },
      { key: 'preferredFormat', label: 'Preferred Format' },
      { key: 'message', label: 'Message' },
      { key: 'source', label: 'Source' },
      { key: 'consent', label: 'Consent' },
    ];

    const rows = requests.map((req) => ({
      createdAt: req.createdAt ? req.createdAt.toISOString() : '',
      institution: req.institution,
      contactPerson: req.contactPerson,
      designation: req.designation,
      email: req.email,
      phone: req.phone,
      approxStudents: req.approxStudents ? String(req.approxStudents) : '',
      preferredFormat: req.preferredFormat || '',
      message: req.message || '',
      source: req.source || '',
      consent: req.consent ? 'YES' : 'NO',
    }));

    return generateCsv(columns, rows);
  }

  async getCampusRequestCount() {
    return campusRequestsRepository.count();
  }
}

export const campusRequestsService = new CampusRequestsService();
