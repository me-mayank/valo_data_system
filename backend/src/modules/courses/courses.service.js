import { coursesRepository } from './courses.repository.js';
import { deleteImage } from '../uploads/index.js';
import { eventBus } from '../../shared/events/event-bus.js';
import { COURSE_EVENTS } from './courses.events.js';
import { slugify } from '../../shared/utils/slugify.js';
import { escapeRegex } from '../../shared/utils/escape-regex.js';
import { calculatePagination } from '../../shared/utils/pagination.js';
import { NotFoundError, ConflictError } from '../../shared/errors/index.js';
import {
  createCourseSchema,
  updateCourseSchema,
  updateCourseStatusSchema,
  reorderCoursesSchema,
} from './courses.validation.js';

export class CoursesService {
  async getPublishedCourses(filter = {}) {
    return coursesRepository.findPublished(filter);
  }

  async getPublishedCourseBySlug(slug) {
    const course = await coursesRepository.findPublishedBySlug(slug);
    if (!course) {
      throw new NotFoundError(`Course with slug '${slug}' was not found`);
    }
    return course;
  }

  async getPublishedCourseIds(ids) {
    const courses = await coursesRepository.findPublishedByIds(ids);
    return courses.map((c) => c._id);
  }

  async getCourseTitles(ids) {
    return coursesRepository.findTitlesByIds(ids);
  }

  async countCourses(filter = {}) {
    return coursesRepository.count(filter);
  }

  async getAdminCourses({ search, status, page = 1, limit = 20 }) {
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (search) {
      const escaped = escapeRegex(search.trim());
      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { code: { $regex: escaped, $options: 'i' } },
        { shortDescription: { $regex: escaped, $options: 'i' } },
      ];
    }

    const total = await coursesRepository.count(filter);
    const pagination = calculatePagination({ total, page, limit });

    const courses = await coursesRepository.findAdminList({
      filter,
      skip: pagination.skip,
      limit: pagination.limit,
    });

