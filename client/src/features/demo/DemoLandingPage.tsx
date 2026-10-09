import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, FlaskConical, TriangleAlert } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { ObservatoryLoader } from '@/components/feedback/ObservatoryLoader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePlatformConfigStore } from '@/stores/platformConfigStore';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { DEMO_USER_CREDENTIALS } from './demoCredentials';

/**
 * No credential-picker landing page — matches how a public CTFd demo
 * works: visiting /demo drops you straight into the live platform,
 * already logged in as the published player account. Switching to the
 * organizer view happens from inside the OS (see TopBar's demo toggle),
 * not from a second screen here.
 *
 * An already-authenticated visitor (any account) keeps their own session
 * — this never clobbers a real login just because someone followed a
 * /demo link.
 */
export function DemoLandingPage() {
  useDocumentTitle('Live Demo');
  const navigate = useNavigate();
  const demoMode = usePlatformConfigStore((s) => s.config?.demoMode);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setSession = useAuthStore((s) => s.setSession);
  const [failed, setFailed] = useState(false);
  const attempted = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/dashboard', { replace: true });
      return;
    }
    if (attempted.current) return;
    attempted.current = true;

    authService
      .login(DEMO_USER_CREDENTIALS)
      .then(({ user, token }) => {
        setSession(user, token);
        navigate('/app/dashboard', { replace: true });
      })
      .catch(() => setFailed(true));
  }, [isAuthenticated, navigate, setSession]);

  if (!failed) {
    return (
      <PageContainer className="flex flex-col items-center py-24">
        <ObservatoryLoader label="Entering the live demo" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
        <FlaskConical className="size-6" aria-hidden="true" />
      </div>

      <div className="max-w-xl">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
          Couldn't enter the live demo.
        </h1>
        <p className="mt-3 text-[var(--color-text-secondary)]">
          {demoMode === false
            ? "This deployment isn't actually running in demo mode — the operator should remove this public /demo link if that's unexpected."
            : 'The published demo account could not log in. The operator may need to re-run the demo seed.'}
        </p>
      </div>

      {demoMode === false && (
        <GlassPanel className="flex max-w-xl items-start gap-3 p-4 text-left text-sm text-[var(--color-text-secondary)]">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[var(--color-warning)]" />
          <span>You're seeing this page, but the data here belongs to a real instance.</span>
        </GlassPanel>
      )}

      <Link to="/docs/self-hosting">
        <Button size="lg" variant="outline" leftIcon={<BookOpen className="size-4" />}>
          Self-host your own
        </Button>
      </Link>
    </PageContainer>
  );
}
