import type { Challenge } from '@/types';
import { ChallengeCard } from '@/features/challenges/components/ChallengeCard';

export function RecommendedChallenges({ challenges }: { challenges: Challenge[] }) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
        Recommended for you
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </div>
  );
}
