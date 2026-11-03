import { addDays, type DayKey } from '../srs/day.ts';
import { review, type CardState, type Rating } from '../srs/schedule.ts';

/** Everything the app remembers about the learner. Stored as one document on the device. */
export type Progress = {
  version: 1;
  cards: Record<string, CardState>;
  days: Record<DayKey, DayStats>;
  settings: Settings;
};

export type DayStats = {
  xp: number;
  sessions: number;
  newCards: number;
};

export type Settings = {
  dailyGoalXp: number;
  newCardsPerDay: number;
};

export const XP_FOR_RATING: Record<Rating, number> = { again: 2, hard: 5, good: 10, easy: 12 };
export const XP_FOR_CHECK = 5;
export const XP_FOR_FOLLOW_UP = 3;

export function emptyProgress(): Progress {
  return {
    version: 1,
    cards: {},
    days: {},
    settings: { dailyGoalXp: 30, newCardsPerDay: 5 },
  };
}

export function dayStats(progress: Progress, day: DayKey): DayStats {
  return progress.days[day] ?? { xp: 0, sessions: 0, newCards: 0 };
}

/** Records a rated card: reschedules it, and counts it as new for the day on its first review. */
export function recordCardReview(progress: Progress, cardId: string, rating: Rating, today: DayKey): Progress {
  const previous = progress.cards[cardId];
  const stats = dayStats(progress, today);
  return {
    ...progress,
    cards: { ...progress.cards, [cardId]: review(previous, rating, today) },
    days: { ...progress.days, [today]: { ...stats, newCards: stats.newCards + (previous ? 0 : 1) } },
  };
}

export function addXp(progress: Progress, xp: number, today: DayKey): Progress {
  const stats = dayStats(progress, today);
  return { ...progress, days: { ...progress.days, [today]: { ...stats, xp: stats.xp + xp } } };
}

export function recordSessionDone(progress: Progress, today: DayKey): Progress {
  const stats = dayStats(progress, today);
  return { ...progress, days: { ...progress.days, [today]: { ...stats, sessions: stats.sessions + 1 } } };
}

/**
 * Counts the days in a row with at least one finished session, ending today. When today has
 * no session yet, the streak still counts up to yesterday: it is only lost after a missed day.
 */
export function currentStreak(progress: Progress, today: DayKey): number {
  const isActive = (day: DayKey) => dayStats(progress, day).sessions > 0;
  let day = isActive(today) ? today : addDays(today, -1);
  let streak = 0;
  while (isActive(day)) {
    streak += 1;
    day = addDays(day, -1);
  }
  return streak;
}

/** Checks that an imported file looks like a progress document before it replaces the current one. */
export function isProgress(value: unknown): value is Progress {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<Progress>;
  return (
    candidate.version === 1 &&
    typeof candidate.cards === 'object' &&
    candidate.cards !== null &&
    typeof candidate.days === 'object' &&
    candidate.days !== null &&
    typeof candidate.settings?.dailyGoalXp === 'number' &&
    typeof candidate.settings.newCardsPerDay === 'number'
  );
}
