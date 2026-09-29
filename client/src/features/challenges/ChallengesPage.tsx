import { useMemo, useState } from 'react';
import { Flag } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { ChallengeFilters, defaultFilters, type ChallengeFilterState } from './components/ChallengeFilters';
import { ChallengeCard } from './components/ChallengeCard';
import { ChallengeCardSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useChallenges } from './hooks/useChallenges';

const PAGE_SIZE = 9;

export function ChallengesPage() {
  const [filters, setFilters] = useState<ChallengeFilterState>(defaultFilters);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useChallenges();

  const filtered = useMemo(() => {
    if (!data) return [];
    let result = data.filter((c) => {
      if (filters.search && !c.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.category !== 'all' && c.category !== filters.category) return false;
      if (filters.difficulty !== 'all' && c.difficulty !== filters.difficulty) return false;
      if (filters.solved === 'solved' && !c.solved) return false;
      if (filters.solved === 'unsolved' && c.solved) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (filters.sort) {
        case 'points-asc':
          return a.points - b.points;
        case 'points-desc':
          return b.points - a.points;
        case 'solves':
          return b.solveCount - a.solveCount;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [data, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilterChange(next: ChallengeFilterState) {
    setFilters(next);
    setPage(1);
  }

  return (
    <PageContainer className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
          Challenges
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Browse the full catalog and filter by category, difficulty, or status.
        </p>
      </div>

      <ChallengeFilters filters={filters} onChange={handleFilterChange} />

      {isError && <ErrorState onRetry={() => refetch()} />}

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ChallengeCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          icon={Flag}
          title="No challenges match your filters"
          description="Try adjusting your search or clearing filters."
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  aria-current={page === i + 1 ? 'page' : undefined}
                  className={`size-9 rounded-[var(--radius-md)] font-mono text-sm ${
                    page === i + 1
                      ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </nav>
          )}
        </>
      )}
    </PageContainer>
  );
}
