import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CARDS_BY_ID } from '../content/index.ts';
import { LessonView } from './LessonView.tsx';

describe('LessonView', () => {
  it('shows one card per point plus the code, moved with the arrows and dots', async () => {
    const user = userEvent.setup();
    const card = CARDS_BY_ID.get('js-scope')!;
    const total = card.lesson!.points.length + 1;
    const onDone = vi.fn();
    render(<LessonView card={card} unitTitle="JavaScript core" actionLabel="Got it, ask me" onDone={onDone} />);

    expect(screen.getAllByRole('group')).toHaveLength(total);
    expect(screen.getByRole('group', { name: `${total} of ${total}` })).toHaveTextContent('In code');

    const current = () => screen.getAllByRole('button', { name: /^Card \d+$/ }).findIndex((dot) => dot.getAttribute('aria-current') === 'true');
    expect(current()).toBe(0);
    expect(screen.getByRole('button', { name: 'Previous card' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Next card' }));
    expect(current()).toBe(1);
    await user.click(screen.getByRole('button', { name: `Card ${total}` }));
    expect(current()).toBe(total - 1);
    expect(screen.getByRole('button', { name: 'Next card' })).toBeDisabled();

    // The questions can start from any card.
    await user.click(screen.getByRole('button', { name: 'Got it, ask me' }));
    expect(onDone).toHaveBeenCalledOnce();
  });
});
