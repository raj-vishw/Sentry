import type { Challenge } from '@/types';
import { ChallengeCard } from '@/features/challenges/components/ChallengeCard';

export function RecommendedChallenges({ challenges }: { challenges: Challenge[] }) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
        Recommended for you
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </div>
  );
}
