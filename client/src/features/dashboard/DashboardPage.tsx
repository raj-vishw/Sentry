import { useQuery } from '@tanstack/react-query';
import { Flag, Flame, Trophy, Zap } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatCard } from './components/StatCard';
import { CategoryProgressList } from './components/CategoryProgressList';
import { RecentSolvesList } from './components/RecentSolvesList';
import { RecommendedChallenges } from './components/RecommendedChallenges';
import { userService } from '@/services/userService';
import { challengeService } from '@/services/challengeService';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { ErrorState } from '@/components/feedback/ErrorState';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: userService.getDashboardSummary,
  });
  const progressQuery = useQuery({
    queryKey: ['dashboard-progress'],
    queryFn: userService.getCategoryProgress,
  });
  const solvesQuery = useQuery({
    queryKey: ['dashboard-solves'],
    queryFn: userService.getRecentSolves,
  });
  const challengesQuery = useQuery({
    queryKey: ['challenges', 'recommended'],
    queryFn: challengeService.list,
  });

  const isLoading =
    summaryQuery.isLoading || progressQuery.isLoading || solvesQuery.isLoading || challengesQuery.isLoading;
  const isError =
    summaryQuery.isError || progressQuery.isError || solvesQuery.isError || challengesQuery.isError;

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner label="Loading dashboard..." />
      </PageContainer>
    );
  }

  if (isError || !summaryQuery.data || !progressQuery.data || !solvesQuery.data || !challengesQuery.data) {
    return (
      <PageContainer>
        <ErrorState onRetry={() => summaryQuery.refetch()} />
      </PageContainer>
    );
  }

  const summary = summaryQuery.data;
  const recommended = challengesQuery.data.filter((c) => !c.solved).slice(0, 3);

  return (
    <PageContainer className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent)]">
          Welcome back
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
          {user?.username ?? 'Operator'}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Zap} label="XP" value={summary.xp.toLocaleString()} />
        <StatCard icon={Trophy} label="Global Rank" value={`#${summary.rank}`} accent="secondary" />
        <StatCard icon={Flag} label="Solved" value={String(summary.solvedCount)} />
        <StatCard icon={Flame} label="Streak" value={`${summary.streak}d`} accent="secondary" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CategoryProgressList progress={progressQuery.data} />
        <RecentSolvesList solves={solvesQuery.data} />
      </div>

      <RecommendedChallenges challenges={recommended} />
    </PageContainer>
  );
}
