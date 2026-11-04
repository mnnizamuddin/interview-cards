import type { Exercise } from './engine.ts';

/**
 * A series: {@link SERIES_LENGTH} questions from the engine, then the missed ones again, like
 * Duolingo, until each is answered right once. Replays are practice: they never change progress,
 * so a topic still has to come back right in a later series to count as handled.
 */

/** Questions per series, lessons not included. */
export const SERIES_LENGTH = 15;

export type SeriesPhase = 'questions' | 'replays' | 'done';

export type Series = {
  phase: SeriesPhase;
  /** Questions answered in the first pass, at most {@link SERIES_LENGTH}. */
  asked: number;
  /** First-pass answers that were right. */
  correct: number;
  /** Missed questions still to replay, the next one first. */
  replays: Exercise[];
  /** Topics missed at least once in the first pass, in order, without repeats. */
  missedTopics: string[];
  /** Topics that became handled during the series, in order. */
  handledTopics: string[];
};

export function startSeries(): Series {
  return { phase: 'questions', asked: 0, correct: 0, replays: [], missedTopics: [], handledTopics: [] };
}

/** The question to replay now, or `undefined` outside the replay phase. */
export function currentReplay(series: Series): Exercise | undefined {
  return series.phase === 'replays' ? series.replays[0] : undefined;
}

/**
 * Records a first-pass answer. A miss is queued for the replays; after the last question the
 * series moves to the replays, or ends when nothing was missed.
 */
export function recordFirstPass(series: Series, exercise: Exercise, correct: boolean, becameHandled: boolean): Series {
  const asked = series.asked + 1;
  const replays = correct ? series.replays : [...series.replays, exercise];
  const missedTopics = correct || series.missedTopics.includes(exercise.cardId) ? series.missedTopics : [...series.missedTopics, exercise.cardId];
  const handledTopics = becameHandled ? [...series.handledTopics, exercise.cardId] : series.handledTopics;
  return {
    phase: phaseAfterFirstPass(asked, replays),
    asked,
    correct: series.correct + (correct ? 1 : 0),
    replays,
    missedTopics,
    handledTopics,
  };
}

function phaseAfterFirstPass(asked: number, replays: Exercise[]): SeriesPhase {
  if (asked < SERIES_LENGTH) {
    return 'questions';
  }
  return replays.length > 0 ? 'replays' : 'done';
}

/** Records the answer to the current replay: right removes it, wrong sends it to the back of the line. */
export function recordReplay(series: Series, correct: boolean): Series {
  const [replayed, ...rest] = series.replays;
  if (!replayed) {
    return series;
  }
  const replays = correct ? rest : [...rest, replayed];
  return { ...series, replays, phase: replays.length > 0 ? 'replays' : 'done' };
}
