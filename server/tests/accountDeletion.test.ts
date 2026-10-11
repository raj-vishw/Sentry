import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestContext, type TestContext } from './helpers/testServer.js';
import { registerUser, registerAdmin } from './helpers/auth.js';

describe('Self-service account deletion', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  }, 60_000);

  afterAll(async () => {
    await ctx.teardown();
  });

  it('rejects an unauthenticated request', async () => {
    const res = await request(ctx.app).delete('/api/v1/users/me');
    expect(res.status).toBe(401);
  });

  it('deletes a regular user account, and the old credentials no longer work', async () => {
    const token = await registerUser(ctx, 'delete_me_user');

    const res = await request(ctx.app).delete('/api/v1/users/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);

    const loginAttempt = await request(ctx.app)
      .post('/api/v1/auth/login')
      .send({ identifier: 'delete_me_user', password: 'SuperSecret123' });
    expect(loginAttempt.status).toBe(401);
  });

  it('refuses to delete an ADMIN account', async () => {
    const adminToken = await registerAdmin(ctx, 'delete_me_admin');

    const res = await request(ctx.app).delete('/api/v1/users/me').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(403);

    // Confirm it really wasn't deleted — the account can still log in.
    const prefix = process.env.ADMIN_ROUTE_PREFIX ?? 'admin';
    const loginAttempt = await request(ctx.app)
      .post(`/api/v1/${prefix}/login`)
      .send({ identifier: 'delete_me_admin', password: 'SuperSecret123' });
    expect(loginAttempt.status).toBe(200);
  });

  it('auto-disbands a solo-owned team when the owner self-deletes', async () => {
    const token = await registerUser(ctx, 'delete_solo_owner');
    await request(ctx.app)
      .post('/api/v1/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'DeleteMeSoloTeam' });

    const res = await request(ctx.app).delete('/api/v1/users/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    const lookup = await request(ctx.app).get('/api/v1/teams/deletemesoloteam');
    expect(lookup.status).toBe(404);
  });

  it('transfers ownership to the remaining member when a multi-member team owner self-deletes', async () => {
    const ownerToken = await registerUser(ctx, 'delete_team_owner');
    const created = await request(ctx.app)
      .post('/api/v1/teams')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'DeleteSuccessionTeam' });
    const inviteCode = created.body.data.team.inviteCode;

    const memberToken = await registerUser(ctx, 'delete_team_member');
    await request(ctx.app)
      .post('/api/v1/teams/join')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ inviteCode });

    const res = await request(ctx.app).delete('/api/v1/users/me').set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);

    const team = await request(ctx.app)
      .get('/api/v1/teams/deletesuccessionteam')
      .set('Authorization', `Bearer ${memberToken}`);
    expect(team.status).toBe(200);
    expect(team.body.data.team.members).toHaveLength(1);
    expect(team.body.data.team.members[0].role).toBe('OWNER');
    expect(team.body.data.team.members[0].username).toBe('delete_team_member');
  });

  it('leaves no ghost member behind when a non-owner member self-deletes', async () => {
    const ownerToken = await registerUser(ctx, 'ghost_check_owner');
    const created = await request(ctx.app)
      .post('/api/v1/teams')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'GhostCheckTeam' });
    const inviteCode = created.body.data.team.inviteCode;

    const memberToken = await registerUser(ctx, 'ghost_check_member');
    await request(ctx.app)
      .post('/api/v1/teams/join')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ inviteCode });

    const res = await request(ctx.app).delete('/api/v1/users/me').set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);

    const team = await request(ctx.app)
      .get('/api/v1/teams/ghostcheckteam')
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(team.status).toBe(200);
    expect(team.body.data.team.members).toHaveLength(1);
    expect(team.body.data.team.members[0].username).toBe('ghost_check_owner');
  });
});
