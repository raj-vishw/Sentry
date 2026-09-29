import type { LeaderboardEntry } from '@/types';
import { RankBadge, MovementIndicator } from './RankBadge';
import { formatNumber } from '@/lib/utils';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Trophy } from 'lucide-react';

export function LeaderboardTable({
  entries,
  showMovement = true,
}: {
  entries: LeaderboardEntry[];
  showMovement?: boolean;
}) {
  if (entries.length === 0) {
    return <EmptyState icon={Trophy} title="No rankings yet" description="Solve a challenge to appear here." />;
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-left text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
            <th className="px-4 py-3 font-medium">Rank</th>
            <th className="px-4 py-3 font-medium">Operator</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Team</th>
            <th className="px-4 py-3 text-right font-medium">Solved</th>
            <th className="px-4 py-3 text-right font-medium">XP</th>
            {showMovement && <th className="px-4 py-3 text-right font-medium">Δ</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.rank}
              className="border-b border-[var(--color-border)] bg-[var(--color-surface)] last:border-0 hover:bg-[var(--color-surface-hover)]"
            >
              <td className="px-4 py-3">
                <RankBadge rank={entry.rank} />
              </td>
              <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{entry.username}</td>
              <td className="hidden px-4 py-3 text-[var(--color-text-secondary)] sm:table-cell">
                {entry.teamName ?? '—'}
              </td>
              <td className="px-4 py-3 text-right text-[var(--color-text-secondary)]">
                {entry.solvedCount}
              </td>
              <td className="px-4 py-3 text-right font-mono font-medium text-[var(--color-accent)]">
                {formatNumber(entry.xp)}
              </td>
              {showMovement && (
                <td className="px-4 py-3 text-right">
                  <MovementIndicator rank={entry.rank} previousRank={entry.previousRank} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
