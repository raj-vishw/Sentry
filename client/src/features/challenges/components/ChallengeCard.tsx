import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Users, Zap } from 'lucide-react';
import type { Challenge } from '@/types';
import { CATEGORY_META, DIFFICULTY_META } from '@/lib/categories';
import { cn } from '@/lib/utils';

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const category = CATEGORY_META[challenge.category];
  const difficulty = DIFFICULTY_META[challenge.difficulty];
  const Icon = category.icon;

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
      <Link
        to={`/challenges/${challenge.slug}`}
        className={cn(
          'group flex h-full flex-col gap-4 rounded-[var(--radius-lg)] border p-5',
          'border-[var(--color-border)] bg-[var(--color-surface)]',
          'transition-colors duration-[var(--duration-base)] hover:border-[var(--color-accent)]/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
        )}
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-[var(--color-text-secondary)]">
            <Icon className="size-3.5" aria-hidden="true" />
            {category.name}
          </span>
          {challenge.solved && (
            <CheckCircle2 className="size-5 text-[var(--color-success)]" aria-label="Solved" />
          )}
        </div>

        <div>
          <h3 className="font-display text-base font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)]">
            {challenge.title}
          </h3>
          <p
            className="mt-1 font-mono text-xs font-medium uppercase tracking-wide"
            style={{ color: difficulty.color }}
          >
            {difficulty.label}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-muted)]">
          <span className="inline-flex items-center gap-1 font-mono font-medium text-[var(--color-accent)]">
            <Zap className="size-3.5" aria-hidden="true" />
            {challenge.points} XP
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" aria-hidden="true" />
            {challenge.solveCount} solves
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
