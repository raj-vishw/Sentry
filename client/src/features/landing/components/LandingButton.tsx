import type { HTMLAttributes, ReactNode } from 'react';
import { BracketLabel } from '@/components/ui/BracketLabel';
import { cn } from '@/lib/utils';

/**
 * The landing page's own button style — deliberately NOT the shared
 * `Button` component, since that one reads `--color-accent` from the OS
 * scope, which an admin's branding config can override via an inline
 * style on <html> (AuthGate.tsx's applyBranding()). This button instead
 * reads the same CSS variables from inside the `.theme-public` scope
 * (tokens.css), which is its own fixed identity that a descendant class
 * always wins over that inline override — so it still re-themes for free
 * from one source of truth, it just can't be shifted by per-instance
 * branding.
 */
export function LandingButton({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  children,
  ...props
}: {
  variant?: 'primary' | 'outline';
  size?: 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-mono font-bold transition-colors',
        size === 'lg' ? 'h-12 px-6 text-sm' : 'h-11 px-5 text-xs',
        variant === 'primary'
          ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-hover)]'
          : 'border border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]',
        className,
      )}
      {...props}
    >
      <BracketLabel>
        {leftIcon}
        {children}
        {rightIcon}
      </BracketLabel>
    </span>
  );
}
