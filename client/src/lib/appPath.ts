import { useAuthStore } from '@/stores/authStore';
import { DEMO_ADMIN_EMAIL, DEMO_USER_EMAIL } from '@/features/demo/demoCredentials';

/**
 * A demo session is recognized purely by which fixed account is logged
 * in (the two accounts seeded by server/src/scripts/seedDemo.ts), not by
 * the current URL or any persisted flag — this works identically right
 * after login and after a page-reload session restore, since both paths
 * populate the same `user` object.
 */
export function isDemoAccountEmail(email?: string | null): boolean {
  return email === DEMO_ADMIN_EMAIL || email === DEMO_USER_EMAIL;
}

export function useIsDemoSession(): boolean {
  return useAuthStore((s) => isDemoAccountEmail(s.user?.email));
}

/** The authenticated OS lives at `/app` normally, `/demo/app` for a demo session. */
export function useAppBasePath(): '/app' | '/demo/app' {
  return useIsDemoSession() ? '/demo/app' : '/app';
}

/** Rewrites a canonical `/app/...` path to `/demo/app/...` when `isDemo` is true. */
export function toAppPath(canonicalPath: string, isDemo: boolean): string {
  return isDemo ? canonicalPath.replace(/^\/app/, '/demo/app') : canonicalPath;
}

/** The inverse of `toAppPath` — strips a `/demo` prefix back to the canonical `/app/...` form. */
export function fromAppPath(pathname: string): string {
  return pathname.startsWith('/demo/app') ? pathname.slice('/demo'.length) : pathname;
}

/**
 * For components shared between a public page and its OS-window
 * counterpart (challenge cards, writeup cards/view, leaderboard rows,
 * profile links, landing CTAs, ...) — an authenticated viewer should land
 * in their OS (`/app/...`, or `/demo/app/...` for a demo session), an
 * unauthenticated one on the equivalent public page (same path, no
 * prefix). Without this, a logged-in user clicking e.g. a leaderboard row
 * would get bounced out of their OS into the public profile page instead
 * of the OS window version.
 */
export function useAppAwarePath() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const basePath = useAppBasePath();
  return (path: string) => (isAuthenticated ? `${basePath}${path}` : path);
}
