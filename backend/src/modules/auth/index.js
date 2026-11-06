import { authRouter } from './auth.routes.js';
import { requireAdmin } from './auth.middleware.js';
import { authService } from './auth.service.js';
import { Admin } from './auth.model.js';

export const createAdmin = (data) => authService.createAdmin(data);

export { authRouter, requireAdmin, Admin, authService };
