import { NavLink } from 'react-router-dom';
import { NAV_ICON_MAP } from '@/lib/navIcons';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';

export interface SidebarNavLink {
  label: string;
  href: string;
  icon: string;
}

export function Sidebar({
  links,
  badge,
  accent = 'accent',
}: {
  links: readonly SidebarNavLink[];
  badge: string;
  accent?: 'accent' | 'secondary';
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-raised)] lg:flex">
      <div className="flex h-16 items-center gap-3 border-b border-[var(--color-border)] px-5">
        <Logo to={badge === 'ADMIN' ? '/admin' : '/dashboard'} />
      </div>

      <div className="px-5 pt-4">
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest',
            accent === 'accent'
              ? 'border-[var(--color-accent-muted)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
              : 'border-[var(--color-secondary-muted)] bg-[var(--color-secondary-soft)] text-[var(--color-secondary-hover)]',
          )}
        >
          {badge}
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {links.map((link) => {
          const Icon = NAV_ICON_MAP[link.icon];
          return (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === '/admin'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]',
                )
              }
            >
              {Icon && <Icon className="size-[18px]" aria-hidden="true" />}
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
