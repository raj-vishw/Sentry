import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Search } from 'lucide-react';
import { PublicWordmark } from './PublicWordmark';
import { PublicThemeToggle } from './PublicThemeToggle';
import { BracketLabel } from '@/components/ui/BracketLabel';
import { PUBLIC_NAV_LINKS } from '@/app/config/site';
import { cn } from '@/lib/utils';
import { useCommandPalette } from '@/features/search/CommandPaletteProvider';
import { useAuthStore } from '@/stores/authStore';
import { useAppBasePath } from '@/lib/appPath';

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const { open: openPalette } = useCommandPalette();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const appBasePath = useAppBasePath();

  return (
    <header className="sticky top-0 z-40">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)] px-5 sm:px-8">
        <PublicWordmark />

        <div className="hidden items-center gap-8 font-mono text-xs uppercase tracking-widest md:flex">
          {PUBLIC_NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                cn(
                  'transition-colors',
                  isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={openPalette}
            aria-label="Search (Ctrl+K)"
            className="flex items-center gap-2 border border-[var(--color-border-strong)] px-3 py-2 font-mono text-[11px] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)]/50 hover:text-[var(--color-text-secondary)]"
          >
            <Search className="size-3.5" />
            <span>⌘K</span>
          </button>
          <PublicThemeToggle />
          {isAuthenticated ? (
            <Link
              to={`${appBasePath}/dashboard`}
              className="border border-[var(--color-border-strong)] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-accent)]"
            >
              <BracketLabel>Dashboard</BracketLabel>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="border border-[var(--color-border-strong)] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-accent)]"
              >
                <BracketLabel>Login</BracketLabel>
              </Link>
              <Link
                to="/register"
                className="bg-[var(--color-accent)] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-inverse)] transition-colors hover:bg-[var(--color-accent-hover)]"
              >
                <BracketLabel>Join</BracketLabel>
              </Link>
            </>
          )}
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-bg)] md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4 font-mono text-xs uppercase tracking-widest">
              {PUBLIC_NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="px-1 py-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-2 flex items-center justify-between gap-2">
                <PublicThemeToggle className="flex-1 justify-center" />
              </div>
              {isAuthenticated ? (
                <Link
                  to={`${appBasePath}/dashboard`}
                  onClick={() => setOpen(false)}
                  className="mt-2 border border-[var(--color-border-strong)] px-4 py-2.5 text-center font-bold text-[var(--color-text-primary)]"
                >
                  <BracketLabel>Dashboard</BracketLabel>
                </Link>
              ) : (
                <div className="mt-2 flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="border border-[var(--color-border-strong)] px-4 py-2.5 text-center font-bold text-[var(--color-text-primary)]"
                  >
                    <BracketLabel>Login</BracketLabel>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="bg-[var(--color-accent)] px-4 py-2.5 text-center font-bold text-[var(--color-text-inverse)]"
                  >
                    <BracketLabel>Join</BracketLabel>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
