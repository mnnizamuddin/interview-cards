import { describe, expect, it } from 'vitest';
import { addXp, currentStreak, emptyProgress, isProgress, recordCardReview, recordSessionDone, type Progress } from './model.ts';

const TODAY = '2026-11-03';

function withSessionsOn(days: string[]): Progress {
  return days.reduce((progress, day) => recordSessionDone(progress, day), emptyProgress());
}

describe('recordCardReview', () => {
  it('schedules the card and counts it as new only on its first review', () => {
    let progress = recordCardReview(emptyProgress(), 'js-scope', 'good', TODAY);
    progress = recordCardReview(progress, 'js-scope', 'good', TODAY);
    expect(progress.cards['js-scope']?.reps).toBe(2);
    expect(progress.days[TODAY]?.newCards).toBe(1);
  });
});

describe('addXp', () => {
  it('adds to the day total', () => {
    const progress = addXp(addXp(emptyProgress(), 10, TODAY), 5, TODAY);
    expect(progress.days[TODAY]?.xp).toBe(15);
  });
});

describe('currentStreak', () => {
  it('counts consecutive days ending today', () => {
    expect(currentStreak(withSessionsOn(['2026-11-01', '2026-11-02', TODAY]), TODAY)).toBe(3);
  });

  it('keeps yesterday\'s streak while today has no session yet', () => {
    expect(currentStreak(withSessionsOn(['2026-11-01', '2026-11-02']), TODAY)).toBe(2);
  });

  it('is lost after a missed day', () => {
    expect(currentStreak(withSessionsOn(['2026-10-31', '2026-11-01']), TODAY)).toBe(0);
  });
});

describe('isProgress', () => {
  it('accepts a progress document and rejects anything else', () => {
    expect(isProgress(emptyProgress())).toBe(true);
    expect(isProgress({ version: 2 })).toBe(false);
    expect(isProgress(null)).toBe(false);
  });
});
