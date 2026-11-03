import { addDays, type DayKey } from './day.ts';

/**
 * Spaced repetition in whole days, a simplified SM-2 (the algorithm behind Anki's classic
 * scheduler): each card keeps an interval and an ease factor, and the learner's rating stretches
 * or shrinks the interval.
 */

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export const RATINGS: readonly Rating[] = ['again', 'hard', 'good', 'easy'];

export type CardState = {
  /** Successful reviews in a row; back to 0 after "again". */
  reps: number;
  intervalDays: number;
  ease: number;
  dueDay: DayKey;
  lapses: number;
  lastReviewDay: DayKey;
};

const START_EASE = 2.5;
const MIN_EASE = 1.3;
const MAX_INTERVAL_DAYS = 180;

/** Returns the next state of a card after a review rated `rating` on `today`. */
export function review(state: CardState | undefined, rating: Rating, today: DayKey): CardState {
  const previous = state ?? { reps: 0, intervalDays: 0, ease: START_EASE, lapses: 0 };
  const ease = nextEase(previous.ease, rating);
  const intervalDays = Math.min(MAX_INTERVAL_DAYS, nextInterval(previous.reps, previous.intervalDays, ease, rating));
  return {
    reps: rating === 'again' ? 0 : previous.reps + 1,
    intervalDays,
    ease,
    dueDay: addDays(today, intervalDays),
    lapses: rating === 'again' ? previous.lapses + 1 : previous.lapses,
    lastReviewDay: today,
  };
}

function nextEase(ease: number, rating: Rating): number {
  const change = { again: -0.2, hard: -0.15, good: 0, easy: 0.15 }[rating];
  return Math.max(MIN_EASE, Math.round((ease + change) * 100) / 100);
}

function nextInterval(reps: number, intervalDays: number, ease: number, rating: Rating): number {
  if (rating === 'again') {
    return 1;
  }
  if (reps === 0) {
    return { hard: 1, good: 1, easy: 3 }[rating];
  }
  if (reps === 1) {
    return { hard: 2, good: 3, easy: 6 }[rating];
  }
  const factor = { hard: 1.2, good: ease, easy: ease * 1.3 }[rating];
  // Always move forward by at least a day, so a hard card never stays on the same date.
  return Math.max(intervalDays + 1, Math.round(intervalDays * factor));
}

/** Lowers a rating by one step; "again" stays "again". */
export function downgrade(rating: Rating): Rating {
  const index = RATINGS.indexOf(rating);
  return RATINGS[Math.max(0, index - 1)]!;
}

/**
 * Suggests a rating from the share of key points the learner said: all of them is "good",
 * at least half is "hard", fewer is "again". "Easy" is always the learner's own call.
 */
export function suggestRating(saidCount: number, total: number): Rating {
  if (total === 0 || saidCount === total) {
    return 'good';
  }
  return saidCount * 2 >= total ? 'hard' : 'again';
}
