import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Logo({ className, to = '/' }: { className?: string; to?: string }) {
  return (
    <Link
      to={to}
      className={cn('group inline-flex items-center gap-2 font-display font-semibold', className)}
    >
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="var(--color-bg-raised)" />
        <path
          d="M16 6L26 11V17C26 23 21.5 26.5 16 28C10.5 26.5 6 23 6 17V11L16 6Z"
          stroke="var(--color-accent)"
          strokeWidth="1.6"
          strokeLinejoin="round"
          className="transition-all duration-300 group-hover:stroke-[var(--color-accent-hover)]"
        />
        <path
          d="M12 16.5L15 19.5L20.5 13"
          stroke="var(--color-accent)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-lg tracking-tight text-[var(--color-text-primary)]">Breach</span>
    </Link>
  );
}
