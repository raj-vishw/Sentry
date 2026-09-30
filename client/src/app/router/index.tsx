import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { OSShell } from '@/os/OSShell';
import { useAuthStore } from '@/stores/authStore';
import { RequireAuth, RequireAdmin } from './guards';

const LandingPage = lazy(() => import('@/features/landing/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('@/features/authentication/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() =>
  import('@/features/authentication/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
const ChallengesPage = lazy(() =>
  import('@/features/challenges/ChallengesPage').then((m) => ({ default: m.ChallengesPage })),
);
const ChallengeDetailPage = lazy(() =>
  import('@/features/challenges/ChallengeDetailPage').then((m) => ({ default: m.ChallengeDetailPage })),
);
const LeaderboardPage = lazy(() =>
  import('@/features/leaderboard/LeaderboardPage').then((m) => ({ default: m.LeaderboardPage })),
);
const NotFoundPage = lazy(() =>
  import('@/features/misc/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

function PageFallback() {
  return <LoadingSpinner label="Loading..." className="min-h-[60vh]" />;
}

/**
 * These three pages are reachable both logged-out (plain page, public
 * chrome) and logged-in (as an OS window) — one route registration per
 * path branches on session state rather than duplicating the path, which
 * React Router can't resolve unambiguously.
 */
function ChallengesRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? (
    <OSShell />
  ) : (
    <PublicLayout>
      <ChallengesPage />
    </PublicLayout>
  );
}

function ChallengeDetailRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? (
    <OSShell />
  ) : (
    <PublicLayout>
      <ChallengeDetailPage />
    </PublicLayout>
  );
}

function LeaderboardRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? (
    <OSShell />
  ) : (
    <PublicLayout>
      <LeaderboardPage />
    </PublicLayout>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/challenges" element={<ChallengesRoute />} />
        <Route path="/challenges/:id" element={<ChallengeDetailRoute />} />
        <Route path="/leaderboard" element={<LeaderboardRoute />} />

        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <RequireAuth>
              <OSShell />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={null} />
          <Route path="/teams" element={null} />
          <Route path="/profile" element={null} />
        </Route>

        <Route
          element={
            <RequireAdmin>
              <OSShell />
            </RequireAdmin>
          }
        >
          <Route path="/admin" element={null} />
          <Route path="/admin/challenges" element={null} />
          <Route path="/admin/users" element={null} />
          <Route path="/admin/teams" element={null} />
          <Route path="/admin/submissions" element={null} />
          <Route path="/admin/statistics" element={null} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
