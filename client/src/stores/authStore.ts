import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (user: User, token: string) => void;
  clearSession: () => void;
}

/**
 * Phase 1: session is populated by mocked auth service calls only.
 * Phase 2 replaces the service internals with real API calls — this
 * store's shape stays the same.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setSession: (user, token) => set({ user, token, isAuthenticated: true }),
      clearSession: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'breach-auth' },
  ),
);
