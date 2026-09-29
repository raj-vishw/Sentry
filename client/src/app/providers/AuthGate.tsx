import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';

/**
 * Attempts to silently restore a session (via the HttpOnly refresh cookie)
 * once on app boot, before any route renders. Without this, a logged-in
 * user reloading a protected page would flash through "logged out" for one
 * render — RequireAuth reads `isAuthenticated` synchronously from the
 * store, which starts empty until this resolves.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const setSession = useAuthStore((s) => s.setSession);
  const finishInitializing = useAuthStore((s) => s.finishInitializing);

  useEffect(() => {
    let cancelled = false;
    authService.restoreSession().then((result) => {
      if (cancelled) return;
      if (result) setSession(result.user, result.token);
      finishInitializing();
    });
    return () => {
      cancelled = true;
    };
    // Runs exactly once on mount — store actions are stable references.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <LoadingSpinner label="Restoring session..." />
      </div>
    );
  }

  return <>{children}</>;
}
