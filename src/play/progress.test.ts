import { describe, expect, it } from 'vitest';
import { countHandled, emptyProgress, isHandled, isProgress, recordAnswer, recordLesson } from './progress.ts';

describe('recordAnswer', () => {
  it('moves the step forward and keeps the last three results', () => {
    let progress = emptyProgress();
    for (const correct of [false, true, true, true]) {
      progress = recordAnswer(progress, 'js-closures', 'open:js-closures', correct);
    }
    expect(progress.step).toBe(4);
    expect(progress.topics['js-closures']).toMatchObject({ results: [true, true, true], answered: 4, correct: 3, lastStep: 4 });
    expect(progress.shown['open:js-closures']).toBe(4);
  });
});

describe('recordLesson', () => {
  it('marks the lesson as seen without counting an answer', () => {
    const progress = recordLesson(emptyProgress(), 'js-closures', 'lesson:js-closures');
    expect(progress.step).toBe(0);
    expect(progress.topics['js-closures']).toMatchObject({ lessonSeen: true, answered: 0 });
  });
});

describe('isHandled', () => {
  it('needs the last three answers right', () => {
    let progress = emptyProgress();
    for (const correct of [true, true]) {
      progress = recordAnswer(progress, 'a', 'open:a', correct);
    }
    expect(isHandled(progress.topics['a'])).toBe(false);
    progress = recordAnswer(progress, 'a', 'open:a', true);
    expect(isHandled(progress.topics['a'])).toBe(true);
    progress = recordAnswer(progress, 'a', 'open:a', false);
    expect(isHandled(progress.topics['a'])).toBe(false);
    expect(countHandled(['a', 'b'], progress)).toBe(0);
  });
});

describe('isProgress', () => {
  it('accepts the current document and rejects the old day-based one', () => {
    expect(isProgress(emptyProgress())).toBe(true);
    expect(isProgress({ version: 1, cards: {}, days: {}, settings: {} })).toBe(false);
    expect(isProgress(null)).toBe(false);
  });
});
