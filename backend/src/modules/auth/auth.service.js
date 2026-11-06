import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { authRepository } from './auth.repository.js';
import { env } from '../../config/env.js';
import {
  UnauthorizedError,
  ConflictError,
} from '../../shared/errors/index.js';
import { checkRateLimit } from '../../shared/rate-limit/rate-limit.service.js';
import { createAdminSchema } from './auth.validation.js';

// Pre-computed valid bcrypt hash for constant-time dummy compare when user not found
const DUMMY_BCRYPT_HASH = '$2a$12$e86g5D5w8B2l4N9v2K7xYe4R5t6Y7u8I9o0P1a2S3d4F5g6H7j8K9';

export class AuthService {
  /**
   * Authenticates admin with rate limiting, timing-safe bcrypt compare, and JWT issuance.
   * @param {{ email: string, password: string, ipHash: string }} params
   * @returns {Promise<{ token: string, admin: { id: string, email: string } }>}
   */
  async login({ email, password, ipHash }) {
    // 1. Rate limit: 5 attempts per 15 minutes per IP hash
    await checkRateLimit({
      ipHash,
      route: '/api/admin/auth/login',
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
    });

    const normalizedEmail = email.toLowerCase().trim();
    const admin = await authRepository.findByEmail(normalizedEmail);

    let isMatch = false;
    if (admin) {
      isMatch = await bcrypt.compare(password, admin.passwordHash);
    } else {
      // Dummy compare to avoid timing leak for unknown accounts
      await bcrypt.compare(password, DUMMY_BCRYPT_HASH);
    }

    if (!admin || !isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    // 2. Issue JWT (jose HS256, 8-hour expiry)
    const secret = new TextEncoder().encode(env.AUTH_SECRET);
    const token = await new SignJWT({
      sub: admin._id.toString(),
      email: admin.email,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(secret);

    return {
      token,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
      },
    };
  }

  /**
   * Verifies an auth token.
   * @param {string} token
   * @returns {Promise<{ id: string, email: string }>}
   */
  async verifyToken(token) {
    try {
      const secret = new TextEncoder().encode(env.AUTH_SECRET);
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ['HS256'],
      });

      if (!payload.sub || !payload.email) {
        throw new UnauthorizedError('Invalid token payload');
      }

      return {
        id: payload.sub,
        email: payload.email,
      };
    } catch (err) {
      if (err instanceof UnauthorizedError) throw err;
      throw new UnauthorizedError('Invalid or expired session');
    }
  }

  /**
   * Idempotently creates an admin account (used by seed:admin).
   * @param {{ email: string, password: string }} param0
   */
  async createAdmin({ email, password }) {
    createAdminSchema.parse({ email, password });

    const existing = await authRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError(`Admin with email ${email} already exists`);
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    return authRepository.create({
      email,
      passwordHash,
    });
  }
}

export const authService = new AuthService();
