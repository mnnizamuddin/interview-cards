/**
 * What the app remembers about the learner, stored as one document on the device. There are no
 * days and no schedule: every answer moves a step counter forward, and each topic keeps its last
 * few results, which decide whether it is handled.
 */

export type TopicState = {
  lessonSeen: boolean;
  /** The last results on this topic, oldest first, at most {@link RESULTS_KEPT}. */
  results: boolean[];
  answered: number;
  correct: number;
  /** The step of the last answer on this topic, -1 before the first one. */
  lastStep: number;
};

export type Progress = {
  version: 2;
  /** Number of answers given so far, across all sittings. */
  step: number;
  topics: Record<string, TopicState>;
  /** The step at which each exercise was last shown, by exercise key. */
  shown: Record<string, number>;
};

/** A topic is handled when this many answers in a row on it were right. */
export const RESULTS_KEPT = 3;

export function emptyProgress(): Progress {
  return { version: 2, step: 0, topics: {}, shown: {} };
}

function topicState(progress: Progress, cardId: string): TopicState {
  return progress.topics[cardId] ?? { lessonSeen: false, results: [], answered: 0, correct: 0, lastStep: -1 };
}

export function isHandled(state: TopicState | undefined): boolean {
  return state !== undefined && state.results.length >= RESULTS_KEPT && state.results.every(Boolean);
}

/** Records that the learner read a topic's lesson. It is not an answer, so the step stays. */
export function recordLesson(progress: Progress, cardId: string, lessonKey: string): Progress {
  return {
    ...progress,
    topics: { ...progress.topics, [cardId]: { ...topicState(progress, cardId), lessonSeen: true } },
    shown: { ...progress.shown, [lessonKey]: progress.step },
  };
}

/** Records one answer on a topic and moves the step counter forward. */
export function recordAnswer(progress: Progress, cardId: string, exerciseKey: string, correct: boolean): Progress {
  const step = progress.step + 1;
  const previous = topicState(progress, cardId);
  const state: TopicState = {
    ...previous,
    results: [...previous.results, correct].slice(-RESULTS_KEPT),
    answered: previous.answered + 1,
    correct: previous.correct + (correct ? 1 : 0),
    lastStep: step,
  };
  return {
    ...progress,
    step,
    topics: { ...progress.topics, [cardId]: state },
    shown: { ...progress.shown, [exerciseKey]: step },
  };
}

/** How many of the given topics are handled. */
export function countHandled(cardIds: readonly string[], progress: Progress): number {
  return cardIds.filter((id) => isHandled(progress.topics[id])).length;
}

/** Checks that an imported file looks like a progress document before it replaces the current one. */
export function isProgress(value: unknown): value is Progress {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<Progress>;
  return (
    candidate.version === 2 &&
    typeof candidate.step === 'number' &&
    typeof candidate.topics === 'object' &&
    candidate.topics !== null &&
    typeof candidate.shown === 'object' &&
    candidate.shown !== null
  );
}
