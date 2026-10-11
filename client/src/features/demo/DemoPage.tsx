import { ArrowUpRight, FlaskConical, ShieldCheck, User as UserIcon } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { LandingButton } from '@/features/landing/components/LandingButton';
import { SITE_CONFIG } from '@/app/config/site';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/**
 * A plain link-out page, not an embedded/auto-login experience — the
 * demo is a fully separate, standalone deployment (own database, own
 * secrets, own backend) with no connection to this instance. This page
 * just explains that and points visitors at it.
 */
export function DemoPage() {
  useDocumentTitle('Live Demo');

  return (
    <PageContainer className="flex flex-col items-center gap-10 py-20 text-center">
      <div className="flex flex-col items-center gap-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-emerald-400">
          <FlaskConical className="size-3.5" /> Live demo
        </span>
        <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
          Try Sentry OS right now
        </h1>
        <p className="max-w-xl text-[var(--color-text-secondary)]">
          A real, running instance of the same platform — its own database, its own
          backend, its own secrets, with no connection to this site. Log in with one of
          the two published demo accounts below and explore the full player and admin
          experience.
        </p>
      </div>

      <a href={SITE_CONFIG.demoUrl} target="_blank" rel="noreferrer noopener">
        <LandingButton size="lg" rightIcon={<ArrowUpRight className="size-4" />}>
          Open the demo
        </LandingButton>
      </a>

      <div className="glass-panel grid w-full max-w-md gap-3 rounded-[var(--radius-lg)] p-5 text-left sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-elevated)] text-[var(--color-accent)]">
            <UserIcon className="size-4" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Player</p>
            <p className="font-mono text-sm text-[var(--color-text-primary)]">user / user</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-elevated)] text-[var(--color-accent)]">
            <ShieldCheck className="size-4" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Admin</p>
            <p className="font-mono text-sm text-[var(--color-text-primary)]">admin / admin</p>
          </div>
        </div>
      </div>

      <p className="max-w-md text-xs text-[var(--color-text-muted)]">
        These credentials are intentionally public. The demo's data may be reset at any
        time — don't use real credentials or sensitive information there.
      </p>
    </PageContainer>
  );
}
