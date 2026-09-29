import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/navigation/Logo';
import { AnimatedBackground } from '@/components/animation/AnimatedBackground';

export function AuthLayout({
  title,
  subtitle,
  children,
  aside,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg)] px-4 py-12">
      <AnimatedBackground className="absolute inset-0 h-full w-full opacity-70" />
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="absolute left-6 top-6 z-10">
        <Logo />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 grid w-full max-w-4xl gap-6 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-8 shadow-[var(--shadow-card)] backdrop-blur-sm sm:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">
            Operator Access
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--color-text-primary)]">
            {title}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>

        {aside && <div className="hidden lg:block">{aside}</div>}
      </motion.div>
    </div>
  );
}
