import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/navigation/Sidebar';
import { MobileNav } from '@/components/navigation/MobileNav';
import { Topbar } from './Topbar';
import { ADMIN_NAV_LINKS } from '@/app/config/site';

export function AdminShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar links={ADMIN_NAV_LINKS} badge="ADMIN" accent="secondary" />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} links={ADMIN_NAV_LINKS} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
