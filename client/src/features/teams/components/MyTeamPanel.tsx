import { Crown, Zap } from 'lucide-react';
import type { Team } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatNumber } from '@/lib/utils';

export function MyTeamPanel({ team }: { team: Team }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{team.name}</CardTitle>
        <span className="font-mono text-xs text-[var(--color-text-muted)]">#{team.rank} global</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="inline-flex items-center gap-1.5 font-mono text-sm text-[var(--color-accent)]">
          <Zap className="size-4" /> {formatNumber(team.xp)} XP total
        </p>
        <ul className="flex flex-col divide-y divide-[var(--color-border)]">
          {team.members.map((member) => (
            <li key={member.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
              <span className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                {member.role === 'captain' && (
                  <Crown className="size-3.5 text-[var(--color-warning)]" aria-label="Captain" />
                )}
                {member.username}
              </span>
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                {formatNumber(member.xp)} XP
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
