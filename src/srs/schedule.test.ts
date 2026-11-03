import { describe, expect, it } from 'vitest';
import { addDays, toDayKey } from './day.ts';
import { downgrade, review, suggestRating } from './schedule.ts';

const TODAY = '2026-11-03';

describe('toDayKey and addDays', () => {
  it('formats the local calendar day', () => {
    expect(toDayKey(new Date(2026, 10, 3, 23, 59))).toBe('2026-11-03');
  });

  it('crosses month and year ends', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('review', () => {
  it('schedules a new card for tomorrow when rated good', () => {
    const state = review(undefined, 'good', TODAY);
    expect(state).toMatchObject({ reps: 1, intervalDays: 1, dueDay: '2026-11-04', ease: 2.5, lapses: 0 });
  });

  it('grows the interval with each good review', () => {
    const first = review(undefined, 'good', TODAY);
    const second = review(first, 'good', first.dueDay);
    const third = review(second, 'good', second.dueDay);
    expect([first.intervalDays, second.intervalDays, third.intervalDays]).toEqual([1, 3, 8]);
    expect(third.dueDay).toBe('2026-11-15');
  });

  it('resets the streak of reps and counts a lapse on again', () => {
    const learned = review(review(undefined, 'good', TODAY), 'good', '2026-11-04');
    const forgotten = review(learned, 'again', '2026-11-07');
    expect(forgotten).toMatchObject({ reps: 0, intervalDays: 1, lapses: 1, dueDay: '2026-11-08', ease: 2.3 });
  });

  it('never lets ease fall below 1.3', () => {
    let state = review(undefined, 'again', TODAY);
    for (let i = 0; i < 10; i += 1) {
      state = review(state, 'again', TODAY);
    }
    expect(state.ease).toBe(1.3);
  });

  it('moves a hard card forward by at least one day', () => {
    let state = review(undefined, 'good', TODAY);
    state = review(state, 'good', state.dueDay);
    const hard = review({ ...state, ease: 1.3, intervalDays: 2 }, 'hard', state.dueDay);
    expect(hard.intervalDays).toBe(3);
  });

  it('caps intervals at 180 days', () => {
    const state = review({ reps: 5, intervalDays: 170, ease: 2.5, dueDay: TODAY, lapses: 0, lastReviewDay: TODAY }, 'easy', TODAY);
    expect(state.intervalDays).toBe(180);
  });
});

describe('downgrade', () => {
  it('lowers a rating by one step and keeps again', () => {
    expect(downgrade('easy')).toBe('good');
    expect(downgrade('good')).toBe('hard');
    expect(downgrade('again')).toBe('again');
  });
});

describe('suggestRating', () => {
  it('suggests from the share of key points said', () => {
    expect(suggestRating(4, 4)).toBe('good');
    expect(suggestRating(2, 4)).toBe('hard');
    expect(suggestRating(1, 4)).toBe('again');
  });
});
