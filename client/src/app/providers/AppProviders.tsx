import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/feedback/Toaster';
import { AuthGate } from './AuthGate';
import { createQueryClient } from '@/lib/queryClient';
import { CommandPaletteProvider } from '@/features/search/CommandPaletteProvider';
import { useSettingsStore } from '@/os/state/settingsStore';

/** Keeps `<html data-theme>` in sync after the initial (pre-render) set in main.tsx. */
function ThemeSync() {
  const theme = useSettingsStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeSync />
        <AuthGate>
          <CommandPaletteProvider>{children}</CommandPaletteProvider>
        </AuthGate>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
