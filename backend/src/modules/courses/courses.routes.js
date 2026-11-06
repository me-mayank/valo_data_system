import { Router } from 'express';
import { coursesController } from './courses.controller.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { validateBody } from '../../shared/http/validate.js';
import {
  createCourseSchema,
  updateCourseSchema,
  updateCourseStatusSchema,
  reorderCoursesSchema,
} from './courses.validation.js';

// Public courses router
export const publicCoursesRouter = Router();

publicCoursesRouter.get(
  '/',
  asyncHandler((req, res) => coursesController.listPublic(req, res))
);

publicCoursesRouter.get(
  '/:slug',
  asyncHandler((req, res) => coursesController.getPublicBySlug(req, res))
);

// Admin courses router
export const coursesRouter = Router();

coursesRouter.get(
  '/',
  asyncHandler((req, res) => coursesController.listAdmin(req, res))
);

coursesRouter.post(
  '/',
  validateBody(createCourseSchema),
  asyncHandler((req, res) => coursesController.create(req, res))
);

coursesRouter.post(
  '/reorder',
  validateBody(reorderCoursesSchema),
  asyncHandler((req, res) => coursesController.reorder(req, res))
);

coursesRouter.get(
  '/:id',
  asyncHandler((req, res) => coursesController.getAdminById(req, res))
);

coursesRouter.put(
  '/:id',
  validateBody(updateCourseSchema),
  asyncHandler((req, res) => coursesController.update(req, res))
);

coursesRouter.patch(
  '/:id/status',
  validateBody(updateCourseStatusSchema),
  asyncHandler((req, res) => coursesController.updateStatus(req, res))
);

coursesRouter.delete(
  '/:id',
  asyncHandler((req, res) => coursesController.delete(req, res))
);
