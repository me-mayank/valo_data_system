import { Router } from 'express';
import { campusRequestsController } from './campus-requests.controller.js';
import { validateBody } from '../../shared/http/validate.js';
import { campusRequestInputSchema } from './campus-requests.validation.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const publicCampusRouter = Router();

// POST /api/public/campus-requests — Submit an institutional campus workshop request
publicCampusRouter.post(
  '/',
  validateBody(campusRequestInputSchema),
  asyncHandler((req, res) => campusRequestsController.submitCampusRequest(req, res))
);

export const adminCampusRouter = Router();

// GET /api/admin/campus-requests/export — Export CSV
adminCampusRouter.get(
  '/export',
  asyncHandler((req, res) => campusRequestsController.exportCampusRequestsCsv(req, res))
);

// GET /api/admin/campus-requests — Paginated list with search
adminCampusRouter.get(
  '/',
  asyncHandler((req, res) => campusRequestsController.getAdminCampusRequests(req, res))
);

// GET /api/admin/campus-requests/:id — Single request detail
adminCampusRouter.get(
  '/:id',
  asyncHandler((req, res) => campusRequestsController.getCampusRequestById(req, res))
);

// DELETE /api/admin/campus-requests/:id — Delete request
adminCampusRouter.delete(
  '/:id',
  asyncHandler((req, res) => campusRequestsController.deleteCampusRequest(req, res))
);
