import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Express } from 'express';

export interface TestContext {
  app: Express;
  teardown: () => Promise<void>;
}

/**
 * Boots an isolated in-memory MongoDB instance and a fresh copy of the
 * Express app pointed at it. Env vars are set before the first (dynamic)
 * import of anything under src/, since env.ts validates and freezes them
 * at import time.
 */
export async function createTestContext(): Promise<TestContext> {
  process.env.NODE_ENV = 'test';
  process.env.PORT = '4099';
  process.env.JWT_SECRET = 'test-access-secret-not-for-production-use-only';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-not-for-production-use-only';
  process.env.JWT_ACCESS_EXPIRES_IN = '15m';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  process.env.CLIENT_URL = 'http://localhost:5173';

  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();

  const { connectDatabase, disconnectDatabase } = await import('../../src/config/database.js');
  await connectDatabase();
  const { createApp } = await import('../../src/app.js');
  const app = createApp();

  return {
    app,
    teardown: async () => {
      await disconnectDatabase();
      await mongod.stop();
    },
  };
}
