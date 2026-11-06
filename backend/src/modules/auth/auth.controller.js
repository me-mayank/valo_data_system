import { authService } from './auth.service.js';
import { env } from '../../config/env.js';
import { getClientIp } from '../../shared/utils/client-ip.js';
import { hashIp } from '../../shared/utils/hash-ip.js';

export class AuthController {
  async login(req, res) {
    const ip = getClientIp(req);
    const ipHash = hashIp(ip, env.IP_HASH_SECRET);

    const { token, admin } = await authService.login({
      email: req.body.email,
      password: req.body.password,
      ipHash,
    });

    res.cookie('dv_admin', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.json({
      ok: true,
      data: {
        id: admin.id,
        email: admin.email,
      },
    });
  }

  async logout(req, res) {
    res.clearCookie('dv_admin', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.json({
      ok: true,
      data: {
        message: 'Logged out successfully',
      },
    });
  }

  async me(req, res) {
    res.json({
      ok: true,
      data: {
        id: req.admin.id,
        email: req.admin.email,
      },
    });
  }
}

export const authController = new AuthController();
