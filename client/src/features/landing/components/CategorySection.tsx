import { CATEGORY_LIST } from '@/lib/categories';
import { mockCategoryCounts } from '../data/mockCategoryCounts';
import { StaggerContainer, StaggerItem, FadeIn } from '@/components/animation/FadeIn';
import { CategoryCard } from './CategoryCard';

export function CategorySection() {
  return (
    <section className="border-b border-[var(--color-border)] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="max-w-xl">
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent)]">
            Categories
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
            Eight disciplines. One arena.
          </h2>
          <p className="mt-3 text-[var(--color-text-secondary)]">
            Every category is built to reward genuine technique — no filler
            challenges, no guesswork.
          </p>
        </FadeIn>

        <StaggerContainer className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_LIST.map((category) => (
            <StaggerItem key={category.id}>
              <CategoryCard category={category} count={mockCategoryCounts[category.id]} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
