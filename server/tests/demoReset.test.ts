import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestContext, type TestContext } from './helpers/testServer.js';
import { registerAdmin, registerUser } from './helpers/auth.js';

// DEMO_MODE defaults to false (pinned in testServer.ts) — this file
// deliberately does NOT override it, so it exercises the "inert on every
// non-demo deployment" behavior. See demoResetEnabled.test.ts for the
// DEMO_MODE=true path, which needs its own file (env.ts freezes its
// parsed config at first import per test file's module registry).
describe('Demo reset — DEMO_MODE disabled (the default)', () => {
  let ctx: TestContext;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    ctx = await createTestContext();
    adminToken = await registerAdmin(ctx, 'demo_admin');
    userToken = await registerUser(ctx, 'demo_user');
  }, 60_000);

  afterAll(async () => {
    await ctx.teardown();
  });

  it('404s for an admin when DEMO_MODE is disabled — the route is inert', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/admin/demo/reset')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('rejects a non-admin before DEMO_MODE is even considered', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/admin/demo/reset')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});
