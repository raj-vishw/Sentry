import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { NAV_ICON_MAP } from '@/lib/navIcons';
import type { SidebarNavLink } from './Sidebar';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';

export function MobileNav({
  open,
  onClose,
  links,
}: {
  open: boolean;
  onClose: () => void;
  links: readonly SidebarNavLink[];
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-raised)]"
          >
            <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-5">
              <Logo />
              <button onClick={onClose} aria-label="Close menu" className="text-[var(--color-text-muted)]">
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
              {links.map((link) => {
                const Icon = NAV_ICON_MAP[link.icon];
                return (
                  <NavLink
                    key={link.href}
                    to={link.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium',
                        isActive
                          ? 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]',
                      )
                    }
                  >
                    {Icon && <Icon className="size-[18px]" aria-hidden="true" />}
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
