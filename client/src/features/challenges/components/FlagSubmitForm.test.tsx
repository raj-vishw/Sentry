import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FlagSubmitForm } from './FlagSubmitForm';

vi.mock('@/services/challengeService', () => ({
  challengeService: { submitFlag: vi.fn() },
}));

const { challengeService } = await import('@/services/challengeService');

function renderForm(solved = false) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <FlagSubmitForm challengeId="chal-1" slug="shadow-login" solved={solved} />
    </QueryClientProvider>,
  );
}

describe('FlagSubmitForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows an already-solved banner instead of a form when solved is true', () => {
    renderForm(true);
    expect(screen.getByText(/already solved/i)).toBeInTheDocument();
    expect(screen.queryByLabelText('Flag')).not.toBeInTheDocument();
  });

  it('requires a non-empty flag before submitting', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Enter a flag before submitting.')).toBeInTheDocument();
    expect(challengeService.submitFlag).not.toHaveBeenCalled();
  });

  it('shows a success message on a correct flag', async () => {
    vi.mocked(challengeService.submitFlag).mockResolvedValue({
      correct: true,
      alreadySolved: false,
      pointsAwarded: 300,
      message: 'Challenge solved.',
    });

    renderForm();
    // Avoids curly braces — user-event's type() treats "{..}" as key syntax.
    await userEvent.type(screen.getByLabelText('Flag'), 'correct-flag-value');
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText(/correct — challenge solved/i)).toBeInTheDocument();
    expect(challengeService.submitFlag).toHaveBeenCalledWith('chal-1', 'correct-flag-value');
  });

  it('shows an incorrect-flag message on a wrong guess', async () => {
    vi.mocked(challengeService.submitFlag).mockResolvedValue({
      correct: false,
      alreadySolved: false,
      pointsAwarded: 0,
      message: 'Incorrect flag.',
    });

    renderForm();
    await userEvent.type(screen.getByLabelText('Flag'), 'wrong-flag-value');
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText(/incorrect flag/i)).toBeInTheDocument();
  });
});
