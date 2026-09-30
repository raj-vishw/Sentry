import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, LogOut, Search, Settings as SettingsIcon, User as UserIcon } from 'lucide-react';
import { Logo } from '@/components/navigation/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { authService } from '@/services/authService';
import { useCommandPalette } from '@/features/search/CommandPaletteProvider';
import { useWindowStore } from '../state/windowStore';
import { useNotificationStore } from '../state/notificationStore';
import { NotificationCenter } from './NotificationCenter';
import { Clock } from './Clock';
import { cn } from '@/lib/utils';

export function TopBar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const pushToast = useUiStore((s) => s.pushToast);
  const { open: openPalette } = useCommandPalette();
  const openApp = useWindowStore((s) => s.openApp);
  const activeWorkspace = useWindowStore((s) => s.activeWorkspace);
  const workspaceCount = useWindowStore((s) => s.workspaceCount);
  const setActiveWorkspace = useWindowStore((s) => s.setActiveWorkspace);
  const unreadCount = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);

  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  async function handleLogout() {
    await authService.logout().catch(() => {});
    clearSession();
    pushToast({ title: 'Session terminated', variant: 'info' });
    navigate('/', { replace: true });
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[500] flex h-11 items-center gap-3 border-b border-[var(--color-glass-border)] bg-[var(--color-glass-bg-strong)] px-3 backdrop-blur-xl">
      <Logo to="/dashboard" className="scale-90" />
      <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] sm:inline">
        Sentry OS
      </span>

      <div className="hidden items-center gap-1 sm:flex">
        {Array.from({ length: workspaceCount }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveWorkspace(i)}
            aria-label={`Workspace ${i + 1}`}
            aria-current={activeWorkspace === i}
            className={cn(
              'rounded-full px-2.5 py-1 font-mono text-[10px] transition-colors',
              activeWorkspace === i
                ? 'bg-[var(--color-surface-elevated)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      <button
        onClick={openPalette}
        aria-label="Search (Ctrl+K)"
        className="flex items-center gap-1.5 rounded-full border border-[var(--color-glass-border)] px-2.5 py-1 text-[11px] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]/40 hover:text-[var(--color-text-secondary)]"
      >
        <Search className="size-3.5" />
        <span className="hidden font-mono sm:inline">⌘K</span>
      </button>

      <ThemeToggle className="hidden size-7 sm:flex" />

      <button
        onClick={() => openApp('settings')}
        aria-label="Settings"
        className="hidden text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] sm:block"
      >
        <SettingsIcon className="size-4" />
      </button>

      <button
        onClick={() => setNotifOpen((o) => !o)}
        aria-label="Notifications"
        className="relative text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-[var(--color-accent)] font-mono text-[8px] text-[var(--color-text-inverse)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />

      <Clock />

      <div className="relative">
        <button
          onClick={() => setUserMenuOpen((o) => !o)}
          className="flex size-7 items-center justify-center rounded-full bg-[var(--color-surface-elevated)] font-mono text-[10px] font-semibold text-[var(--color-accent)]"
          aria-label="User menu"
        >
          {(user?.username ?? 'OP').slice(0, 2).toUpperCase()}
        </button>
        <AnimatePresence>
          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-[540]" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.14 }}
                className="glass-panel-strong absolute right-0 top-9 z-[550] w-48 overflow-hidden rounded-[var(--radius-md)] p-1.5"
              >
                <p className="truncate px-2.5 py-1.5 text-xs text-[var(--color-text-muted)]">{user?.username}</p>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/profile');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
                >
                  <UserIcon className="size-4" /> Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-sm text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                >
                  <LogOut className="size-4" /> Log out
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
