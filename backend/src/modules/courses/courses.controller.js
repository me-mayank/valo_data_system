import { coursesService } from './courses.service.js';

export class CoursesController {
  // --- Public Handlers ---
  async listPublic(req, res) {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const courses = await coursesService.getPublishedCourses(filter);
    res.json({
      ok: true,
      data: courses,
    });
  }

  async getPublicBySlug(req, res) {
    const course = await coursesService.getPublishedCourseBySlug(req.params.slug);
    res.json({
      ok: true,
      data: course,
    });
  }

  // --- Admin Handlers ---
  async listAdmin(req, res) {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const { courses, pagination } = await coursesService.getAdminCourses({
      search: req.query.q,
      status: req.query.status,
      page,
      limit,
    });

    res.json({
      ok: true,
      data: courses,
      meta: { pagination },
    });
  }

  async getAdminById(req, res) {
    const course = await coursesService.getCourseById(req.params.id);
    res.json({
      ok: true,
      data: course,
    });
  }

  async create(req, res) {
    const course = await coursesService.createCourse(req.body);
    res.status(201).json({
      ok: true,
      data: course,
    });
  }

  async update(req, res) {
    const course = await coursesService.updateCourse(req.params.id, req.body);
    res.json({
      ok: true,
      data: course,
    });
  }

  async updateStatus(req, res) {
    const course = await coursesService.updateStatus(req.params.id, req.body.status);
    res.json({
      ok: true,
      data: course,
    });
  }

  async delete(req, res) {
    const result = await coursesService.deleteCourse(req.params.id);
    res.json({
      ok: true,
      data: result,
    });
  }

  async reorder(req, res) {
    const result = await coursesService.reorderCourses(req.body.items);
    res.json({
      ok: true,
      data: result,
    });
  }
}

export const coursesController = new CoursesController();
