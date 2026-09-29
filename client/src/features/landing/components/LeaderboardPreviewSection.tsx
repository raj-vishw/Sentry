import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { mockLeaderboardPreview } from '@/features/leaderboard/data/mockLeaderboard';
import { LeaderboardTable } from '@/features/leaderboard/components/LeaderboardTable';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/animation/FadeIn';

export function LeaderboardPreviewSection() {
  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-bg-raised)] py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-secondary-hover)]">
              Top Operators
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
              The leaderboard is live.
            </h2>
          </div>
          <Link to="/leaderboard" className="shrink-0">
            <Button variant="outline" rightIcon={<ArrowRight className="size-4" />}>
              Full leaderboard
            </Button>
          </Link>
        </FadeIn>

        <FadeIn delay={0.1} className="mt-10">
          <LeaderboardTable entries={mockLeaderboardPreview} showMovement={false} />
        </FadeIn>
      </div>
    </section>
  );
}
