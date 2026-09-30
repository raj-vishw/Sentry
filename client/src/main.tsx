import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { useSettingsStore } from '@/os/state/settingsStore';
import '@/styles/globals.css';

// Set before the first paint (not in a React effect) so there's no flash of
// the wrong theme — zustand's persist middleware hydrates from localStorage
// synchronously, so the persisted value is already available here.
document.documentElement.dataset.theme = useSettingsStore.getState().theme;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
