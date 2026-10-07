import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { challengeService } from '@/services/challengeService';
import { ChallengeCard } from '@/features/challenges/components/ChallengeCard';
import { Button } from '@/components/ui/Button';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animation/FadeIn';
import { ObservatoryLoader } from '@/components/feedback/ObservatoryLoader';
import { useAppAwarePath } from '@/lib/appPath';

export function ChallengePreviewSection() {
  const toPath = useAppAwarePath();
  const { data, isLoading } = useQuery({
    queryKey: ['challenges', 'preview'],
    queryFn: () => challengeService.list({ limit: 3, sort: 'newest' }),
  });
  const preview = data?.challenges ?? [];

  return (
    <section className="border-b border-[var(--color-border)] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent)]">
              Live Challenges
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
              A taste of the arena.
            </h2>
          </div>
          <Link to={toPath('/challenges')} className="shrink-0">
            <Button variant="outline" rightIcon={<ArrowRight className="size-4" />}>
              View all challenges
            </Button>
          </Link>
        </FadeIn>

        {isLoading ? (
          <div className="mt-12">
            <ObservatoryLoader label="Loading" />
          </div>
        ) : (
          <StaggerContainer className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {preview.map((challenge) => (
              <StaggerItem key={challenge.id}>
                <ChallengeCard challenge={challenge} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </section>
  );
}
