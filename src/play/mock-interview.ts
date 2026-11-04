import type { Card } from '../content/types.ts';
import { exerciseKey, type Exercise } from './engine.ts';
import { isHandled, type Progress } from './progress.ts';

/**
 * A mock interview follows one topic the way an interviewer does: the main question, then
 * follow-ups on the same thread, with no lesson first.
 */

/** Follow-ups asked after the main question, at most. */
export const FOLLOW_UPS_PER_INTERVIEW = 4;

export type MockInterview = {
  cardId: string;
  /** The main open question, then the follow-ups, all of kind `open` or `followUp`. */
  questions: Exercise[];
};

/**
 * Picks a topic at random, preferring topics not yet handled, as an interviewer would pick one
 * you are less sure of. The follow-ups are the ones shown longest ago, asked in the card's order.
 * Returns `undefined` only when `cards` is empty.
 *
 * @param random Returns a number in [0, 1); injected so tests get a fixed topic.
 */
export function pickMockInterview(
  cards: readonly Card[],
  progress: Progress,
  now: number,
  random: () => number = Math.random,
): MockInterview | undefined {
  const notHandled = cards.filter((card) => !isHandled(progress.topics[card.id], now));
  const pool = notHandled.length > 0 ? notHandled : cards;
  const card = pool[Math.floor(random() * pool.length)];
  if (!card) {
    return undefined;
  }

  const lastShown = (index: number) => progress.shown[exerciseKey({ kind: 'followUp', cardId: card.id, index })] ?? -1;
  const followUpIndexes = card.followUps
    .map((_, index) => index)
    .toSorted((a, b) => lastShown(a) - lastShown(b) || a - b)
    .slice(0, FOLLOW_UPS_PER_INTERVIEW)
    .toSorted((a, b) => a - b);

  return {
    cardId: card.id,
    questions: [
      { kind: 'open', cardId: card.id },
      ...followUpIndexes.map((index): Exercise => ({ kind: 'followUp', cardId: card.id, index })),
    ],
  };
}
