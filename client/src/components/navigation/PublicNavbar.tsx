import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from '@/components/ui/Button';
import { PUBLIC_NAV_LINKS } from '@/app/config/site';
import { cn } from '@/lib/utils';

export function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] glass">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {PUBLIC_NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                cn(
                  'rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">
              Join
            </Button>
          </Link>
        </div>

        <button
          className="text-[var(--color-text-primary)] md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-[var(--color-border)] md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {PUBLIC_NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]"
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-[var(--color-border)] pt-4">
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Join
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
