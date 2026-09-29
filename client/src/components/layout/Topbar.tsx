import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const pushToast = useUiStore((s) => s.pushToast);
  const navigate = useNavigate();

  function handleLogout() {
    clearSession();
    pushToast({ title: 'Session terminated', variant: 'info' });
    navigate('/', { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border)] glass px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="text-[var(--color-text-primary)] lg:hidden"
      >
        <Menu className="size-6" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-4">
        <button
          aria-label="Notifications"
          className="relative text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          <Bell className="size-5" />
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[var(--color-accent)]" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-[var(--color-surface-elevated)] font-mono text-xs font-semibold text-[var(--color-accent)]">
            {(user?.username ?? 'OP').slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden text-sm sm:block">
            <p className="font-medium text-[var(--color-text-primary)]">{user?.username ?? 'Operator'}</p>
            <p className="font-mono text-xs text-[var(--color-text-muted)]">{user?.xp ?? 0} XP</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          aria-label="Log out"
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-error)]"
        >
          <LogOut className="size-5" />
        </button>
      </div>
    </header>
  );
}
