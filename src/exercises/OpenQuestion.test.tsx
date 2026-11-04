import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CARDS_BY_ID } from '../content/index.ts';
import { OpenQuestion } from './OpenQuestion.tsx';

describe('OpenQuestion', () => {
  it('asks another phrasing of the main question and connects it to the same model answer', async () => {
    const user = userEvent.setup();
    const card = CARDS_BY_ID.get('js-scope')!;
    const variant = card.questionVariants![0]!;
    render(<OpenQuestion card={card} variantIndex={0} onDone={() => {}} />);

    expect(screen.getByRole('heading', { name: /reminder job loops over orders/ })).toBeInTheDocument();
    // The scenario must not give the topic away before the reveal.
    expect(screen.queryByText(card.topic)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show the answer' }));
    // The bridge comes first in the model answer, then the card's own answer and key points.
    const modelAnswer = screen.getByRole('heading', { name: 'Model answer' }).parentElement!;
    const [bridge, answer] = modelAnswer.querySelectorAll('p');
    expect(bridge!.textContent).toBe(variant.bridge.replaceAll('`', ''));
    expect(answer!.textContent).toBe(card.answer.replaceAll('`', ''));
    expect(screen.getAllByRole('checkbox')).toHaveLength(card.keyPoints.length);
    // Background is shown in open blocks, with no toggle to open.
    for (const block of ['Why they ask', 'Real-world example', 'Common mistakes']) {
      expect(screen.getByRole('region', { name: block })).toBeVisible();
    }
    expect(screen.getByRole('region', { name: 'Why they ask' })).toHaveTextContent(card.explanation.replaceAll('`', ''));
  });
});
