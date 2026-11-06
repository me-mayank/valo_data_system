import { Router } from 'express';
import { reportsController } from './reports.controller.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const reportsRouter = Router();

reportsRouter.get(
  '/',
  asyncHandler((req, res) => reportsController.getOverview(req, res))
);

reportsRouter.get(
  '/overview',
  asyncHandler((req, res) => reportsController.getOverview(req, res))
);
