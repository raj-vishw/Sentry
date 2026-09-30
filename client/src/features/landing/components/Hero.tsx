import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Sparkle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AnimatedBackground } from '@/components/animation/AnimatedBackground';
import { OrbitalRings } from '@/components/animation/OrbitalRings';
import { staggerContainer, staggerItem } from '@/components/animation/variants';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-glass-border)]">
      <AnimatedBackground className="absolute inset-0 h-full w-full" />
      <OrbitalRings className="opacity-70" />
      <div className="bg-grid-fine pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_65%)]" />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative mx-auto flex max-w-5xl flex-col items-center px-4 py-32 text-center sm:px-6 lg:py-40"
      >
        <motion.span
          variants={staggerItem}
          className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-[var(--color-accent)]"
        >
          <Sparkle className="size-3.5" aria-hidden="true" />
          An observatory for cybersecurity
        </motion.span>

        <motion.h1
          variants={staggerItem}
          className="mt-10 text-balance font-display text-5xl font-semibold leading-[1.08] tracking-tight text-[var(--color-text-primary)] sm:text-6xl lg:text-7xl"
        >
          Explore the architecture
          <br />
          <span className="text-[var(--color-accent)]">of digital security.</span>
        </motion.h1>

        <motion.p
          variants={staggerItem}
          className="mt-7 max-w-xl text-balance text-lg leading-relaxed text-[var(--color-text-secondary)]"
        >
          Investigate realistic challenges across eight domains, watch your own
          knowledge graph take shape, and see how every discovery connects to
          the next.
        </motion.p>

        <motion.div variants={staggerItem} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link to="/register">
            <Button size="lg" rightIcon={<ArrowRight className="size-4" />}>
              Enter the Observatory
            </Button>
          </Link>
          <Link to="/challenges">
            <Button size="lg" variant="outline" leftIcon={<Compass className="size-4" />}>
              Explore Challenges
            </Button>
          </Link>
        </motion.div>

        <motion.div variants={staggerItem} className="mt-16">
          <HeroConstellation />
        </motion.div>
      </motion.div>
    </section>
  );
}

/** A small, purely decorative glimpse of the interactive graph on /dashboard. */
function HeroConstellation() {
  const nodes = [
    { x: 40, y: 10, r: 3 },
    { x: 10, y: 36, r: 2.2 },
    { x: 72, y: 30, r: 2.6 },
    { x: 96, y: 8, r: 1.8 },
    { x: 58, y: 46, r: 2 },
    { x: 20, y: 4, r: 1.6 },
  ];
  return (
    <svg viewBox="0 0 106 52" className="h-12 w-auto opacity-70 sm:h-14" aria-hidden="true">
      <circle cx={53} cy={26} r={5} fill="var(--color-surface-elevated)" stroke="var(--color-accent)" strokeWidth={1} />
      {nodes.map((n, i) => (
        <line key={i} x1={53} y1={26} x2={n.x} y2={n.y} stroke="var(--color-glass-border-strong)" strokeWidth={0.6} />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={n.r} fill="var(--color-text-muted)" opacity={0.7} />
      ))}
    </svg>
  );
}
