import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';

import { env } from './config/env.js';
import { logger } from './shared/logger.js';
import { rejectOperatorKeys } from './shared/http/reject-operator-keys.js';
import { originCheck } from './shared/http/origin-check.js';
import { healthRouter } from './shared/http/health.routes.js';
import { errorHandler } from './shared/http/error-handler.js';
import { NotFoundError } from './shared/errors/index.js';
import { eventBus } from './shared/events/event-bus.js';

// Module Public API imports for registration and routing
import { registerListeners as registerNotificationListeners } from './modules/notifications/index.js';
import { registerListeners as registerRevalidationListeners } from './modules/revalidation/index.js';
import { authRouter, requireAdmin } from './modules/auth/index.js';
import { publicCoursesRouter, coursesRouter } from './modules/courses/index.js';
import { uploadsRouter } from './modules/uploads/index.js';
import { publicSettingsRouter, settingsRouter } from './modules/settings/index.js';
import { publicLeadsRouter, adminLeadsRouter } from './modules/leads/index.js';
import { publicCampusRouter, adminCampusRouter } from './modules/campus-requests/index.js';
import { reportsRouter } from './modules/reports/index.js';

const app = express();

// 1. Trust proxy hops (derived from env)
app.set('trust proxy', env.TRUST_PROXY_HOPS);

// 2. Structured request logging (pino-http)
if (env.NODE_ENV !== 'test') {
  app.use(pinoHttp({ logger }));
}

// 3. Security headers
app.use(helmet());

// 4. CORS: restricted strictly to FRONTEND_ORIGIN with credentials enabled
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
);

// 5. Body parser with strict payload size limit (100kb)
app.use(express.json({ limit: '100kb' }));

// 6. Cookie parser
app.use(cookieParser());

// 7. Security filter: reject NoSQL operator keys ($ or .)
app.use(rejectOperatorKeys);

// 8. Security filter: verify Origin on state-changing requests
app.use(originCheck);

// 9. Health route
app.use('/api/health', healthRouter);

// 10. Public API routes
app.use('/api/public/courses', publicCoursesRouter);
app.use('/api/public/settings', publicSettingsRouter);
app.use('/api/public/leads', publicLeadsRouter);
app.use('/api/public/campus-requests', publicCampusRouter);

// 11. Admin API routes
app.use('/api/admin/auth', authRouter);
app.use('/api/admin/courses', requireAdmin, coursesRouter);
app.use('/api/admin/uploads', requireAdmin, uploadsRouter);
app.use('/api/admin/settings', requireAdmin, settingsRouter);
app.use('/api/admin/leads', requireAdmin, adminLeadsRouter);
app.use('/api/admin/campus-requests', requireAdmin, adminCampusRouter);
app.use('/api/admin/overview', requireAdmin, reportsRouter);

// Register cross-module event listeners at composition root
registerNotificationListeners(eventBus);
registerRevalidationListeners(eventBus);

// 12. 404 Catch-all handler
app.use((req, res, next) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
});

// 13. Error handling envelope middleware
app.use(errorHandler);

export { app };
