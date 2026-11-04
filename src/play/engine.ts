import type { Card, Mcq } from '../content/types.ts';
import { isHandled, type Progress } from './progress.ts';

/**
 * Picks what comes next in the endless stream of questions. Nothing is random except the
 * occasional check on a handled topic, and the random source is injected for tests.
 */

/** One screen of play. */
export type Exercise =
  | { kind: 'lesson'; cardId: string }
  /** The main question, or with `variant` one of its other phrasings. */
  | { kind: 'open'; cardId: string; variant?: number }
  | { kind: 'followUp'; cardId: string; index: number }
  /** A true/false statement, or with `twin` the same fact stated the other way. */
  | { kind: 'trap'; cardId: string; index: number; twin?: boolean }
  | { kind: 'mcq'; cardId: string; mcqId: string }
  | { kind: 'codeChoice'; cardId: string; index: number };

/** How many topics are being learned at once before a new one is introduced. */
export const TOPICS_IN_PROGRESS = 3;

/** The chance that the next question checks a topic already handled. */
export const HANDLED_CHECK_CHANCE = 0.15;

/** A topic answered within this many steps waits, unless nothing else is left. */
export const REST_STEPS = 2;

/** A stable name for an exercise, used to remember when it was last shown. */
export function exerciseKey(exercise: Exercise): string {
  switch (exercise.kind) {
    case 'lesson':
      return `lesson:${exercise.cardId}`;
    case 'open':
      return exercise.variant === undefined ? `open:${exercise.cardId}` : `open:${exercise.cardId}:v${exercise.variant}`;
    case 'trap':
      return `trap:${exercise.cardId}:${exercise.index}${exercise.twin ? ':twin' : ''}`;
    case 'followUp':
    case 'codeChoice':
      return `${exercise.kind}:${exercise.cardId}:${exercise.index}`;
    case 'mcq':
      return `mcq:${exercise.mcqId}`;
  }
}

/** True for exercises the app grades itself; open questions and follow-ups are self-checked. */
export function isGraded(exercise: Exercise): boolean {
  return exercise.kind === 'trap' || exercise.kind === 'mcq' || exercise.kind === 'codeChoice';
}

export type NextOptions = {
  /** The current time in milliseconds, which decides whether a handled topic has gone stale. */
  now: number;
  /** Returns a number in [0, 1); injected so tests get a fixed choice. */
  random?: () => number;
  /** Unit practice (`true`, the default) opens a new topic with its lesson; the main mode does not. */
  teach?: boolean;
  /**
   * How a new topic is chosen: in learning order (the default, for unit practice), or at random
   * among the topics not started yet (the main mode, so every fresh start covers different ground).
   */
  newTopics?: 'in-order' | 'random';
};

/**
 * Returns the next exercises: one question, preceded by the topic's lesson the first time the
 * topic comes up when `teach` is set. Returns `[]` only when `cards` is empty.
 */
export function nextExercises(
  cards: readonly Card[],
  mcqsByCard: ReadonlyMap<string, readonly Mcq[]>,
  progress: Progress,
  { now, random = Math.random, teach = true, newTopics = 'in-order' }: NextOptions,
): Exercise[] {
  const card = pickTopic(cards, progress, random, now, newTopics);
  if (!card) {
    return [];
  }
  const question = pickQuestion(card, mcqsByCard.get(card.id) ?? [], progress);
  const needsLesson = teach && !progress.topics[card.id]?.lessonSeen;
  return needsLesson ? [{ kind: 'lesson', cardId: card.id }, question] : [question];
}

/**
 * Chooses the topic, in this order of priority:
 * 1. a topic whose last answer was wrong comes back once it has rested;
 * 2. now and then, a rested handled topic is checked again;
 * 3. while fewer than {@link TOPICS_IN_PROGRESS} topics are being learned, a new one starts,
 *    the next in learning order or a random one, as `newTopics` says;
 * 4. otherwise, the topic being learned that was seen longest ago, rested ones first.
 * A handled topic that has gone stale counts as being learned, so it comes back for a check.
 */
function pickTopic(
  cards: readonly Card[],
  progress: Progress,
  random: () => number,
  now: number,
  newTopics: 'in-order' | 'random',
): Card | undefined {
  const stateOf = (card: Card) => progress.topics[card.id];
  const byLastStep = (a: Card, b: Card) => stateOf(a)!.lastStep - stateOf(b)!.lastStep;
  const hasRested = (card: Card) => progress.step - stateOf(card)!.lastStep > REST_STEPS;

  const fresh = cards.filter((card) => !stateOf(card));
  const learning = cards.filter((card) => stateOf(card) && !isHandled(stateOf(card), now)).toSorted(byLastStep);
  const handled = cards.filter((card) => isHandled(stateOf(card), now)).toSorted(byLastStep);
  const restedLearning = learning.filter(hasRested);
  const restedHandled = handled.filter(hasRested);
  const missed = restedLearning.filter((card) => stateOf(card)!.results.at(-1)?.correct === false);
  const nextFresh = () => (newTopics === 'random' ? fresh[Math.floor(random() * fresh.length)] : fresh[0]);

  if (missed.length > 0) {
    return missed[0];
  }
  if (restedHandled.length > 0 && random() < HANDLED_CHECK_CHANCE) {
    return restedHandled[0];
  }
  if (learning.length < TOPICS_IN_PROGRESS && fresh.length > 0) {
    return nextFresh();
  }
  return restedLearning[0] ?? learning[0] ?? nextFresh() ?? restedHandled[0] ?? handled[0];
}

/**
 * Chooses the question on a topic: the one shown longest ago, never-shown first. The interview
 * question leads; traps and their twins, follow-ups, track questions, code choices and other
 * phrasings of the main question then alternate.
 */
export function pickQuestion(card: Card, mcqs: readonly Mcq[], progress: Progress): Exercise {
  const traps: Exercise[] = card.traps.flatMap((trap, index): Exercise[] => {
    const original: Exercise = { kind: 'trap', cardId: card.id, index };
    return trap.twin ? [original, { ...original, twin: true }] : [original];
  });
  const candidates: Exercise[] = [
    { kind: 'open', cardId: card.id },
    ...interleave<Exercise>(
      traps,
      card.followUps.map((_, index) => ({ kind: 'followUp', cardId: card.id, index })),
      mcqs.map((mcq) => ({ kind: 'mcq', cardId: card.id, mcqId: mcq.id })),
      (card.codeChoices ?? []).map((_, index) => ({ kind: 'codeChoice', cardId: card.id, index })),
      (card.questionVariants ?? []).map((_, variant) => ({ kind: 'open', cardId: card.id, variant })),
    ),
  ];
  const lastShown = (exercise: Exercise) => progress.shown[exerciseKey(exercise)] ?? -1;
  return candidates.reduce((best, candidate) => (lastShown(candidate) < lastShown(best) ? candidate : best));
}

/** Returns `[a0, b0, c0, a1, b1, c1, ...]`, skipping lists that run out. */
function interleave<T>(...lists: T[][]): T[] {
  const length = Math.max(0, ...lists.map((list) => list.length));
  return Array.from({ length }, (_, index) => lists.map((list) => list[index]))
    .flat()
    .filter((item): item is T => item !== undefined);
}
