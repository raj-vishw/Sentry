import { Users, Zap } from 'lucide-react';
import type { Team } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatNumber } from '@/lib/utils';

export function TeamCard({ team }: { team: Team }) {
  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
              {team.name}
            </h3>
            {team.isMine && <Badge variant="accent">My Team</Badge>}
          </div>
          <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
            [{team.tag}] · Rank #{team.rank}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
        <span className="inline-flex items-center gap-1.5">
          <Zap className="size-4 text-[var(--color-accent)]" /> {formatNumber(team.xp)} XP
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="size-4" /> {team.memberCount} members
        </span>
      </div>

      {!team.isMine && (
        <Button variant="outline" size="sm" className="w-full">
          Request to Join
        </Button>
      )}
    </div>
  );
}
