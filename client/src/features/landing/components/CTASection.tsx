import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/animation/FadeIn';

export function CTASection() {
  return (
    <section id="about" className="relative overflow-hidden py-28">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)' }}
      />
      <FadeIn className="relative mx-auto flex max-w-2xl flex-col items-center px-4 text-center sm:px-6">
        <h2 className="text-balance font-display text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
          READY TO ENTER THE ARENA?
        </h2>
        <p className="mt-4 text-[var(--color-text-secondary)]">
          Create an operator identity, pick a category, and start earning XP —
          no credit card, no waitlist.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/register">
            <Button size="lg" rightIcon={<ArrowRight className="size-4" />}>
              Join the Platform
            </Button>
          </Link>
          <Link to="/challenges">
            <Button size="lg" variant="outline" leftIcon={<Compass className="size-4" />}>
              Explore Challenges
            </Button>
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}
