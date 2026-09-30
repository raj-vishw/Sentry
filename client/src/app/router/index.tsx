import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { OSShell } from '@/os/OSShell';
import { useAuthStore } from '@/stores/authStore';

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

const PROTECTED_PREFIXES = ['/dashboard', '/teams', '/profile', '/admin'];

/**
 * Logged-out catch-all: a link to a protected page (shared, bookmarked, or
 * just stale) sends the visitor to login with `state.from` set, same as the
 * old RequireAuth guard did — so they land back where they meant to go
 * after authenticating. A genuinely unknown path still 404s.
 */
function PublicCatchAll() {
  const location = useLocation();
  if (PROTECTED_PREFIXES.some((p) => location.pathname.startsWith(p))) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <NotFoundPage />;
}

/**
 * The entire authenticated app lives under ONE `<Route element={<OSShell/>}>`
 * layout route — every player/admin path is a sibling leaf (rendering
 * `null`; OSShell resolves window content from the URL itself, not via
 * Outlet). This is deliberate: OSShell must mount exactly once per session.
 * Earlier this was split across multiple route branches (one per auth
 * guard, plus separate dual-purpose routes for /challenges etc.), which
 * meant React tore down and rebuilt the whole desktop — every window, the
 * dock, the top bar — on every navigation that crossed a branch boundary,
 * e.g. Dashboard -> Explore. A single shared layout route fixes that.
 */
function AuthenticatedApp() {
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'admin';

  return (
    <Routes>
      <Route element={<OSShell />}>
        <Route path="/dashboard" element={null} />
        <Route path="/challenges" element={null} />
        <Route path="/challenges/:id" element={null} />
        <Route path="/leaderboard" element={null} />
        <Route path="/teams" element={null} />
        <Route path="/profile" element={null} />
        {isAdmin && (
          <>
            <Route path="/admin" element={null} />
            <Route path="/admin/challenges" element={null} />
            <Route path="/admin/users" element={null} />
            <Route path="/admin/teams" element={null} />
            <Route path="/admin/submissions" element={null} />
            <Route path="/admin/statistics" element={null} />
          </>
        )}
        {/* Unregistered path (incl. admin paths for non-admins, "/", "/login") -> desktop. */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function PublicApp() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/challenges/:id" element={<ChallengeDetailPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Route>

      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="*" element={<PublicCatchAll />} />
    </Routes>
  );
}

export function AppRouter() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Suspense fallback={<PageFallback />}>
      {isAuthenticated ? <AuthenticatedApp /> : <PublicApp />}
    </Suspense>
  );
}
