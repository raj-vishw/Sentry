import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, FlaskConical, TriangleAlert } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePlatformConfigStore } from '@/stores/platformConfigStore';
import { useAuthStore } from '@/stores/authStore';

/**
 * A landing/explainer page, not a separate app experience — after
 * registering or logging in, a visitor lands in the exact same `/app` OS
 * any real deployment uses, just pointed at demo-seeded data. See
 * docs/getting-started.md and server/src/services/demo.service.ts for
 * what DEMO_MODE actually does (and doesn't do) on the backend.
 */
export function DemoLandingPage() {
  useDocumentTitle('Live Demo');
  const demoMode = usePlatformConfigStore((s) => s.config?.demoMode);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <PageContainer className="flex flex-col items-center gap-8 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
        <FlaskConical className="size-6" aria-hidden="true" />
      </div>

      <div className="max-w-xl">
        <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
          Try it before you self-host it.
        </h1>
        <p className="mt-4 text-[var(--color-text-secondary)]">
          This is a live, playable instance with real demo challenges across five categories.
          Register an account (or log in if you already have one) and explore the whole
          experience — challenges, hints, teams, leaderboard, writeups — exactly as it would
          work on your own deployment.
        </p>
      </div>

      {demoMode === false && (
        <GlassPanel className="flex max-w-xl items-start gap-3 p-4 text-left text-sm text-[var(--color-text-secondary)]">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[var(--color-warning)]" />
          <span>
            This particular deployment isn't actually running in demo mode — you're seeing this
            page, but the data here belongs to a real instance. If that's unexpected, the operator
            should remove the public <code className="font-mono text-xs">/demo</code> link.
          </span>
        </GlassPanel>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to={isAuthenticated ? '/app/dashboard' : '/register'}>
          <Button size="lg" rightIcon={<ArrowRight className="size-4" />}>
            {isAuthenticated ? 'Go to Dashboard' : 'Create a demo account'}
          </Button>
        </Link>
        <Link to="/docs/self-hosting">
          <Button size="lg" variant="outline" leftIcon={<BookOpen className="size-4" />}>
            Self-host your own
          </Button>
        </Link>
      </div>

      <p className="max-w-md text-xs text-[var(--color-text-muted)]">
        This is a public demo instance. Data may be reset periodically — don't use it for a real
        competition, and don't submit anything you wouldn't want other visitors to see.
      </p>
    </PageContainer>
  );
}
