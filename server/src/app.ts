import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { pinoHttp } from 'pino-http';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { corsOptions, helmetOptions } from './config/security.js';
import { logger } from './utils/logger.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import { sendSuccess } from './utils/response.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import challengeRoutes from './routes/challenge.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import teamRoutes from './routes/team.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { VERSION } from './version.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet(helmetOptions));
  app.use(cors(corsOptions));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(
    pinoHttp({
      logger,
      genReqId: (req: IncomingMessage, res: ServerResponse) => {
        const id = (req.headers['x-request-id'] as string) || randomUUID();
        res.setHeader('X-Request-Id', id);
        return id;
      },
      customLogLevel: (_req: IncomingMessage, res: ServerResponse, err?: Error) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
      // Passwords/flags/tokens are redacted centrally in the logger config.
      serializers: {
        req: (req) => ({ method: req.method, url: req.url, id: req.id }),
      },
    }),
  );

  app.use('/api', apiLimiter);

  app.get('/api/health', (_req, res) => {
    sendSuccess(res, {
      status: 'healthy',
      version: VERSION,
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/challenges', challengeRoutes);
  app.use('/api/v1/challenges', submissionRoutes);
  app.use('/api/v1/teams', teamRoutes);
  app.use('/api/v1/leaderboard', leaderboardRoutes);
  app.use('/api/v1/admin', adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
