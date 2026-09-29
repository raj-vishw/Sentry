import { motion } from 'framer-motion';
import type { CategoryMeta } from '@/lib/categories';

export function CategoryCard({ category, count }: { category: CategoryMeta; count: number }) {
  const Icon = category.icon;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
    >
      <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-[var(--color-accent)]/0 blur-2xl transition-colors duration-300 group-hover:bg-[var(--color-accent)]/10" />

      <div className="flex items-center justify-between">
        <div className="flex size-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-accent)] transition-colors group-hover:border-[var(--color-accent)]/40">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <span className="font-mono text-xs text-[var(--color-text-muted)]">{count} chall.</span>
      </div>

      <h3 className="mt-4 font-display text-lg font-semibold text-[var(--color-text-primary)]">
        {category.name}
      </h3>
      <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">{category.description}</p>
    </motion.div>
  );
}
