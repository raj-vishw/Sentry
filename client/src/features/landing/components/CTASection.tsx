import { Link } from 'react-router-dom';
import { ArrowRight, Code2 } from 'lucide-react';
import { LandingButton } from './LandingButton';
import { FadeIn } from '@/components/animation/FadeIn';
import { useAuthStore } from '@/stores/authStore';
import { useAppBasePath } from '@/lib/appPath';
import { SITE_CONFIG } from '@/app/config/site';

export function CTASection() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const appBasePath = useAppBasePath();
  return (
    <>
      <section className="border-t border-[var(--color-border)] bg-[var(--color-bg)] py-16">
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-6 px-4 text-center sm:px-6">
          <div>
            <p className="font-mono text-4xl font-bold text-[var(--color-accent)]">8</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-[var(--color-text-muted)]">categories</p>
          </div>
          <div>
            <p className="font-mono text-4xl font-bold text-[var(--color-accent)]">∞</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-[var(--color-text-muted)]">challenges</p>
          </div>
          <div>
            <p className="font-mono text-4xl font-bold text-[var(--color-accent)]">1</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-[var(--color-text-muted)]">docker command</p>
          </div>
        </div>
      </section>

      <section id="about" className="relative overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-bg)] py-28">
        <FadeIn className="relative mx-auto flex max-w-2xl flex-col items-center px-4 text-center sm:px-6">
          <h2 className="text-balance font-display text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
            self-host your own ctf today.
          </h2>
          <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
            Clone the repo, run one command, and you have a fully working competition platform —
            on your own infrastructure, under your own control.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={isAuthenticated ? `${appBasePath}/dashboard` : '/docs/self-hosting'}>
              <LandingButton size="lg" rightIcon={<ArrowRight className="size-4" />}>
                {isAuthenticated ? 'go to dashboard →' : 'get started →'}
              </LandingButton>
            </Link>
            <a href={SITE_CONFIG.githubUrl} target="_blank" rel="noreferrer noopener">
              <LandingButton size="lg" variant="outline" leftIcon={<Code2 className="size-4" />}>
                view on github
              </LandingButton>
            </a>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
