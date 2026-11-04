import { describe, expect, it } from 'vitest';
import type { Exercise } from './engine.ts';
import { currentReplay, recordFirstPass, recordReplay, SERIES_LENGTH, startSeries, type Series } from './series.ts';

function trap(cardId: string, index = 0): Exercise {
  return { kind: 'trap', cardId, index };
}

/** Answers the whole first pass: the questions at the given positions are missed. */
function firstPass(missedAt: number[] = [], handledAt: number[] = []): Series {
  let series = startSeries();
  for (let position = 0; position < SERIES_LENGTH; position += 1) {
    series = recordFirstPass(series, trap(`topic-${position % 4}`, position), !missedAt.includes(position), handledAt.includes(position));
  }
  return series;
}

describe('series', () => {
  it('asks the first-pass questions one by one', () => {
    const series = recordFirstPass(startSeries(), trap('a'), true, false);
    expect(series).toMatchObject({ phase: 'questions', asked: 1, correct: 1, replays: [] });
    expect(currentReplay(series)).toBeUndefined();
  });

  it('ends after the last question when nothing was missed', () => {
    expect(firstPass()).toMatchObject({ phase: 'done', asked: SERIES_LENGTH, correct: SERIES_LENGTH, missedTopics: [] });
  });

  it('replays the missed questions in the order they were missed', () => {
    const series = firstPass([3, 1]);
    expect(series.phase).toBe('replays');
    expect(series.correct).toBe(SERIES_LENGTH - 2);
    expect(series.replays).toEqual([trap('topic-1', 1), trap('topic-3', 3)]);
    expect(currentReplay(series)).toEqual(trap('topic-1', 1));
  });

  it('lists each missed topic once, in order', () => {
    // Positions 1 and 5 are both topic-1.
    expect(firstPass([5, 1, 2]).missedTopics).toEqual(['topic-1', 'topic-2']);
  });

  it('sends a missed replay to the back of the line and ends once every replay is right', () => {
    let series = firstPass([0, 1]);
    series = recordReplay(series, false);
    expect(series.replays).toEqual([trap('topic-1', 1), trap('topic-0', 0)]);
    series = recordReplay(series, true);
    expect(series).toMatchObject({ phase: 'replays', replays: [trap('topic-0', 0)] });
    series = recordReplay(series, true);
    expect(series).toMatchObject({ phase: 'done', replays: [] });
  });

  it('keeps the first-pass score whatever happens in the replays', () => {
    const series = recordReplay(firstPass([0]), true);
    expect(series.correct).toBe(SERIES_LENGTH - 1);
  });

  it('remembers the topics that became handled', () => {
    expect(firstPass([], [2, 3]).handledTopics).toEqual(['topic-2', 'topic-3']);
  });
});
