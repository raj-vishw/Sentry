import { useAuthStore } from '@/stores/authStore';

/**
 * For components shared between a public page and its OS-window
 * counterpart (challenge cards, writeup cards/view, leaderboard rows,
 * profile links, landing CTAs, ...) — an authenticated viewer should land
 * in their OS (`/app/...`), an unauthenticated one on the equivalent
 * public page (same path, no prefix). Without this, a logged-in user
 * clicking e.g. a leaderboard row would get bounced out of their OS into
 * the public profile page instead of the OS window version.
 */
export function useAppAwarePath() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return (path: string) => (isAuthenticated ? `/app${path}` : path);
}
