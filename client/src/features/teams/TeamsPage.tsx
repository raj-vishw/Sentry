import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { TeamCard } from './components/TeamCard';
import { MyTeamPanel } from './components/MyTeamPanel';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { teamService } from '@/services/teamService';

export function TeamsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['teams'],
    queryFn: teamService.list,
  });

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner label="Loading teams..." />
      </PageContainer>
    );
  }

  if (isError || !data) {
    return (
      <PageContainer>
        <ErrorState onRetry={() => refetch()} />
      </PageContainer>
    );
  }

  const myTeam = data.find((t) => t.isMine);
  const otherTeams = data.filter((t) => !t.isMine);

  return (
    <PageContainer className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
          Teams
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Join forces with other operators to compete as a unit.
        </p>
      </div>

      {myTeam && <MyTeamPanel team={myTeam} />}

      <div>
        <h2 className="mb-4 font-display text-lg font-semibold text-[var(--color-text-primary)]">
          Discover Teams
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otherTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
