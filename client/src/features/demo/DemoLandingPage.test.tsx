import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { DemoLandingPage } from './DemoLandingPage';
import { useAuthStore } from '@/stores/authStore';
import { usePlatformConfigStore } from '@/stores/platformConfigStore';

vi.mock('@/services/authService', () => ({
  authService: {
    demoLogin: vi.fn(),
  },
}));

const { authService } = await import('@/services/authService');

const mockUser = {
  id: '1',
  username: 'user',
  email: 'user@demo.invalid',
  role: 'user' as const,
  xp: 0,
  rank: 0,
  solvedCount: 0,
  streak: 0,
  teamId: null,
  teamName: null,
  createdAt: new Date().toISOString(),
};

function renderDemoPage() {
  return render(
    <MemoryRouter>
      <DemoLandingPage />
    </MemoryRouter>,
  );
}

describe('DemoLandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
    usePlatformConfigStore.setState({
      config: {
        platformName: 'Sentry',
        platformDescription: '',
        logoUrl: null,
        faviconUrl: null,
        accentColor: null,
        bootMessage: null,
        demoMode: true,
        competitionName: '',
        startTime: null,
        endTime: null,
      },
    });
  });

  it('shows a real login form instead of auto-logging in', () => {
    renderDemoPage();
    expect(screen.getByLabelText('Identifier')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enter Demo' })).toBeInTheDocument();
    expect(authService.demoLogin).not.toHaveBeenCalled();
  });

  it('submits through the dedicated demo-login endpoint and stores the session on success', async () => {
    vi.mocked(authService.demoLogin).mockResolvedValue({ user: mockUser, token: 'mock.demo' });

    renderDemoPage();
    await userEvent.type(screen.getByLabelText('Identifier'), 'user');
    await userEvent.type(screen.getByLabelText('Password'), 'user');
    await userEvent.click(screen.getByRole('button', { name: 'Enter Demo' }));

    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(true));
    expect(authService.demoLogin).toHaveBeenCalledWith({ identifier: 'user', password: 'user' });
  });

  it('rejects arbitrary credentials with a visible error, never calling the generic login', async () => {
    vi.mocked(authService.demoLogin).mockRejectedValue(new Error('Invalid credentials.'));

    renderDemoPage();
    await userEvent.type(screen.getByLabelText('Identifier'), 'some_real_user');
    await userEvent.type(screen.getByLabelText('Password'), 'their-real-password');
    await userEvent.click(screen.getByRole('button', { name: 'Enter Demo' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials.');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('the quick-enter buttons submit through the same restricted endpoint', async () => {
    vi.mocked(authService.demoLogin).mockResolvedValue({ user: mockUser, token: 'mock.demo' });

    renderDemoPage();
    await userEvent.click(screen.getByRole('button', { name: /Enter as player/ }));

    await waitFor(() => expect(authService.demoLogin).toHaveBeenCalledWith({ identifier: 'user', password: 'user' }));
  });

  it('shows a "not in demo mode" message instead of the form when demoMode is off', () => {
    usePlatformConfigStore.setState({
      config: {
        platformName: 'Sentry',
        platformDescription: '',
        logoUrl: null,
        faviconUrl: null,
        accentColor: null,
        bootMessage: null,
        demoMode: false,
        competitionName: '',
        startTime: null,
        endTime: null,
      },
    });
    renderDemoPage();
    expect(screen.queryByLabelText('Identifier')).not.toBeInTheDocument();
    expect(screen.getByText(/isn't running in demo mode/i)).toBeInTheDocument();
  });
});
