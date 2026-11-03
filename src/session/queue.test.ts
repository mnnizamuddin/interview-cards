import { describe, expect, it } from 'vitest';
import { afterStep, type Step } from './queue.ts';

const QUEUE: Step[] = [
  { kind: 'say', cardId: 'a' },
  { kind: 'trap', cardId: 'a', trapIndex: 0 },
];

describe('afterStep', () => {
  it('keeps the queue when the step is passed', () => {
    expect(afterStep(QUEUE, 0, true)).toEqual(QUEUE);
  });

  it('adds a missed step once more at the end', () => {
    expect(afterStep(QUEUE, 1, false).at(-1)).toEqual({ kind: 'trap', cardId: 'a', trapIndex: 0, retry: true });
  });

  it('does not repeat a missed retry', () => {
    const withRetry = afterStep(QUEUE, 1, false);
    expect(afterStep(withRetry, 2, false)).toHaveLength(3);
  });
});
