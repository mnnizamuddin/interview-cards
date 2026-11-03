import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App, type ProgressStore } from './App.tsx';
import { emptyProgress, type Progress } from './progress/model.ts';

/** A frozen clock: the tests never depend on the real date. */
const now = () => new Date(2026, 10, 3, 9, 0);

function memoryStore(initial: Progress = emptyProgress()): ProgressStore & { saved: () => Progress } {
  let current = initial;
  return {
    load: async () => current,
    save: async (progress) => {
      current = progress;
    },
    saved: () => current,
  };
}

describe('App', () => {
  it('starts a session on the unit the learner picks', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} now={now} />);

    await user.click(await screen.findByText('Behavioural and scenarios'));
    const practiceButtons = screen.getAllByRole('button', { name: 'Practice this unit' });
    // Units are listed in order; behavioural is the tenth of eleven.
    await user.click(practiceButtons[9]!);

    expect(screen.getByRole('heading', { name: /worked across the whole stack/ })).toBeInTheDocument();
  });

  it('runs a "say it" card with its follow-ups and reschedules it', async () => {
    const user = userEvent.setup();
    const store = memoryStore();
    render(<App store={store} now={now} />);

    expect(await screen.findByText('5 new cards', { exact: false })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Start today’s session' }));

    expect(screen.getByRole('heading', { name: /var.*let.*const/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Show the answer' }));
    for (const checkbox of screen.getAllByRole('checkbox')) {
      await user.click(checkbox);
    }
    await user.click(screen.getByRole('button', { name: /^Good/ }));

    // Two follow-ups: one known, one missed, which lowers "good" to "hard".
    expect(screen.getByText(/digs deeper · 1\/2/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Show the answer' }));
    await user.click(screen.getByRole('button', { name: 'I had it' }));
    await user.click(screen.getByRole('button', { name: 'Show the answer' }));
    await user.click(screen.getByRole('button', { name: 'I missed it' }));

    const state = store.saved().cards['js-scope'];
    expect(state).toMatchObject({ reps: 1, intervalDays: 1, dueDay: '2026-11-04', lastReviewDay: '2026-11-03' });
    expect(store.saved().days['2026-11-03']?.xp).toBe(5 + 3);

    // The quick check that follows the card: its first trap.
    expect(screen.getByText('True or false?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'False' }));
    expect(screen.getByRole('status')).toHaveTextContent('Correct!');
  });
});
