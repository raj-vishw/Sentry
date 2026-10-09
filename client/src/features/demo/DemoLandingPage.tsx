import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Fingerprint, FlaskConical, ShieldCheck, TriangleAlert, BookOpen } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthButton, AuthError } from '@/features/authentication/components/AuthPrimitives';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { PageContainer } from '@/components/layout/PageContainer';
import { ObservatoryLoader } from '@/components/feedback/ObservatoryLoader';
import { loginSchema, type LoginFormValues } from '@/features/authentication/schemas';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { usePlatformConfigStore } from '@/stores/platformConfigStore';
import { useIsDemoSession } from '@/lib/appPath';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { DEMO_USER_CREDENTIALS, DEMO_ADMIN_CREDENTIALS } from './demoCredentials';

/**
 * A real, visible login form — never an auto-login — wired to the
 * dedicated `authService.demoLogin` endpoint, which only ever
 * authenticates these two published accounts (see
 * server/src/services/auth.service.ts#demoLogin). A real registered
 * account's otherwise-valid credentials are rejected here just like any
 * other wrong password; success always lands in the `/demo/app/...`
 * section of the OS, never the real `/app/...`.
 */
export function DemoLandingPage() {
  useDocumentTitle('Live Demo');
  const navigate = useNavigate();
  const demoMode = usePlatformConfigStore((s) => s.config?.demoMode);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isDemoSession = useIsDemoSession();
  const setSession = useAuthStore((s) => s.setSession);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  // An already-authenticated visitor never sees the form — a demo session
  // goes straight back into its own OS, a real session into its own.
  useEffect(() => {
    if (!isAuthenticated) return;
    navigate(isDemoSession ? '/demo/app/dashboard' : '/app/dashboard', { replace: true });
  }, [isAuthenticated, isDemoSession, navigate]);

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      const { user, token } = await authService.demoLogin(values);
      setSession(user, token);
      navigate('/demo/app/dashboard', { replace: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Invalid demo credentials.');
    }
  }

  function quickEnter(creds: { identifier: string; password: string }) {
    setValue('identifier', creds.identifier);
    setValue('password', creds.password);
    void handleSubmit(onSubmit)();
  }

  if (demoMode === false) {
    return (
      <PageContainer className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <FlaskConical className="size-6" aria-hidden="true" />
        </div>
        <div className="max-w-xl">
          <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
            This deployment isn't running in demo mode.
          </h1>
          <p className="mt-3 text-[var(--color-text-secondary)]">
            The operator should remove this public /demo link if that's unexpected.
          </p>
        </div>
        <Link to="/docs/self-hosting">
          <Button size="lg" variant="outline" leftIcon={<BookOpen className="size-4" />}>
            Self-host your own
          </Button>
        </Link>
      </PageContainer>
    );
  }

  if (isAuthenticated) {
    return (
      <PageContainer className="flex flex-col items-center py-24">
        <ObservatoryLoader label="Entering the live demo" />
      </PageContainer>
    );
  }

  return (
    <AuthLayout
      title="Live Demo Access"
      subtitle="Only the two published accounts below can log in here — no other credentials work."
      eyebrow="Sentry OS · Demo"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {serverError && <AuthError>{serverError}</AuthError>}

        <Input
          label="Identifier"
          mono
          placeholder="user or admin"
          autoComplete="username"
          error={errors.identifier?.message}
          {...register('identifier')}
        />

        <PasswordInput
          label="Password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <AuthButton type="submit" isLoading={isSubmitting} leftIcon={<Fingerprint className="size-4" />}>
          Enter Demo
        </AuthButton>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
            leftIcon={<FlaskConical className="size-4" />}
            onClick={() => quickEnter(DEMO_USER_CREDENTIALS)}
          >
            Enter as player
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
            leftIcon={<ShieldCheck className="size-4" />}
            onClick={() => quickEnter(DEMO_ADMIN_CREDENTIALS)}
          >
            Enter as organizer
          </Button>
        </div>

        <GlassPanel className="flex items-start gap-3 p-4 text-left text-sm text-[var(--color-text-secondary)]">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[var(--color-warning)]" />
          <div className="font-mono text-xs leading-relaxed">
            <p>Player: {DEMO_USER_CREDENTIALS.identifier} / {DEMO_USER_CREDENTIALS.password}</p>
            <p>Organizer: {DEMO_ADMIN_CREDENTIALS.identifier} / {DEMO_ADMIN_CREDENTIALS.password}</p>
          </div>
        </GlassPanel>
      </form>
    </AuthLayout>
  );
}
