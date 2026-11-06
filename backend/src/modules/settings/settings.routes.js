import { Router } from 'express';
import { settingsController } from './settings.controller.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { validateBody } from '../../shared/http/validate.js';
import { updateSettingsSchema } from './settings.validation.js';

export const publicSettingsRouter = Router();

publicSettingsRouter.get(
  '/',
  asyncHandler((req, res) => settingsController.getPublic(req, res))
);

export const settingsRouter = Router();

settingsRouter.get(
  '/',
  asyncHandler((req, res) => settingsController.getAdmin(req, res))
);

settingsRouter.put(
  '/',
  validateBody(updateSettingsSchema),
  asyncHandler((req, res) => settingsController.updateAdmin(req, res))
);
