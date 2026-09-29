import { create } from 'zustand';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'error' | 'info' | 'warning';
}

interface UiState {
  sidebarOpen: boolean;
  mobileNavOpen: boolean;
  toasts: Toast[];
  toggleSidebar: () => void;
  setMobileNavOpen: (open: boolean) => void;
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarOpen: true,
  mobileNavOpen: false,
  toasts: [],
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  pushToast: (toast) =>
    set((s) => ({
      toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
