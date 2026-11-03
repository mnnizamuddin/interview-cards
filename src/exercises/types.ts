import type { Rating } from '../srs/schedule.ts';

/** What an exercise reports when the learner moves on. */
export type ExerciseResult = {
  passed: boolean;
  xp: number;
  /** Set by "say it" exercises only: the rating that reschedules the card. */
  rating?: Rating;
};
