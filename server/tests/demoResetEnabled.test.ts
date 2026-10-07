import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestContext, type TestContext } from './helpers/testServer.js';
import { registerAdmin, registerUser } from './helpers/auth.js';

describe('Demo reset — DEMO_MODE enabled', () => {
  let ctx: TestContext;
  let adminToken: string;

  beforeAll(async () => {
    // Must be set before createTestContext()'s dynamic import of env.js —
    // same pattern as adminRoutePrefix.test.ts's own override.
    process.env.DEMO_MODE = 'true';
    ctx = await createTestContext();
    adminToken = await registerAdmin(ctx, 'demo_admin_enabled');
  }, 60_000);

  afterAll(async () => {
    delete process.env.DEMO_MODE;
    await ctx.teardown();
  });

  it('wipes and reseeds demo challenges, never touching the calling admin', async () => {
    // A throwaway challenge that should NOT survive the reset.
    await request(ctx.app)
      .post('/api/v1/admin/challenges')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Should Not Survive',
        description: 'This challenge should be wiped by the demo reset.',
        category: 'web',
        difficulty: 'EASY',
        points: 100,
        flag: 'CTF{temporary}',
        published: true,
      });

    const res = await request(ctx.app)
      .post('/api/v1/admin/demo/reset')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.reset).toBe(true);

    const list = await request(ctx.app).get('/api/v1/challenges').query({ limit: 100 });
    const titles = list.body.data.challenges.map((c: { title: string }) => c.title);
    expect(titles).not.toContain('Should Not Survive');
    expect(list.body.data.pagination.total).toBeGreaterThanOrEqual(12);

    // The calling admin must still be able to authenticate — proves the
    // reset never deletes ADMIN accounts.
    const me = await request(ctx.app).get('/api/v1/users/me').set('Authorization', `Bearer ${adminToken}`);
    expect(me.status).toBe(200);
  });

  it('records an audit log entry for the reset', async () => {
    const auditLog = await request(ctx.app)
      .get('/api/v1/admin/audit-logs')
      .query({ action: 'ADMIN_RESET_DEMO' })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(auditLog.body.data.entries.length).toBeGreaterThan(0);
  });

  it('still rejects a non-admin even with DEMO_MODE enabled', async () => {
    const userToken = await registerUser(ctx, 'demo_user_enabled');
    const res = await request(ctx.app).post('/api/v1/admin/demo/reset').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});
