import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App, type ProgressStore } from './App.tsx';
import { CARDS } from './content/index.ts';
import { pickMockInterview } from './play/mock-interview.ts';
import { emptyProgress, type Progress } from './play/progress.ts';

/** A frozen clock: the tests never depend on the real date. */
const now = () => new Date(2026, 10, 3, 9, 0);
/** Never draws a check on a handled topic. */
const random = () => 0.99;

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
  it('opens a topic with its lesson, then asks its interview question and saves the answer', async () => {
    const user = userEvent.setup();
    const store = memoryStore();
    render(<App store={store} now={now} random={random} />);

    await user.click(await screen.findByRole('button', { name: 'Start playing' }));
    expect(screen.getByText(/^Lesson ·/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Got it, ask me' }));

    expect(screen.getByRole('heading', { name: /var.*let.*const/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Show the answer' }));
    for (const checkbox of screen.getAllByRole('checkbox')) {
      await user.click(checkbox);
    }
    await user.click(screen.getByRole('button', { name: 'I had it' }));

    expect(store.saved()).toMatchObject({ step: 1, topics: { 'js-scope': { lessonSeen: true, results: [true] } } });
    // Fewer than three topics are being learned, so the next one starts with its lesson.
    expect(screen.getByRole('button', { name: 'Got it, ask me' })).toBeInTheDocument();
    expect(screen.getByLabelText('1 right out of 1 this time')).toBeInTheDocument();
  });

  it('offers the lesson again after a missed question', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} now={now} random={random} />);

    await user.click(await screen.findByRole('button', { name: 'Start playing' }));
    await user.click(screen.getByRole('button', { name: 'Got it, ask me' }));
    await user.click(screen.getByRole('button', { name: 'Show the answer' }));
    await user.click(screen.getByRole('button', { name: 'Review the lesson' }));
    await user.click(screen.getByRole('button', { name: 'Back to the question' }));

    // The revealed answer is still there after the lesson.
    expect(screen.getByRole('button', { name: 'I missed it' })).toBeInTheDocument();
  });

  it('runs a mock interview: the main question, then its follow-ups, then a summary', async () => {
    const user = userEvent.setup();
    const store = memoryStore();
    render(<App store={store} now={now} random={random} />);

    await user.click(await screen.findByRole('button', { name: 'Mock interview' }));
    // No lesson first, and no way to open it during the interview.
    expect(screen.queryByText(/^Lesson ·/)).not.toBeInTheDocument();
    expect(screen.getByText('Say it out loud')).toBeInTheDocument();

    let answered = 0;
    while (screen.queryByRole('button', { name: 'Show the answer' })) {
      await user.click(screen.getByRole('button', { name: 'Show the answer' }));
      expect(screen.queryByRole('button', { name: 'Review the lesson' })).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: answered === 0 ? 'I missed it' : 'I had it' }));
      answered += 1;
    }

    // The main question and up to four follow-ups of the topic the same random draw picks.
    const expected = pickMockInterview(CARDS, emptyProgress(), random)!.questions.length;
    expect(answered).toBe(expected);
    expect(screen.getByRole('heading', { name: `You had ${expected - 1} of ${expected}` })).toBeInTheDocument();
    expect(store.saved().step).toBe(expected);

    await user.click(screen.getByRole('button', { name: 'Review the lesson' }));
    await user.click(screen.getByRole('button', { name: 'Back to the summary' }));
    await user.click(screen.getByRole('button', { name: 'Next interview' }));
    expect(screen.getByText('Say it out loud')).toBeInTheDocument();
  });

  it('plays the unit the learner picks', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} now={now} random={random} />);

    await user.click(await screen.findByText('Behavioural and scenarios'));
    const playButtons = screen.getAllByRole('button', { name: 'Play this unit' });
    // Units are listed in order; behavioural is the tenth of eleven.
    await user.click(playButtons[9]!);
    await user.click(screen.getByRole('button', { name: 'Got it, ask me' }));

    expect(screen.getByRole('heading', { name: /worked across the whole stack/ })).toBeInTheDocument();
  });
});
