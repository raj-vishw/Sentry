import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, User, Users, Zap } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { FlagSubmitForm } from './components/FlagSubmitForm';
import { HintsList } from './components/HintsList';
import { challengeService } from '@/services/challengeService';
import { CATEGORY_META, DIFFICULTY_META } from '@/lib/categories';
import { FileX } from 'lucide-react';

export function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: challenge, isLoading, isError, refetch } = useQuery({
    queryKey: ['challenge', id],
    queryFn: () => challengeService.getBySlug(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner label="Loading challenge..." />
      </PageContainer>
    );
  }

  if (isError || !challenge) {
    return (
      <PageContainer>
        <ErrorState title="Challenge not found" description="This challenge may have been removed." onRetry={() => refetch()} />
      </PageContainer>
    );
  }

  const category = CATEGORY_META[challenge.category];
  const difficulty = DIFFICULTY_META[challenge.difficulty];
  const CategoryIcon = category.icon;

  return (
    <PageContainer className="flex flex-col gap-6">
      <Link
        to="/challenges"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      >
        <ArrowLeft className="size-4" /> Back to challenges
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">
                <CategoryIcon className="size-3.5" /> {category.name}
              </Badge>
              <Badge style={{ color: difficulty.color }}>{difficulty.label}</Badge>
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold text-[var(--color-text-primary)]">
              {challenge.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-secondary)]">
              <span className="inline-flex items-center gap-1 font-mono text-[var(--color-accent)]">
                <Zap className="size-4" /> {challenge.points} XP
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="size-4" /> {challenge.solveCount} solves
              </span>
              <span className="inline-flex items-center gap-1">
                <User className="size-4" /> {challenge.author}
              </span>
            </div>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="font-display text-base font-semibold text-[var(--color-text-primary)]">
              Description
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {challenge.description}
            </p>
          </div>

          <div>
            <h2 className="mb-3 font-display text-base font-semibold text-[var(--color-text-primary)]">
              Files
            </h2>
            {challenge.files.length === 0 ? (
              <EmptyState icon={FileX} title="No files for this challenge" />
            ) : (
              <ul className="flex flex-col gap-2">
                {challenge.files.map((file) => (
                  <li key={file.id}>
                    <a
                      href={file.url}
                      className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm hover:border-[var(--color-accent)]/50"
                    >
                      <span className="font-mono text-[var(--color-text-primary)]">{file.name}</span>
                      <span className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)]">
                        {file.sizeKb.toLocaleString()} KB
                        <Download className="size-3.5" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {challenge.hints.length > 0 && (
            <div>
              <h2 className="mb-3 font-display text-base font-semibold text-[var(--color-text-primary)]">
                Hints
              </h2>
              <HintsList hints={challenge.hints} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="font-display text-base font-semibold text-[var(--color-text-primary)]">
              Submit Flag
            </h2>
            <div className="mt-3">
              <FlagSubmitForm challengeId={challenge.id} solved={challenge.solved} />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
