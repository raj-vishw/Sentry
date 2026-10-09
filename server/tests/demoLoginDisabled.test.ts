import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestContext, type TestContext } from './helpers/testServer.js';
import { registerUser } from './helpers/auth.js';

// DEMO_MODE defaults to false (pinned in testServer.ts) — this file
// deliberately does NOT override it, so it exercises the "inert on every
// non-demo deployment" behavior. See demoLogin.test.ts for the
// DEMO_MODE=true path, which needs its own file (env.ts freezes its
// parsed config at first import per test file's module registry).
describe('Demo-only login — DEMO_MODE disabled (the default)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
    // A real account sharing the fixed demo player's username — confirms
    // demo-login 404s even when such an account exists on this deployment,
    // rather than ever falling through to authenticate it.
    await registerUser(ctx, 'user');
  }, 60_000);

  afterAll(async () => {
    await ctx.teardown();
  });

  it('404s regardless of credentials — a no-op on a real production deployment', async () => {
    const res = await request(ctx.app).post('/api/v1/auth/demo-login').send({ identifier: 'user', password: 'user' });
    expect(res.status).toBe(404);
  });
});
