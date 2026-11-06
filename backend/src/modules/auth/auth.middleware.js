import { authService } from './auth.service.js';
import { UnauthorizedError } from '../../shared/errors/index.js';

/**
 * Express middleware that verifies the dv_admin session cookie or Bearer token.
 * Attaches decoded admin payload to req.admin.
 * Uses promise .then/.catch to cleanly deliver errors to next(err) without hanging.
 */
export const requireAdmin = (req, res, next) => {
  let token = req.cookies?.dv_admin;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7).trim();
  }

  if (!token) {
    return next(new UnauthorizedError('Authentication required'));
  }

  authService
    .verifyToken(token)
    .then((admin) => {
      req.admin = admin;
      next();
    })
    .catch((err) => {
      next(err);
    });
};
