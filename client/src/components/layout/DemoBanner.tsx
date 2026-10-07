import { TriangleAlert } from 'lucide-react';
import { usePlatformConfigStore } from '@/stores/platformConfigStore';

/** Shown everywhere — public pages and inside the OS — whenever the
 * backend reports DEMO_MODE is on (an env var, never client-controlled;
 * see server/src/services/demo.service.ts). */
export function DemoBanner() {
  const demoMode = usePlatformConfigStore((s) => s.config?.demoMode);
  if (!demoMode) return null;

  return (
    <div className="relative z-[600] flex items-center justify-center gap-2 bg-[var(--color-warning)] px-4 py-1.5 text-center text-xs font-medium text-[#1a1200]">
      <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
      This is a public demo instance. Data may be reset at any time — do not use it for a real competition.
    </div>
  );
}
