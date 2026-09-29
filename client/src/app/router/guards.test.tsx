import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RequireAuth, RequireAdmin } from './guards';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types';

const baseUser: User = {
  id: '1',
  username: 'operator_01',
  email: 'operator01@example.com',
  role: 'user',
  xp: 100,
  rank: 10,
  solvedCount: 2,
  streak: 0,
  createdAt: new Date().toISOString(),
};

function renderWithGuard(guard: 'auth' | 'admin', initialPath = '/protected') {
  const Guard = guard === 'auth' ? RequireAuth : RequireAdmin;
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        <Route
          path="/protected"
          element={
            <Guard>
              <div>Protected Content</div>
            </Guard>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireAuth', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
  });

  it('redirects an unauthenticated user to /login', () => {
    renderWithGuard('auth');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders the protected content for an authenticated user', () => {
    useAuthStore.setState({ user: baseUser, accessToken: 'token', isAuthenticated: true });
    renderWithGuard('auth');
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

describe('RequireAdmin', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
  });

  it('redirects an unauthenticated user to /login', () => {
    renderWithGuard('admin');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects a plain USER to /dashboard, never showing admin content', () => {
    useAuthStore.setState({ user: baseUser, accessToken: 'token', isAuthenticated: true });
    renderWithGuard('admin');
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders the protected content for an ADMIN', () => {
    useAuthStore.setState({ user: { ...baseUser, role: 'admin' }, accessToken: 'token', isAuthenticated: true });
    renderWithGuard('admin');
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
