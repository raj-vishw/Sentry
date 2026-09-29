import { Link } from 'react-router-dom';
import { Code2, AtSign, MessagesSquare } from 'lucide-react';
import { Logo } from '@/components/navigation/Logo';
import { SITE_CONFIG } from '@/app/config/site';

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-raised)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-[var(--color-text-secondary)]">
              {SITE_CONFIG.description}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Platform
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              <li>
                <Link to="/challenges" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                  Challenges
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/#about" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Account
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              <li>
                <Link to="/login" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                  Create account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Community
            </h3>
            <div className="mt-4 flex gap-3">
              <a
                href={SITE_CONFIG.githubUrl}
                className="flex size-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
                aria-label="GitHub"
              >
                <Code2 className="size-4" />
              </a>
              <a
                href={SITE_CONFIG.socials.twitter}
                className="flex size-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
                aria-label="Twitter"
              >
                <AtSign className="size-4" />
              </a>
              <a
                href={SITE_CONFIG.socials.discord}
                className="flex size-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
                aria-label="Discord"
              >
                <MessagesSquare className="size-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} {SITE_CONFIG.name}. All rights reserved.</p>
          <p className="font-mono">SYSTEM STATUS: ONLINE</p>
        </div>
      </div>
    </footer>
  );
}
