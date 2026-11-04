import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Mcq } from '../content/types.ts';
import { McqExercise } from './McqExercise.tsx';

const MCQ: Mcq = {
  id: 'm23.q14',
  module: 'm23',
  section: 'closures',
  q: 'What does this print?',
  options: ['[0, 1, 2]', '[3, 3, 3]', '[undefined]', '[2, 2, 2]'],
  answer: 1,
  explain: 'One shared variable.',
};

describe('McqExercise', () => {
  it('shows the options shuffled and still grades the right one', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    // Always 0: the order becomes [1, 2, 3, 0], so the right answer is shown first.
    render(<McqExercise mcq={MCQ} onDone={onDone} random={() => 0} />);

    // Each option shows a letter, A to D in the shown order, then its text.
    const options = screen.getAllByRole('listitem').map((item) => item.textContent);
    expect(options).toEqual(['A[3, 3, 3]', 'B[undefined]', 'C[2, 2, 2]', 'D[0, 1, 2]']);

    // Selecting is not answering: nothing is graded before the check.
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: '[0, 1, 2]' }));
    await user.click(screen.getByRole('button', { name: '[3, 3, 3]' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Check answer' }));
    expect(screen.getByRole('status')).toHaveTextContent('Correct!');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onDone).toHaveBeenCalledWith({ correct: true });
  });

  it('marks a wrong pick as wrong', async () => {
    const user = userEvent.setup();
    render(<McqExercise mcq={MCQ} onDone={vi.fn()} random={() => 0} />);
    await user.click(screen.getByRole('button', { name: '[0, 1, 2]' }));
    await user.click(screen.getByRole('button', { name: 'Check answer' }));
    expect(screen.getByRole('status')).toHaveTextContent('Not quite');
  });
});
