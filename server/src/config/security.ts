import type { CorsOptions } from 'cors';
import { env } from './env.js';

const allowedOrigins = env.CLIENT_URL.split(',').map((origin) => origin.trim());

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Allow same-origin/non-browser requests (no Origin header) and any
    // explicitly configured client origin. Never falls back to "*" — this
    // API is used with credentials (cookies), which forbids a wildcard.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

export const helmetOptions = {
  crossOriginResourcePolicy: { policy: 'cross-origin' as const },
};
