import { useQuery } from '@tanstack/react-query';
import { Flag, Flame, Trophy, Zap } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatCard } from './components/StatCard';
import { CategoryProgressList } from './components/CategoryProgressList';
import { RecentSolvesList } from './components/RecentSolvesList';
import { RecommendedChallenges } from './components/RecommendedChallenges';
import { challengeService } from '@/services/challengeService';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { ErrorState } from '@/components/feedback/ErrorState';

export function DashboardPage() {
  const profileQuery = useProfile();
  const challengesQuery = useQuery({
    queryKey: ['challenges', 'recommended'],
    queryFn: challengeService.list,
  });

  const isLoading = profileQuery.isLoading || challengesQuery.isLoading;
  const isError = profileQuery.isError || challengesQuery.isError;

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner label="Loading dashboard..." />
      </PageContainer>
    );
  }

  if (isError || !profileQuery.data || !challengesQuery.data) {
    return (
      <PageContainer>
        <ErrorState onRetry={() => profileQuery.refetch()} />
      </PageContainer>
    );
  }

  const { user, recentSolves, categoryProgress } = profileQuery.data;
  const recommended = challengesQuery.data.filter((c) => !c.solved).slice(0, 3);

  return (
    <PageContainer className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent)]">
          Welcome back
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
          {user.username}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Zap} label="XP" value={user.xp.toLocaleString()} />
        <StatCard icon={Trophy} label="Global Rank" value={`#${user.rank}`} accent="secondary" />
        <StatCard icon={Flag} label="Solved" value={String(user.solvedCount)} />
        <StatCard icon={Flame} label="Streak" value={`${user.streak}d`} accent="secondary" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CategoryProgressList progress={categoryProgress} />
        <RecentSolvesList solves={recentSolves} />
      </div>

      <RecommendedChallenges challenges={recommended} />
    </PageContainer>
  );
}
