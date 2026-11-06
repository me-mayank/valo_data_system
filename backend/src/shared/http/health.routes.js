import { Router } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from './async-handler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    // Check if Mongoose connection is connected
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
      return res.status(503).json({
        ok: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Database is not connected',
        },
      });
    }

    try {
      await mongoose.connection.db.admin().ping();
      return res.status(200).json({
        ok: true,
        data: {
          status: 'up',
        },
      });
    } catch {
      return res.status(503).json({
        ok: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Database ping failed',
        },
      });
    }
  })
);

export { router as healthRouter };

