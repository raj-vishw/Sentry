import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderPlus, LayoutGrid, RefreshCw, Settings as SettingsIcon } from 'lucide-react';
import { AnimatedBackground } from '@/components/animation/AnimatedBackground';
import { OrbitalRings } from '@/components/animation/OrbitalRings';
import { useAuthStore } from '@/stores/authStore';
import { useWindowStore } from '../state/windowStore';
import { useSettingsStore } from '../state/settingsStore';
import { listApps } from '../apps/registry';
import { ContextMenu, type ContextMenuState } from './ContextMenu';
import { cn } from '@/lib/utils';

const DESKTOP_ICON_IDS = ['explore', 'leaderboard', 'teams', 'files', 'notes', 'settings', 'admin'];

export function Desktop() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const wallpaper = useSettingsStore((s) => s.wallpaper);
  const openApp = useWindowStore((s) => s.openApp);
  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const apps = listApps({ isAdmin: role === 'admin' }).filter((a) => DESKTOP_ICON_IDS.includes(a.id));
  const orderedApps = DESKTOP_ICON_IDS.map((id) => apps.find((a) => a.id === id)).filter((a) => a !== undefined);

  function launch(appId: string) {
    const app = orderedApps.find((a) => a.id === appId);
    if (!app) return;
    if (app.routePattern && app.buildPath) {
      navigate(app.buildPath({}));
    } else {
      openApp(appId);
    }
  }

  function onDesktopContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        { label: 'Open Explore', icon: LayoutGrid, onSelect: () => launch('explore') },
        { label: 'New Note', icon: FolderPlus, onSelect: () => openApp('notes') },
        { label: 'Refresh desktop', icon: RefreshCw, onSelect: () => window.location.reload() },
        { label: 'Display Settings', icon: SettingsIcon, onSelect: () => openApp('settings') },
      ],
    });
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onContextMenu={onDesktopContextMenu}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) setSelected(null);
      }}
    >
      {wallpaper !== 'minimal' && <AnimatedBackground className="pointer-events-none absolute inset-0 h-full w-full opacity-60" />}
      {wallpaper === 'observatory' && <OrbitalRings className="pointer-events-none opacity-40" />}
      {wallpaper === 'aurora' && (
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(60% 50% at 20% 15%, color-mix(in srgb, var(--color-secondary) 20%, transparent), transparent), radial-gradient(50% 40% at 85% 75%, color-mix(in srgb, var(--color-accent) 18%, transparent), transparent)',
          }}
        />
      )}
      <div className="bg-grid-fine pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />

      <div className="relative grid grid-cols-[repeat(auto-fill,88px)] gap-1 p-4 pt-6 sm:p-6">
        {orderedApps.map((app) => {
          const Icon = app.icon;
          return (
            <button
              key={app.id}
              type="button"
              onClick={() => setSelected(app.id)}
              onDoubleClick={() => launch(app.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  launch(app.id);
                }
              }}
              className={cn(
                'flex w-20 flex-col items-center gap-1.5 rounded-[var(--radius-md)] p-2 text-center outline-none',
                'focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
                selected === app.id ? 'bg-[var(--color-accent)]/15' : 'hover:bg-white/5',
              )}
            >
              <span className="flex size-11 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-glass-border)] bg-[var(--color-surface)]/70 text-[var(--color-accent)] shadow-sm">
                <Icon className="size-5" />
              </span>
              <span className="line-clamp-2 text-[11px] leading-tight text-[var(--color-text-secondary)] [text-shadow:0_1px_3px_rgb(0_0_0_/_0.6)]">
                {app.title}
              </span>
            </button>
          );
        })}
      </div>

      <ContextMenu state={menu} onClose={() => setMenu(null)} />
    </div>
  );
}
