import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { ChallengeFilters, defaultFilters, type ChallengeFilterState } from './components/ChallengeFilters';
import { ChallengeCard } from './components/ChallengeCard';
import { ChallengeCardSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useChallenges } from './hooks/useChallenges';
import type { Category } from '@/types';

const PAGE_SIZE = 9;
const VALID_CATEGORIES: Category[] = ['web', 'crypto', 'forensics', 'reverse', 'pwn', 'osint', 'cloud', 'mobile'];

export function ChallengesPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<ChallengeFilterState>(() => {
    const categoryParam = searchParams.get('category');
    const category = VALID_CATEGORIES.includes(categoryParam as Category) ? (categoryParam as Category) : 'all';
    return { ...defaultFilters, category };
  });
  const [page, setPage] = useState(1);

  // Arriving from the observatory graph or command palette with a
  // ?category= link re-applies the filter even if this page instance is
  // already mounted (e.g. navigating between two category deep-links).
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && VALID_CATEGORIES.includes(categoryParam as Category)) {
      setFilters((f) => ({ ...f, category: categoryParam as Category }));
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('category')]);

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
          Explore
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Every challenge is a node in the graph — browse, filter, and follow what interests you.
        </p>
      </div>

      <ChallengeFilters filters={filters} onChange={handleFilterChange} />

      {isError && <ErrorState onRetry={() => refetch()} />}

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2 @lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ChallengeCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          icon={Flag}
          title="This region is unexplored"
          description="Nothing matches these filters yet — try widening your search."
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2 @lg:grid-cols-3">
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
