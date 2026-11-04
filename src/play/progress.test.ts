import { describe, expect, it } from 'vitest';
import {
  countHandled,
  emptyProgress,
  HANDLED_FOR_MS,
  isHandled,
  recordAnswer,
  recordLesson,
  toCurrentProgress,
  topicStatus,
  type Progress,
} from './progress.ts';

/** A fixed moment: the tests never read the real clock. */
const NOW = Date.UTC(2026, 10, 4, 9, 0);

const right = (graded: boolean, at = NOW) => ({ correct: true, graded, at });
const wrong = (graded: boolean, at = NOW) => ({ correct: false, graded, at });

function answer(progress: Progress, cardId: string, ...answers: ReturnType<typeof right>[]): Progress {
  return answers.reduce((current, given) => recordAnswer(current, cardId, `open:${cardId}`, given), progress);
}

describe('recordAnswer', () => {
  it('moves the step forward and keeps the last three answers', () => {
    const progress = answer(emptyProgress(), 'js-closures', wrong(true), right(false), right(true), right(false));
    expect(progress.step).toBe(4);
    expect(progress.topics['js-closures']).toMatchObject({ answered: 4, correct: 3, lastStep: 4 });
    expect(progress.topics['js-closures']?.results).toEqual([right(false), right(true), right(false)]);
    expect(progress.shown['open:js-closures']).toBe(4);
  });
});

describe('recordLesson', () => {
  it('marks the lesson as seen without counting an answer', () => {
    const progress = recordLesson(emptyProgress(), 'js-closures', 'lesson:js-closures');
    expect(progress.step).toBe(0);
    expect(progress.topics['js-closures']).toMatchObject({ lessonSeen: true, answered: 0 });
    expect(topicStatus(progress.topics['js-closures'], NOW)).toBe('new');
  });
});

describe('isHandled', () => {
  it('needs the last three answers right', () => {
    let progress = answer(emptyProgress(), 'a', right(true), right(false));
    expect(isHandled(progress.topics['a'], NOW)).toBe(false);
    progress = answer(progress, 'a', right(false));
    expect(isHandled(progress.topics['a'], NOW)).toBe(true);
    progress = answer(progress, 'a', wrong(true));
    expect(isHandled(progress.topics['a'], NOW)).toBe(false);
  });

  it('needs at least one of them graded by the app', () => {
    const selfChecked = answer(emptyProgress(), 'a', right(false), right(false), right(false));
    expect(topicStatus(selfChecked.topics['a'], NOW)).toBe('learning');
    const withOneGraded = answer(selfChecked, 'a', right(true));
    expect(topicStatus(withOneGraded.topics['a'], NOW)).toBe('handled');
  });

  it('needs a check once the last answer is older than the validity, until answered again', () => {
    const progress = answer(emptyProgress(), 'a', right(true), right(false), right(false));
    expect(topicStatus(progress.topics['a'], NOW + HANDLED_FOR_MS)).toBe('handled');
    const later = NOW + HANDLED_FOR_MS + 1;
    expect(topicStatus(progress.topics['a'], later)).toBe('stale');
    expect(countHandled(['a'], progress, later)).toBe(0);
    // A graded right answer refreshes it.
    const refreshed = answer(progress, 'a', right(true, later));
    expect(topicStatus(refreshed.topics['a'], later)).toBe('handled');
  });

  it('gives the validity as three days', () => {
    expect(HANDLED_FOR_MS).toBe(3 * 24 * 60 * 60 * 1000);
  });
});

describe('toCurrentProgress', () => {
  it('keeps a current document as it is', () => {
    const progress = answer(emptyProgress(), 'a', right(true));
    expect(toCurrentProgress(progress, NOW)).toEqual(progress);
  });

  it('upgrades version 2: old results become self-checked answers given now', () => {
    const old = {
      version: 2,
      step: 3,
      topics: { a: { lessonSeen: true, results: [true, true, true], answered: 3, correct: 3, lastStep: 3 } },
      shown: { 'open:a': 3 },
    };
    const upgraded = toCurrentProgress(old, NOW);
    expect(upgraded).toMatchObject({ version: 3, step: 3, shown: { 'open:a': 3 } });
    expect(upgraded?.topics['a']?.results).toEqual([right(false), right(false), right(false)]);
    // Handled before, it now needs one graded answer to count again.
    expect(topicStatus(upgraded?.topics['a'], NOW)).toBe('learning');
  });

  it('rejects anything else', () => {
    expect(toCurrentProgress({ version: 1, cards: {}, days: {}, settings: {} }, NOW)).toBeNull();
    expect(toCurrentProgress(null, NOW)).toBeNull();
  });
});
