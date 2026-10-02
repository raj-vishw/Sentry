import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSetupStore } from '@/stores/setupStore';
import { useMaintenanceStore } from '@/stores/maintenanceStore';
import { authService } from '@/services/authService';
import { setupService } from '@/services/setupService';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { MaintenancePage } from '@/features/misc/MaintenancePage';

/**
 * Attempts to silently restore a session (via the HttpOnly refresh cookie)
 * and checks whether first-run setup still needs to happen, both once on
 * app boot, before any route renders. Without the session check, a logged-
 * in user reloading a protected page would flash through "logged out" for
 * one render — RequireAuth/AppRouter read `isAuthenticated`/`needsSetup`
 * synchronously from their stores, which start empty until this resolves.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const setSession = useAuthStore((s) => s.setSession);
  const finishInitializing = useAuthStore((s) => s.finishInitializing);
  const setNeedsSetup = useSetupStore((s) => s.setNeedsSetup);
  const maintenanceActive = useMaintenanceStore((s) => s.active);
  const [setupChecked, setSetupChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      authService.restoreSession().then((result) => {
        if (cancelled) return;
        if (result) setSession(result.user, result.token);
      }),
      setupService
        .getStatus()
        .then((status) => {
          if (cancelled) return;
          setNeedsSetup(!status.completed);
        })
        .catch(() => {
          // If this fails (e.g. the server is briefly unreachable) fall
          // back to "setup not needed" rather than stranding every visitor
          // on the wizard — the normal login/register flow still works.
          if (!cancelled) setNeedsSetup(false);
        }),
    ]).then(() => {
      if (cancelled) return;
      setSetupChecked(true);
      finishInitializing();
    });
    return () => {
      cancelled = true;
    };
    // Runs exactly once on mount — store actions are stable references.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isInitializing || !setupChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <LoadingSpinner label="Restoring session..." />
      </div>
    );
  }

  if (maintenanceActive) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
}