    return {
      courses,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
        hasNext: pagination.hasNext,
        hasPrev: pagination.hasPrev,
      },
    };
  }

  async getCourseById(id) {
    const course = await coursesRepository.findById(id);
    if (!course) {
      throw new NotFoundError(`Course with ID '${id}' was not found`);
    }
    return course;
  }

  async createCourse(data) {
    const validated = createCourseSchema.parse(data);
    const slug = validated.slug ? slugify(validated.slug) : slugify(validated.title);

    try {
      const course = await coursesRepository.create({
        ...validated,
        slug,
      });

      eventBus.emit(COURSE_EVENTS.COURSE_CHANGED, {
        action: 'create',
        id: course._id.toString(),
        slug: course.slug,
      });

      return course;
    } catch (err) {
      if (err.code === 11000) {
        throw new ConflictError(`A course with slug '${slug}' already exists`);
      }
      throw err;
    }
  }

  async updateCourse(id, data) {
    const validated = updateCourseSchema.parse(data);
    const existing = await this.getCourseById(id);

    if (validated.slug) {
      validated.slug = slugify(validated.slug);
    }

    // Cleanup old image if thumbnail replaced or cleared
    if (
      existing.thumbnail?.publicId &&
      validated.thumbnail &&
      validated.thumbnail.publicId !== existing.thumbnail.publicId
    ) {
      await deleteImage(existing.thumbnail.publicId);
    }

    try {
      const updated = await coursesRepository.updateById(id, validated);
      if (!updated) {
        throw new NotFoundError(`Course with ID '${id}' was not found`);
      }

      eventBus.emit(COURSE_EVENTS.COURSE_CHANGED, {
        action: 'update',
        id: updated._id.toString(),
        slug: updated.slug,
      });

      return updated;
    } catch (err) {
      if (err.code === 11000) {
        throw new ConflictError(`A course with slug '${validated.slug}' already exists`);
      }
      throw err;
    }
  }

  async updateStatus(id, status) {
    const validated = updateCourseStatusSchema.parse({ status });
    await this.getCourseById(id);

    const updated = await coursesRepository.updateById(id, { status: validated.status });
    eventBus.emit(COURSE_EVENTS.COURSE_CHANGED, {
      action: 'update_status',
      id: updated._id.toString(),
      slug: updated.slug,
    });

    return updated;
  }

  async deleteCourse(id) {
    const existing = await this.getCourseById(id);

    if (existing.thumbnail?.publicId) {
      await deleteImage(existing.thumbnail.publicId);
    }

    await coursesRepository.deleteById(id);

    eventBus.emit(COURSE_EVENTS.COURSE_CHANGED, {
      action: 'delete',
      id: existing._id.toString(),
      slug: existing.slug,
    });

    return { deleted: true, id: existing._id.toString() };
  }

  async reorderCourses(items) {
    const validated = reorderCoursesSchema.parse({ items });
    await coursesRepository.bulkUpdateSortOrders(validated.items);

    eventBus.emit(COURSE_EVENTS.COURSE_CHANGED, {
      action: 'reorder',
    });

    return { reordered: true, count: validated.items.length };
  }

  /**
   * Seed sample courses (called by seed:content script).
   * 1 draft, 2 published per Implementation Plan Phase 3 task 8.
   */
  async seedSampleCourses() {
    const count = await coursesRepository.count();
    if (count > 0) {
      return { seeded: false, count };
    }

    const samples = [
      {
        code: 'SN-101',
        title: 'ServiceNow Fundamentals',
        slug: 'servicenow-fundamentals',
        shortDescription: 'Master the platform used by 85% of Fortune 500 companies.',
        overview: 'Direct hands-on practice in ServiceNow navigation, incident handling, and ITSM.',
        category: 'ITSM',
        tools: ['ServiceNow', 'ITSM'],
        level: 'beginner',
        mode: 'online',
        duration: '6 weeks',
        audience: 'College students (2nd to 4th year).',
        status: 'published',
        featured: true,
        sortOrder: 1,
        syllabus: [
          {
            title: 'Platform Architecture & Navigation',
            topics: ['Users, groups, roles', 'Lists and breadcrumbs'],
          },
          {
            title: 'Incident & SLA Management',
            topics: ['Incident lifecycle', 'Priority matrix and assignment rules'],
          },
        ],
      },
      {
        code: 'JR-201',
        title: 'Jira for Agile Teams',
        slug: 'jira-agile-teams',
        shortDescription: 'Plan, track, and manage software releases using Scrum and Kanban.',
        overview: 'Configure real Jira projects, sprint cycles, and backlog estimation.',
        category: 'Project Management',
        tools: ['Jira', 'Confluence'],
        level: 'intermediate',
        mode: 'hybrid',
        duration: '4 weeks',
        audience: 'Software engineering, QA, or product management students.',
        status: 'published',
        featured: true,
        sortOrder: 2,
        syllabus: [
          {
            title: 'Agile Frameworks in Practice',
            topics: ['Scrum vs Kanban', 'Backlog grooming'],
          },
        ],
      },
      {
        code: 'DV-301',
        title: 'DevOps & Git Delivery Workflows',
        slug: 'devops-delivery-workflows',
        shortDescription: 'Practical Git branch policies, code reviews, and automated CI/CD pipelines.',
        overview: 'Move beyond individual git commands to collaborative team branch protection and CI.',
        category: 'DevOps',
        tools: ['Git', 'Jenkins', 'Linux'],
        level: 'intermediate',
        mode: 'offline',
        duration: '8 weeks',
        audience: 'Engineering students seeking practical delivery exposure.',
        status: 'draft',
        featured: false,
        sortOrder: 3,
        syllabus: [
          {
            title: 'Git Collaboration at Scale',
            topics: ['Trunk-based vs GitFlow', 'Merge conflict resolution'],
          },
        ],
      },
    ];

    for (const item of samples) {
      await coursesRepository.create(item);
    }

    return { seeded: true, count: samples.length };
  }
}

export const coursesService = new CoursesService();
