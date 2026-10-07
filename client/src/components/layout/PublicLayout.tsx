import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { Footer } from './Footer';
import { DemoBanner } from './DemoBanner';
import { AnimatedBackground } from '@/components/animation/AnimatedBackground';

/**
 * Used both as a layout route (rendering the matched child via `<Outlet/>`)
 * and directly with explicit `children` — the latter lets a dual-purpose
 * route (e.g. `/challenges`, reachable both logged-out and logged-in) reuse
 * this chrome without needing a nested `<Route>` of its own.
 */
export function PublicLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[var(--color-bg)]">
      <AnimatedBackground className="fixed inset-0 h-full w-full opacity-40" />
      <div className="bg-grid-fine pointer-events-none fixed inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      <div className="relative flex min-h-screen flex-col">
        <DemoBanner />
        <PublicNavbar />
        <main className="flex-1">
          {children ?? <Outlet />}
        </main>
        <Footer />
      </div>
    </div>
  );
}
