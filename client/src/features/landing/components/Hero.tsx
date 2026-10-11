import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, FlaskConical, Terminal } from 'lucide-react';
import { LandingButton } from './LandingButton';
import { staggerContainer, staggerItem } from '@/components/animation/variants';
import { useAuthStore } from '@/stores/authStore';
import { useAppBasePath } from '@/lib/appPath';
import { SITE_CONFIG } from '@/app/config/site';

export function Hero() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const appBasePath = useAppBasePath();

  return (
    <section className="relative overflow-hidden bg-[var(--color-bg)]">
      <div className="bg-grid-fine pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-28 text-center sm:px-6 lg:py-36"
      >
        <motion.span variants={staggerItem} className="font-mono text-xs tracking-widest text-[var(--color-accent)]">
          // self-hosted ctf platform
        </motion.span>

        <motion.h1
          variants={staggerItem}
          className="mt-7 text-balance font-display text-5xl font-bold leading-[1.1] tracking-tight text-[var(--color-text-primary)] sm:text-6xl lg:text-7xl"
        >
          run your own
          <br />
          capture the flag.
          <br />
          <span className="text-[var(--color-text-muted)]">on your terms.</span>
        </motion.h1>

        <motion.p
          variants={staggerItem}
          className="mt-6 max-w-xl text-balance text-base leading-relaxed text-[var(--color-text-secondary)]"
        >
          {SITE_CONFIG.description}
        </motion.p>

        <motion.div variants={staggerItem} className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link to={isAuthenticated ? `${appBasePath}/dashboard` : '/docs/self-hosting'}>
            <LandingButton size="lg" rightIcon={<ArrowRight className="size-4" />}>
              {isAuthenticated ? 'go to dashboard →' : 'get started →'}
            </LandingButton>
          </Link>
          <Link to="/demo">
            <LandingButton size="lg" variant="outline" leftIcon={<FlaskConical className="size-4" />}>
              try the live demo
            </LandingButton>
          </Link>
        </motion.div>

        <motion.div variants={staggerItem} className="mt-5 flex flex-col gap-3 font-mono text-xs sm:flex-row sm:gap-6">
          <Link
            to="/docs"
            className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
          >
            read the docs →
          </Link>
          <a
            href={SITE_CONFIG.githubUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
          >
            <Code2 className="size-3.5" /> view source
          </a>
        </motion.div>

        <motion.div variants={staggerItem} className="mt-16 w-full max-w-lg">
          <TerminalMockup />
        </motion.div>
      </motion.div>
    </section>
  );
}

function TerminalMockup() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] text-left shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[var(--color-border-strong)]" />
        <span className="size-2.5 rounded-full bg-[var(--color-border-strong)]" />
        <span className="size-2.5 rounded-full bg-[var(--color-border-strong)]" />
        <span className="ml-2 flex items-center gap-1.5 font-mono text-[11px] text-[var(--color-text-muted)]">
          <Terminal className="size-3" /> operator@localhost
        </span>
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed text-[var(--color-text-primary)]">
        <code>
          <span className="text-[var(--color-text-muted)]">$</span> git clone https://github.com/you/sentry.git{'\n'}
          <span className="text-[var(--color-text-muted)]">$</span> cd sentry &amp;&amp; docker compose up -d{'\n'}
          <span className="text-[var(--color-accent)]">✓ sentry is running at http://localhost:5173</span>
        </code>
      </pre>
    </div>
  );
}
