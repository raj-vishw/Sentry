import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, FlaskConical } from 'lucide-react';
import { FadeIn } from '@/components/animation/FadeIn';

export function DemoAndDocsSection() {
  return (
    <section className="border-t border-white/10 bg-black py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FadeIn>
            <Link
              to="/demo"
              className="group flex h-full flex-col gap-3 rounded-[var(--radius-lg)] border border-white/10 bg-zinc-950 p-8 transition-colors hover:border-emerald-500/40"
            >
              <FlaskConical className="size-6 text-emerald-400" aria-hidden="true" />
              <h3 className="font-display text-xl font-semibold text-white">Try the live demo</h3>
              <p className="text-sm text-zinc-400">
                A real, running instance with demo challenges across five categories. No sign-up needed.
              </p>
              <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 group-hover:gap-2.5">
                Enter the demo <ArrowRight className="size-4 transition-transform" />
              </span>
            </Link>
          </FadeIn>

          <FadeIn delay={0.08}>
            <Link
              to="/docs"
              className="group flex h-full flex-col gap-3 rounded-[var(--radius-lg)] border border-white/10 bg-zinc-950 p-8 transition-colors hover:border-emerald-500/40"
            >
              <BookOpen className="size-6 text-emerald-400" aria-hidden="true" />
              <h3 className="font-display text-xl font-semibold text-white">Read the documentation</h3>
              <p className="text-sm text-zinc-400">
                Everything from first install to writing your own challenges and configuring the platform.
              </p>
              <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 group-hover:gap-2.5">
                Browse the docs <ArrowRight className="size-4 transition-transform" />
              </span>
            </Link>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
