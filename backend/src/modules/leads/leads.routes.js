import { Router } from 'express';
import { leadsController } from './leads.controller.js';
import { validateBody } from '../../shared/http/validate.js';
import { leadInputSchema } from './leads.validation.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const publicLeadsRouter = Router();

// POST /api/public/leads — Submit a student lead
publicLeadsRouter.post(
  '/',
  validateBody(leadInputSchema),
  asyncHandler((req, res) => leadsController.submitLead(req, res))
);

export const adminLeadsRouter = Router();

// GET /api/admin/leads/export — Export CSV
adminLeadsRouter.get(
  '/export',
  asyncHandler((req, res) => leadsController.exportLeadsCsv(req, res))
);

// GET /api/admin/leads — Paginated leads list with search & filters
adminLeadsRouter.get(
  '/',
  asyncHandler((req, res) => leadsController.getAdminLeads(req, res))
);

// GET /api/admin/leads/:id — Get single lead
adminLeadsRouter.get(
  '/:id',
  asyncHandler((req, res) => leadsController.getLeadById(req, res))
);

// DELETE /api/admin/leads/:id — Delete a lead
adminLeadsRouter.delete(
  '/:id',
  asyncHandler((req, res) => leadsController.deleteLead(req, res))
);
