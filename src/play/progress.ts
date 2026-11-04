/**
 * What the app remembers about the learner, stored as one document on the device. Every answer
 * moves a step counter forward, and each topic keeps its last few answers, which decide whether
 * it is handled.
 */

/** One answer on a topic. */
export type Answer = {
  correct: boolean;
  /** Graded by the app (true/false trap, quick check), not self-checked (open questions). */
  graded: boolean;
  /** When it was given, in milliseconds since the epoch. */
  at: number;
};

export type TopicState = {
  lessonSeen: boolean;
  /** The last answers on this topic, oldest first, at most {@link ANSWERS_KEPT}. */
  results: Answer[];
  answered: number;
  correct: number;
  /** The step of the last answer on this topic, -1 before the first one. */
  lastStep: number;
};

export type Progress = {
  version: 3;
  /** Number of answers given so far, across all sittings. */
  step: number;
  topics: Record<string, TopicState>;
  /** The step at which each exercise was last shown, by exercise key. */
  shown: Record<string, number>;
};

/** A topic is handled when this many answers in a row on it were right. */
export const ANSWERS_KEPT = 3;

/**
 * A handled topic stays handled this long after its last answer, then needs a check: 3 days, so
 * over a one- or two-week interview prep every topic comes back about twice a week.
 */
export const HANDLED_FOR_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Where a topic stands: never answered, being learned, handled, or handled once but not answered
 * for longer than {@link HANDLED_FOR_MS} ("needs a check").
 */
export type TopicStatus = 'new' | 'learning' | 'handled' | 'stale';

export function emptyProgress(): Progress {
  return { version: 3, step: 0, topics: {}, shown: {} };
}

function topicState(progress: Progress, cardId: string): TopicState {
  return progress.topics[cardId] ?? { lessonSeen: false, results: [], answered: 0, correct: 0, lastStep: -1 };
}

/** The last answers were all right, and at least one of them was graded by the app. */
function hasMastery(state: TopicState): boolean {
  return state.results.length >= ANSWERS_KEPT && state.results.every((answer) => answer.correct) && state.results.some((answer) => answer.graded);
}

export function topicStatus(state: TopicState | undefined, now: number): TopicStatus {
  if (!state || state.answered === 0) {
    return 'new';
  }
  if (!hasMastery(state)) {
    return 'learning';
  }
  const lastAnswerAt = state.results.at(-1)!.at;
  return now - lastAnswerAt <= HANDLED_FOR_MS ? 'handled' : 'stale';
}

/**
 * Handled: the last {@link ANSWERS_KEPT} answers were right, at least one graded by the app, and
 * the last one is less than {@link HANDLED_FOR_MS} old.
 */
export function isHandled(state: TopicState | undefined, now: number): boolean {
  return topicStatus(state, now) === 'handled';
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
export function recordAnswer(progress: Progress, cardId: string, exerciseKey: string, answer: Answer): Progress {
  const step = progress.step + 1;
  const previous = topicState(progress, cardId);
  const state: TopicState = {
    ...previous,
    results: [...previous.results, answer].slice(-ANSWERS_KEPT),
    answered: previous.answered + 1,
    correct: previous.correct + (answer.correct ? 1 : 0),
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
export function countHandled(cardIds: readonly string[], progress: Progress, now: number): number {
  return cardIds.filter((id) => isHandled(progress.topics[id], now)).length;
}

function isDocument(value: unknown, version: number): value is { version: number; step: number; topics: Record<string, unknown>; shown: Record<string, number> } {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<Progress> & { version?: number };
  return (
    candidate.version === version &&
    typeof candidate.step === 'number' &&
    typeof candidate.topics === 'object' &&
    candidate.topics !== null &&
    typeof candidate.shown === 'object' &&
    candidate.shown !== null
  );
}

/**
 * Reads a stored or imported progress document in the current format. Version 2 kept only
 * true/false results: they become self-checked answers given at `now`, so a topic handled before
 * needs one graded answer to count again. Returns `null` for anything else.
 */
export function toCurrentProgress(value: unknown, now: number): Progress | null {
  if (isDocument(value, 3)) {
    return value as Progress;
  }
  if (!isDocument(value, 2)) {
    return null;
  }
  const topics = Object.fromEntries(
    Object.entries(value.topics as Record<string, Omit<TopicState, 'results'> & { results: boolean[] }>).map(([id, state]) => [
      id,
      { ...state, results: state.results.map((correct): Answer => ({ correct, graded: false, at: now })) },
    ]),
  );
  return { version: 3, step: value.step, topics, shown: value.shown };
}
