import { Router } from 'express';
import { authController } from './auth.controller.js';
import { requireAdmin } from './auth.middleware.js';
import { loginSchema } from './auth.validation.js';
import { validateBody } from '../../shared/http/validate.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

const router = Router();

router.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler((req, res) => authController.login(req, res))
);

router.post(
  '/logout',
  requireAdmin,
  asyncHandler((req, res) => authController.logout(req, res))
);

router.get(
  '/me',
  requireAdmin,
  asyncHandler((req, res) => authController.me(req, res))
);

export { router as authRouter };
