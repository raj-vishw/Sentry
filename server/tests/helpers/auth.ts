import request from 'supertest';
import type { TestContext } from './testServer.js';

export async function registerUser(ctx: TestContext, username: string): Promise<string> {
  const res = await request(ctx.app)
    .post('/api/v1/auth/register')
    .send({
      username,
      email: `${username}@example.com`,
      password: 'SuperSecret123',
      confirmPassword: 'SuperSecret123',
    });
  return res.body.data.accessToken as string;
}

/**
 * Registers a plain user, then promotes it to ADMIN via a direct model
 * write (there's no self-serve admin signup) and re-authenticates, since
 * role is baked into the JWT and a stale token won't reflect the promotion.
 */
export async function registerAdmin(ctx: TestContext, username: string): Promise<string> {
  await registerUser(ctx, username);
  const { User } = await import('../../src/models/User.js');
  await User.updateOne({ username }, { role: 'ADMIN' });
  const res = await request(ctx.app)
    .post('/api/v1/auth/login')
    .send({ identifier: username, password: 'SuperSecret123' });
  return res.body.data.accessToken as string;
}
