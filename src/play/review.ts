import type { Card, Mcq } from '../content/types.ts';
import { exerciseKey, pickQuestion, type Exercise } from './engine.ts';
import { topicStatus, type MissedQuestion, type Progress } from './progress.ts';
import { SERIES_LENGTH } from './series.ts';

/**
 * The weak-spots review: a series made of the questions the learner missed last time, on the
 * topics they handle least, for the last days before an interview.
 */

/**
 * Remembers whether a question was missed: a miss keeps it for the review, a right answer clears
 * it. Call it for first-pass answers only: a replay right after reading the answer proves nothing.
 */
export function trackMissed(progress: Progress, exercise: Exercise, correct: boolean): Progress {
  const key = exerciseKey(exercise);
  const missed = { ...progress.missed };
  if (correct) {
    delete missed[key];
  } else {
    missed[key] = { exercise, step: progress.step };
  }
  return { ...progress, missed };
}

/** The missed questions of one topic, the most recent miss first. */
function missedOn(progress: Progress, cardId: string): MissedQuestion[] {
  return Object.values(progress.missed ?? {})
    .filter((missed) => missed.exercise.cardId === cardId)
    .toSorted((a, b) => b.step - a.step);
}

/**
 * The weak topics, weakest first: started topics with a missed question or a miss among their
 * last answers, and handled topics that need a check. Ranked by missed questions, then by misses
 * among the last answers, then by how long ago they were last answered.
 */
export function weakTopicIds(topicIds: readonly string[], progress: Progress, now: number): string[] {
  const weakness = (cardId: string) => {
    const state = progress.topics[cardId];
    return {
      cardId,
      missedQuestions: missedOn(progress, cardId).length,
      recentMisses: state?.results.filter((answer) => !answer.correct).length ?? 0,
      lastStep: state?.lastStep ?? -1,
      status: topicStatus(state, now),
    };
  };
  return topicIds
    .map(weakness)
    .filter((topic) => topic.status === 'stale' || (topic.status === 'learning' && (topic.missedQuestions > 0 || topic.recentMisses > 0)))
    .toSorted((a, b) => b.missedQuestions - a.missedQuestions || b.recentMisses - a.recentMisses || a.lastStep - b.lastStep)
    .map((topic) => topic.cardId);
}

/** True when the exercise still exists in the card, in case the content changed since the miss. */
function stillExists(exercise: Exercise, card: Card, mcqs: readonly Mcq[]): boolean {
  switch (exercise.kind) {
    case 'lesson':
      return false;
    case 'open':
      return exercise.variant === undefined || exercise.variant < (card.questionVariants?.length ?? 0);
    case 'followUp':
      return exercise.index < card.followUps.length;
    case 'trap':
      return exercise.index < card.traps.length && (!exercise.twin || card.traps[exercise.index]!.twin !== undefined);
    case 'codeChoice':
      return exercise.index < (card.codeChoices?.length ?? 0);
    case 'mcq':
      return mcqs.some((mcq) => mcq.id === exercise.mcqId);
  }
}

/**
 * Builds a review series: each weak topic contributes its missed questions, most recent first, or
 * its question seen longest ago when nothing on it was missed. Topics take turns so the same one
 * never comes twice in a row while others remain. At most {@link SERIES_LENGTH} questions; fewer
 * when there are few weak spots, and none when there are none.
 */
export function pickReview(cards: readonly Card[], mcqsByCard: ReadonlyMap<string, readonly Mcq[]>, progress: Progress, now: number): Exercise[] {
  const byId = new Map(cards.map((card) => [card.id, card]));
  const queues = weakTopicIds(
    cards.map((card) => card.id),
    progress,
    now,
  ).map((cardId) => {
    const card = byId.get(cardId)!;
    const mcqs = mcqsByCard.get(cardId) ?? [];
    const missed = missedOn(progress, cardId)
      .map((miss) => miss.exercise)
      .filter((exercise) => stillExists(exercise, card, mcqs));
    return missed.length > 0 ? missed : [pickQuestion(card, mcqs, progress)];
  });

  const plan: Exercise[] = [];
  for (let round = 0; plan.length < SERIES_LENGTH && queues.some((queue) => round < queue.length); round += 1) {
    for (const queue of queues) {
      const exercise = queue[round];
      if (exercise && plan.length < SERIES_LENGTH) {
        plan.push(exercise);
      }
    }
  }
  return plan;
}
