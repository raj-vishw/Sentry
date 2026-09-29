import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs } from '@/components/ui/Tabs';
import { LeaderboardTable } from './components/LeaderboardTable';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { leaderboardService, type LeaderboardScope } from '@/services/leaderboardService';

export function LeaderboardPage() {
  return (
    <PageContainer className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
          Leaderboard
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Top operators ranked by total XP.
        </p>
      </div>

      <Tabs
        items={[
          { value: 'global', label: 'Global' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' },
        ]}
      >
        {(active) => <LeaderboardPanel scope={active as LeaderboardScope} />}
      </Tabs>
    </PageContainer>
  );
}

function LeaderboardPanel({ scope }: { scope: LeaderboardScope }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['leaderboard', scope],
    queryFn: () => leaderboardService.getLeaderboard(scope),
  });

  if (isLoading) return <LoadingSpinner label="Loading leaderboard..." />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  return <LeaderboardTable entries={data} />;
}
