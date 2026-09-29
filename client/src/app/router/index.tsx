import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AppShell } from '@/components/layout/AppShell';
import { AdminShell } from '@/components/layout/AdminShell';
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
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const TeamsPage = lazy(() => import('@/features/teams/TeamsPage').then((m) => ({ default: m.TeamsPage })));
const ProfilePage = lazy(() =>
  import('@/features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const AdminDashboardPage = lazy(() =>
  import('@/features/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
);
const AdminChallengesPage = lazy(() =>
  import('@/features/admin/AdminChallengesPage').then((m) => ({ default: m.AdminChallengesPage })),
);
const AdminUsersPage = lazy(() =>
  import('@/features/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })),
);
const AdminTeamsPage = lazy(() =>
  import('@/features/admin/AdminTeamsPage').then((m) => ({ default: m.AdminTeamsPage })),
);
const AdminSubmissionsPage = lazy(() =>
  import('@/features/admin/AdminSubmissionsPage').then((m) => ({ default: m.AdminSubmissionsPage })),
);
const AdminStatisticsPage = lazy(() =>
  import('@/features/admin/AdminStatisticsPage').then((m) => ({ default: m.AdminStatisticsPage })),
);
const NotFoundPage = lazy(() =>
  import('@/features/misc/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

function PageFallback() {
  return <LoadingSpinner label="Loading..." className="min-h-[60vh]" />;
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/challenges/:id" element={<ChallengeDetailPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Route>

        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route
          element={
            <RequireAdmin>
              <AdminShell />
            </RequireAdmin>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/challenges" element={<AdminChallengesPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/teams" element={<AdminTeamsPage />} />
          <Route path="/admin/submissions" element={<AdminSubmissionsPage />} />
          <Route path="/admin/statistics" element={<AdminStatisticsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
