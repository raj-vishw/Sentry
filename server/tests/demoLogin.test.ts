import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestContext, type TestContext } from './helpers/testServer.js';
import { registerAdmin } from './helpers/auth.js';

// DEMO_MODE=true only — see demoLoginDisabled.test.ts for the default-off
// path, which needs its own file (env.ts freezes its parsed config at
// first import per test file's module registry; same reasoning as
// demoReset.test.ts / demoResetEnabled.test.ts's own split).
describe('Demo-only login — DEMO_MODE enabled', () => {
  let ctx: TestContext;
  let adminToken: string;

  beforeAll(async () => {
    // Must be set before createTestContext()'s dynamic import of env.js —
    // same pattern as demoResetEnabled.test.ts.
    process.env.DEMO_MODE = 'true';
    ctx = await createTestContext();
    adminToken = await registerAdmin(ctx, 'demo_login_admin');
    // Seeds the fixed, published demo accounts this whole file depends on.
    await request(ctx.app).post('/api/v1/admin/demo/reset').set('Authorization', `Bearer ${adminToken}`);
  }, 60_000);

  afterAll(async () => {
    delete process.env.DEMO_MODE;
    await ctx.teardown();
  });

  it('authenticates the fixed demo player pair', async () => {
    const res = await request(ctx.app).post('/api/v1/auth/demo-login').send({ identifier: 'user', password: 'user' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.username).toBe('user');
    expect(res.body.data.user.role).toBe('USER');
    expect(res.body.data.accessToken).toBeTypeOf('string');
  });

  it('authenticates the fixed demo organizer pair', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/auth/demo-login')
      .send({ identifier: 'admin', password: 'password' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.username).toBe('admin');
    expect(res.body.data.user.role).toBe('ADMIN');
  });

  it('authenticates the demo player by email too', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/auth/demo-login')
      .send({ identifier: 'user@demo.invalid', password: 'user' });
    expect(res.status).toBe(200);
  });

  it('rejects the wrong password for a fixed identifier', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/auth/demo-login')
      .send({ identifier: 'admin', password: 'not-the-real-password' });
    expect(res.status).toBe(401);
  });

  it("rejects a real, validly-registered account's correct credentials — only the two fixed pairs ever work here", async () => {
    const res = await request(ctx.app).post('/api/v1/auth/demo-login').send({
      identifier: 'demo_login_admin',
      password: 'SuperSecret123',
    });
    expect(res.status).toBe(401);
  });

  it('rejects an entirely unrelated identifier', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/auth/demo-login')
      .send({ identifier: 'nobody-here', password: 'whatever123' });
    expect(res.status).toBe(401);
  });

  it('never works through the generic admin login route for the player pair (requiredRole mismatch)', async () => {
    const res = await request(ctx.app).post('/api/v1/admin/login').send({ identifier: 'user', password: 'user' });
    expect(res.status).toBe(401);
  });
});
