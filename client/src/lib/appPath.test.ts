import { describe, expect, it } from 'vitest';
import { isDemoAccountEmail, toAppPath, fromAppPath } from './appPath';

describe('isDemoAccountEmail', () => {
  it('recognizes the two fixed demo account emails', () => {
    expect(isDemoAccountEmail('admin@demo.invalid')).toBe(true);
    expect(isDemoAccountEmail('user@demo.invalid')).toBe(true);
  });

  it("rejects a real account's email, even one that looks similar", () => {
    expect(isDemoAccountEmail('admin@example.com')).toBe(false);
    expect(isDemoAccountEmail('someone@demo.invalid.com')).toBe(false);
    expect(isDemoAccountEmail(undefined)).toBe(false);
    expect(isDemoAccountEmail(null)).toBe(false);
  });
});

describe('toAppPath', () => {
  it('rewrites the /app prefix to /demo/app for a demo session', () => {
    expect(toAppPath('/app/dashboard', true)).toBe('/demo/app/dashboard');
    expect(toAppPath('/app/writeups/some-slug/edit', true)).toBe('/demo/app/writeups/some-slug/edit');
  });

  it('leaves a canonical path untouched for a non-demo session', () => {
    expect(toAppPath('/app/dashboard', false)).toBe('/app/dashboard');
  });
});

describe('fromAppPath', () => {
  it('strips the /demo prefix back to the canonical /app/... form', () => {
    expect(fromAppPath('/demo/app/dashboard')).toBe('/app/dashboard');
    expect(fromAppPath('/demo/app')).toBe('/app');
  });

  it('leaves a non-demo path untouched', () => {
    expect(fromAppPath('/app/dashboard')).toBe('/app/dashboard');
    expect(fromAppPath('/challenges')).toBe('/challenges');
  });
});
