import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';

function renderNavbar() {
  return render(
    <MemoryRouter>
      <PublicNavbar />
    </MemoryRouter>,
  );
}

describe('PublicNavbar', () => {
  it('renders primary navigation links and auth actions', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: 'Challenges' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Leaderboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join' })).toBeInTheDocument();
  });

  it('opens and closes the mobile menu', async () => {
    renderNavbar();
    const toggle = screen.getByLabelText('Open menu');
    await userEvent.click(toggle);
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Close menu'));
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
  });
});
