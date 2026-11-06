import { Router } from 'express';
import { uploadsController } from './uploads.controller.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

const router = Router();

router.post('/sign', asyncHandler((req, res) => uploadsController.sign(req, res)));

export { router as uploadsRouter };
