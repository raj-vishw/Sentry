import { useState } from 'react';
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/feedback/Toaster';
import { AuthGate } from './AuthGate';
import { createQueryClient } from '@/lib/queryClient';

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthGate>{children}</AuthGate>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
