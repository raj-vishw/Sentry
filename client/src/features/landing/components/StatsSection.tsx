import { Flag, LayoutGrid, Target, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { publicService } from '@/services/publicService';
import { formatNumber } from '@/lib/utils';
import { FadeIn } from '@/components/animation/FadeIn';

const items = [
  { key: 'challenges', label: 'Challenges', icon: Flag },
  { key: 'categories', label: 'Categories', icon: LayoutGrid },
  { key: 'solves', label: 'Solves', icon: Target },
  { key: 'players', label: 'Players', icon: Users },
] as const;

export function StatsSection() {
  const { data } = useQuery({
    queryKey: ['public', 'stats'],
    queryFn: () => publicService.getStats(),
  });

  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-bg-raised)]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden rounded-none border-x border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-4">
        {items.map(({ key, label, icon: Icon }, i) => (
          <FadeIn key={key} delay={i * 0.05} className="bg-[var(--color-bg-raised)] px-6 py-10 text-center">
            <Icon className="mx-auto size-5 text-[var(--color-accent)]" aria-hidden="true" />
            <p className="mt-3 font-display text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
              {formatNumber(data?.[key] ?? 0)}
            </p>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
              {label}
            </p>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
