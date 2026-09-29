import { mockFeatures } from '../data/mockFeatures';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animation/FadeIn';

export function FeatureSection() {
  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-bg-raised)] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="max-w-xl">
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-secondary-hover)]">
            Why Breach
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
            Built for operators who want the real thing.
          </h2>
        </FadeIn>

        <StaggerContainer className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <StaggerItem key={feature.id}>
                <div className="flex h-full flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                  <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-secondary-soft)] text-[var(--color-secondary-hover)]">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">{feature.description}</p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
