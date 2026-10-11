import { FEATURES } from '../data/features';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animation/FadeIn';

export function FeatureSection() {
  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-bg)] py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="font-mono text-xs text-[var(--color-text-muted)]">
            <span className="text-[var(--color-accent)]">$</span> ls ./sentry --features
          </p>
        </FadeIn>

        <StaggerContainer className="mt-8 flex flex-col">
          {FEATURES.map((feature, i) => (
            <StaggerItem key={feature.id}>
              <div className="flex gap-6 border-b border-[var(--color-border)] py-5 last:border-0">
                <span className="w-6 shrink-0 font-mono text-xs text-[var(--color-text-muted)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
                  <h3 className="w-full shrink-0 font-mono text-sm font-bold text-[var(--color-text-primary)] sm:w-56">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">{feature.description}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
