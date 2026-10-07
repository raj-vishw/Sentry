import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestContext, type TestContext } from './helpers/testServer.js';

describe('Public docs browser', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  }, 60_000);

  afterAll(async () => {
    await ctx.teardown();
  });

  it('lists docs grouped into sections', async () => {
    const res = await request(ctx.app).get('/api/v1/public/docs');
    expect(res.status).toBe(200);
    expect(res.body.data.groups.length).toBeGreaterThan(0);
    const allSlugs = res.body.data.groups.flatMap((g: { items: { slug: string }[] }) => g.items.map((i) => i.slug));
    expect(allSlugs).toContain('getting-started');
  });

  it('serves a known doc by slug with real content', async () => {
    const res = await request(ctx.app).get('/api/v1/public/docs/getting-started');
    expect(res.status).toBe(200);
    expect(res.body.data.doc.slug).toBe('getting-started');
    expect(res.body.data.doc.title).toBe('Getting Started');
    expect(res.body.data.doc.content.length).toBeGreaterThan(0);
  });

  it('404s for an unknown slug — never attempts a filesystem lookup with it', async () => {
    const res = await request(ctx.app).get('/api/v1/public/docs/../../../../etc/passwd');
    expect(res.status).toBe(404);
  });

  it('404s for a slug that is well-formed but simply not in the allowlist', async () => {
    const res = await request(ctx.app).get('/api/v1/public/docs/not-a-real-page');
    expect(res.status).toBe(404);
  });
});
