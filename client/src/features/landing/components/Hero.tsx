import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AnimatedBackground } from '@/components/animation/AnimatedBackground';
import { staggerContainer, staggerItem } from '@/components/animation/variants';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)]">
      <AnimatedBackground className="absolute inset-0 h-full w-full" />
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative mx-auto flex max-w-5xl flex-col items-center px-4 py-28 text-center sm:px-6 lg:py-36"
      >
        <motion.span
          variants={staggerItem}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/80 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-[var(--color-accent)] backdrop-blur-sm"
        >
          <Terminal className="size-3.5" aria-hidden="true" />
          86 live challenges · 8 categories
        </motion.span>

        <motion.h1
          variants={staggerItem}
          className="mt-8 text-balance font-display text-5xl font-bold leading-[1.05] tracking-tight text-[var(--color-text-primary)] sm:text-6xl lg:text-7xl"
        >
          BREAK THE SYSTEM.
          <br />
          <span className="text-[var(--color-accent)]">PROVE YOUR SKILL.</span>
        </motion.h1>

        <motion.p
          variants={staggerItem}
          className="mt-6 max-w-xl text-balance text-lg text-[var(--color-text-secondary)]"
        >
          Solve realistic security challenges across web, crypto, forensics, pwn, and
          more. Earn XP, climb the leaderboard, and compete against operators
          worldwide.
        </motion.p>

        <motion.div variants={staggerItem} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link to="/register">
            <Button size="lg" rightIcon={<ArrowRight className="size-4" />}>
              Enter the Arena
            </Button>
          </Link>
          <Link to="/challenges">
            <Button size="lg" variant="outline" leftIcon={<Compass className="size-4" />}>
              Explore Challenges
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
