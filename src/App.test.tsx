import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { App, type ProgressStore } from './App.tsx';
import { CARDS } from './content/index.ts';
import { pickMockInterview } from './play/mock-interview.ts';
import { emptyProgress, type Progress } from './play/progress.ts';
import { SERIES_LENGTH } from './play/series.ts';
import { THEME_KEY } from './ui/theme.ts';

/** A frozen clock: the tests never depend on the real date. */
const now = () => new Date(2026, 10, 3, 9, 0);
/** Never draws a check on a handled topic. */
const random = () => 0.99;

/**
 * Answers whatever question is on screen. Spoken questions follow `right`. True/false and
 * multiple-choice answers cannot be chosen blind, so `attempt` picks a different option on each
 * try, which makes a replayed question right after a few tries.
 */
async function answerOnScreen(user: ReturnType<typeof userEvent.setup>, { right, attempt }: { right: boolean; attempt: number }) {
  const reveal = screen.queryByRole('button', { name: 'Show the answer' });
  if (reveal) {
    await user.click(reveal);
    if (right) {
      // Follow-ups have no key points to tick.
      for (const checkbox of screen.queryAllByRole('checkbox')) {
        await user.click(checkbox);
      }
    }
    await user.click(screen.getByRole('button', { name: right ? 'I had it' : 'I missed it' }));
    return;
  }
  const trueButton = screen.queryByRole('button', { name: 'True' });
  const chooseA = screen.queryByRole('button', { name: 'Choose A' });
  if (chooseA) {
    await user.click(attempt % 2 === 0 ? chooseA : screen.getByRole('button', { name: 'Choose B' }));
  } else if (trueButton) {
    await user.click(attempt % 2 === 0 ? trueButton : screen.getByRole('button', { name: 'False' }));
  } else {
    const options = screen.getAllByRole('listitem').map((item) => item.querySelector('button')!);
    await user.click(options[attempt % options.length]!);
  }
  await user.click(screen.getByRole('button', { name: 'Continue' }));
}

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
  it('asks questions on any topic in the main mode, with no lesson at all', async () => {
    const user = userEvent.setup();
    const store = memoryStore();
    render(<App store={store} now={now} random={random} />);

    await user.click(await screen.findByRole('button', { name: 'Start playing' }));
    // A topic never studied is asked straight away.
    expect(await screen.findByRole('heading', { name: /var.*let.*const/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Lesson' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show the answer' }));
    expect(screen.queryByRole('button', { name: 'Review the lesson' })).not.toBeInTheDocument();
    for (const checkbox of screen.getAllByRole('checkbox')) {
      await user.click(checkbox);
    }
    await user.click(screen.getByRole('button', { name: 'I had it' }));

    expect(store.saved()).toMatchObject({ step: 1, topics: { 'js-scope': { lessonSeen: false, results: [{ correct: true, graded: false }] } } });
    expect(screen.queryByText(/^Lesson ·/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(`Question 2 of ${SERIES_LENGTH}`)).toBeInTheDocument();
  });

  it('plays a series, replays the missed questions without saving them, then shows a summary', async () => {
    const user = userEvent.setup();
    const store = memoryStore();
    render(<App store={store} now={now} random={random} />);
    await user.click(await screen.findByRole('button', { name: 'Start playing' }));
    await screen.findByLabelText(`Question 1 of ${SERIES_LENGTH}`);

    // The first question is missed on purpose, so the series must end with at least one replay.
    await answerOnScreen(user, { right: false, attempt: 0 });
    for (let question = 2; question <= SERIES_LENGTH; question += 1) {
      expect(screen.getByLabelText(`Question ${question} of ${SERIES_LENGTH}`)).toBeInTheDocument();
      await answerOnScreen(user, { right: true, attempt: 0 });
    }
    expect(store.saved().step).toBe(SERIES_LENGTH);

    expect(screen.getByText(/^Missed earlier: one more try/)).toBeInTheDocument();
    for (let attempt = 0; !screen.queryByText('Series complete'); attempt += 1) {
      expect(attempt, 'the replays never end').toBeLessThan(60);
      await answerOnScreen(user, { right: true, attempt });
    }
    // Replays are practice: nothing more was saved.
    expect(store.saved().step).toBe(SERIES_LENGTH);
    expect(screen.getByRole('heading', { name: new RegExp(`of ${SERIES_LENGTH} right first time`) })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Missed this time' })).toBeInTheDocument();
    // The main mode never shows lessons, not even in the summary.
    expect(screen.queryByRole('button', { name: /^Lesson on/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next series' }));
    expect(screen.getByLabelText(`Question 1 of ${SERIES_LENGTH}`)).toBeInTheDocument();
    // A whole series with its replays is dozens of screens: more than the 5 s default.
  }, 20_000);

  it('teaches in unit practice: a lesson first, then a lesson button and a review after a reveal', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} now={now} random={random} />);

    await user.click(await screen.findByText('JavaScript core'));
    await user.click(screen.getByRole('button', { name: 'Play JavaScript core' }));
    expect(await screen.findByText(/^Lesson ·/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Got it, ask me' }));

    // The header button opens the current topic's lesson at any time.
    await user.click(screen.getByRole('button', { name: 'Lesson' }));
    await user.click(screen.getByRole('button', { name: 'Back to the question' }));

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
    await screen.findByText('Say it out loud');
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
    const expected = pickMockInterview(CARDS, emptyProgress(), now().getTime(), random)!.questions.length;
    expect(answered).toBe(expected);
    expect(screen.getByRole('heading', { name: `You had ${expected - 1} of ${expected}` })).toBeInTheDocument();
    expect(store.saved().step).toBe(expected);

    await user.click(screen.getByRole('button', { name: 'Review the lesson' }));
    await user.click(screen.getByRole('button', { name: 'Back to the summary' }));
    await user.click(screen.getByRole('button', { name: 'Next interview' }));
    expect(screen.getByText('Say it out loud')).toBeInTheDocument();
  });

  it('resets all progress once the learner confirms', async () => {
    const user = userEvent.setup();
    const store = memoryStore({ ...emptyProgress(), step: 12 });
    const confirm = vi.spyOn(window, 'confirm');
    render(<App store={store} now={now} random={random} />);

    confirm.mockReturnValueOnce(false);
    await user.click(await screen.findByRole('button', { name: 'Reset' }));
    expect(store.saved().step).toBe(12);

    confirm.mockReturnValueOnce(true);
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(store.saved()).toEqual(emptyProgress());
    confirm.mockRestore();
  });

  it('switches between the light and dark themes and remembers the choice', async () => {
    const user = userEvent.setup();
    document.documentElement.dataset.theme = 'light';
    render(<App store={memoryStore()} now={now} random={random} />);

    await user.click(await screen.findByRole('button', { name: 'Switch to the dark theme' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');

    await user.click(screen.getByRole('button', { name: 'Switch to the light theme' }));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem(THEME_KEY)).toBe('light');
    localStorage.removeItem(THEME_KEY);
  });

  it('reviews the weak spots: the questions missed last time', async () => {
    const user = userEvent.setup();
    const store = memoryStore();
    render(<App store={store} now={now} random={random} />);
    expect(await screen.findByRole('button', { name: 'No weak spots yet' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Start playing' }));
    await screen.findByLabelText(`Question 1 of ${SERIES_LENGTH}`);
    await answerOnScreen(user, { right: false, attempt: 0 });
    await user.click(screen.getByRole('button', { name: 'Stop playing' }));

    await user.click(screen.getByRole('button', { name: 'Review weak spots (1)' }));
    // The missed main question comes back, alone: the review has one question.
    expect(await screen.findByRole('heading', { name: /var.*let.*const/ })).toBeInTheDocument();
    expect(screen.getByLabelText('Question 1 of 1')).toBeInTheDocument();
    await answerOnScreen(user, { right: true, attempt: 0 });

    expect(screen.getByRole('heading', { name: '1 of 1 right first time' })).toBeInTheDocument();
    expect(store.saved().missed).toEqual({});
  });

  it('plays the unit the learner picks', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} now={now} random={random} />);

    await user.click(await screen.findByText('Behavioural and scenarios'));
    await user.click(screen.getByRole('button', { name: 'Play Behavioural and scenarios' }));
    await user.click(await screen.findByRole('button', { name: 'Got it, ask me' }));

    expect(screen.getByRole('heading', { name: /worked across the whole stack/ })).toBeInTheDocument();
  });
});
