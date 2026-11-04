import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CARDS_BY_ID } from '../content/index.ts';
import { LessonView } from './LessonView.tsx';

describe('LessonView', () => {
  it('shows the concept, a takeaways table, the code and a practice check on one page', async () => {
    const user = userEvent.setup();
    const card = CARDS_BY_ID.get('js-scope')!;
    const onDone = vi.fn();
    render(<LessonView card={card} unitTitle="JavaScript core" actionLabel="Got it, ask me" onDone={onDone} />);

    expect(screen.getByRole('heading', { name: card.topic })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Reading progress' })).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'The concept' })).getByText(/Scope decides where a name can be used/)).toBeInTheDocument();

    const rows = within(screen.getByRole('region', { name: 'Key takeaways' })).getAllByRole('row');
    expect(rows).toHaveLength(card.lesson!.takeaways!.length);
    expect(within(rows[0]!).getByRole('rowheader')).toHaveTextContent('var');

    expect(within(screen.getByRole('region', { name: 'In code' })).getAllByText('threshold').length).toBeGreaterThan(0);

    // The inline check answers at once and says it does not count.
    const check = screen.getByRole('region', { name: 'Quick check' });
    await user.click(within(check).getByRole('button', { name: card.traps[0]!.isTrue ? 'True' : 'False' }));
    expect(within(check).getByRole('status')).toHaveTextContent('Correct!');
    expect(check).toHaveTextContent('does not change your progress');

    await user.click(screen.getByRole('button', { name: 'Got it, ask me' }));
    expect(onDone).toHaveBeenCalledOnce();
  });

  it('falls back to the lesson points for a card without a takeaways table', () => {
    const card = CARDS_BY_ID.get('js-closures')!;
    const plain = { ...card, lesson: { points: card.lesson!.points, code: card.lesson!.code, codeLang: card.lesson!.codeLang } };
    render(<LessonView card={plain} unitTitle="JavaScript core" actionLabel="Got it, ask me" onDone={vi.fn()} />);
    expect(within(screen.getByRole('region', { name: 'Key takeaways' })).getAllByRole('listitem')).toHaveLength(card.lesson!.points.length - 1);
  });
});
