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

  it('strips the leading H1 — the page already renders doc.title as its heading', async () => {
    const res = await request(ctx.app).get('/api/v1/public/docs/self-hosting');
    expect(res.status).toBe(200);
    expect(res.body.data.doc.content.trim().startsWith('#')).toBe(false);
  });

  it('rewrites a relative markdown link to another known doc into an in-app /docs/:slug link', async () => {
    const res = await request(ctx.app).get('/api/v1/public/docs/self-hosting');
    expect(res.status).toBe(200);
    expect(res.body.data.doc.content).toContain('(/docs/getting-started)');
  });

  it('never ships a link the in-app browser cannot open: every doc page is free of raw .md link targets', async () => {
    const res = await request(ctx.app).get('/api/v1/public/docs');
    const allSlugs: string[] = res.body.data.groups.flatMap((g: { items: { slug: string }[] }) => g.items.map((i) => i.slug));
    for (const slug of allSlugs) {
      const docRes = await request(ctx.app).get(`/api/v1/public/docs/${slug}`);
      expect(docRes.body.data.doc.content).not.toMatch(/\]\([^)]*\.md[^)]*\)/);
    }
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
