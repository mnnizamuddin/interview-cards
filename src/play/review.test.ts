import { describe, expect, it } from 'vitest';
import type { Card, Mcq } from '../content/types.ts';
import { exerciseKey, type Exercise } from './engine.ts';
import { emptyProgress, HANDLED_FOR_MS, recordAnswer, type Progress } from './progress.ts';
import { pickReview, trackMissed, weakTopicIds } from './review.ts';
import { SERIES_LENGTH } from './series.ts';

/** A fixed moment: the tests never read the real clock. */
const NOW = Date.UTC(2026, 10, 4, 9, 0);
const NO_MCQS = new Map<string, Mcq[]>();

function card(id: string): Card {
  return {
    id,
    unit: 'js-core',
    topic: `Topic ${id}`,
    lesson: { points: ['One', 'Two', 'Three'] },
    level: 'mid',
    paths: ['frontend'],
    question: `Question ${id}`,
    answer: 'Answer',
    keyPoints: ['One'],
    explanation: 'Why',
    example: 'Story',
    mistakes: [],
    followUps: [
      { question: 'Deeper?', answer: 'Yes' },
      { question: 'Deeper still?', answer: 'Yes' },
    ],
    traps: [
      { statement: 'S', isTrue: true, why: 'W' },
      { statement: 'T', isTrue: false, why: 'W' },
    ],
    mcqSections: [],
  };
}

const trap = (cardId: string, index: number): Exercise => ({ kind: 'trap', cardId, index });
const followUp = (cardId: string, index: number): Exercise => ({ kind: 'followUp', cardId, index });

/** Answers the exercises in order, as a first pass would: recorded, and misses tracked. */
function answer(progress: Progress, answers: [Exercise, boolean][], at = NOW): Progress {
  return answers.reduce((current, [exercise, correct]) => {
    const recorded = recordAnswer(current, exercise.cardId, exerciseKey(exercise), { correct, graded: exercise.kind === 'trap', at });
    return trackMissed(recorded, exercise, correct);
  }, progress);
}

describe('trackMissed', () => {
  it('keeps a missed question and forgets it once it is answered right', () => {
    const missed = answer(emptyProgress(), [[trap('a', 0), false]]);
    expect(Object.keys(missed.missed!)).toEqual(['trap:a:0']);
    expect(answer(missed, [[trap('a', 0), true]]).missed).toEqual({});
  });
});

describe('weakTopicIds', () => {
  it('lists started topics with a miss, weakest first, and leaves out new, clean and handled ones', () => {
    const progress = answer(emptyProgress(), [
      // a: two missed questions.
      [trap('a', 0), false],
      [trap('a', 1), false],
      // b: one missed question.
      [trap('b', 0), false],
      // c: started, nothing missed.
      [trap('c', 0), true],
      // d: handled, three right answers with a graded one.
      [trap('d', 0), true],
      [trap('d', 1), true],
      [followUp('d', 0), true],
    ]);
    expect(weakTopicIds(['a', 'b', 'c', 'd', 'e'], progress, NOW)).toEqual(['a', 'b']);
  });

  it('counts a handled topic that needs a check as weak', () => {
    const handled = answer(emptyProgress(), [
      [trap('d', 0), true],
      [trap('d', 1), true],
      [followUp('d', 0), true],
    ]);
    expect(weakTopicIds(['d'], handled, NOW + HANDLED_FOR_MS + 1)).toEqual(['d']);
  });
});

describe('pickReview', () => {
  const cards = ['a', 'b', 'c'].map(card);

  it('asks the missed questions, most recent first, with topics taking turns', () => {
    const progress = answer(emptyProgress(), [
      [trap('a', 0), false],
      [trap('b', 0), false],
      [followUp('a', 1), false],
    ]);
    expect(pickReview(cards, NO_MCQS, progress, NOW)).toEqual([followUp('a', 1), trap('b', 0), trap('a', 0)]);
  });

  it('asks the question seen longest ago on a weak topic with nothing missed', () => {
    const handled = answer(emptyProgress(), [
      [trap('c', 0), true],
      [trap('c', 1), true],
      [followUp('c', 0), true],
    ]);
    // The main question was never shown, so it comes first.
    expect(pickReview(cards, NO_MCQS, handled, NOW + HANDLED_FOR_MS + 1)).toEqual([{ kind: 'open', cardId: 'c' }]);
  });

  it('is empty without weak spots, and skips questions that no longer exist', () => {
    expect(pickReview(cards, NO_MCQS, emptyProgress(), NOW)).toEqual([]);
    const gone = answer(emptyProgress(), [[trap('a', 7), false]]);
    expect(pickReview(cards, NO_MCQS, gone, NOW)).toEqual([{ kind: 'open', cardId: 'a' }]);
  });

  it('stops at a full series', () => {
    const many = ['p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x'].map(card);
    const progress = answer(
      emptyProgress(),
      many.flatMap((each): [Exercise, boolean][] => [
        [trap(each.id, 0), false],
        [trap(each.id, 1), false],
      ]),
    );
    expect(pickReview(many, NO_MCQS, progress, NOW)).toHaveLength(SERIES_LENGTH);
  });
});
