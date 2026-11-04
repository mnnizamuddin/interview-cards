import { describe, expect, it } from 'vitest';
import type { Card, Mcq } from '../content/types.ts';
import { exerciseKey, nextExercises, type Exercise } from './engine.ts';
import { emptyProgress, recordAnswer, recordLesson, type Progress } from './progress.ts';

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
    followUps: [{ question: 'Deeper?', answer: 'Yes' }],
    traps: [{ statement: 'S', isTrue: true, why: 'W' }],
    mcqSections: [],
  };
}

const CARDS = ['a', 'b', 'c', 'd', 'e'].map(card);
const NO_MCQS = new Map<string, Mcq[]>();
const NEVER = () => 0.99;
const ALWAYS = () => 0;

/** Plays `count` questions, answering each with `answer(cardId)`. */
function play(progress: Progress, count: number, answer: (cardId: string) => boolean, random = NEVER): { progress: Progress; seen: Exercise[] } {
  const seen: Exercise[] = [];
  let current = progress;
  for (let i = 0; i < count; i += 1) {
    for (const exercise of nextExercises(CARDS, NO_MCQS, current, random)) {
      seen.push(exercise);
      current =
        exercise.kind === 'lesson'
          ? recordLesson(current, exercise.cardId, exerciseKey(exercise))
          : recordAnswer(current, exercise.cardId, exerciseKey(exercise), answer(exercise.cardId));
    }
  }
  return { progress: current, seen };
}

describe('nextExercises', () => {
  it('opens a new topic with its lesson, then its interview question', () => {
    expect(nextExercises(CARDS, NO_MCQS, emptyProgress(), NEVER)).toEqual([
      { kind: 'lesson', cardId: 'a' },
      { kind: 'open', cardId: 'a' },
    ]);
  });

  it('asks a new topic straight away, with no lesson, when not teaching', () => {
    expect(nextExercises(CARDS, NO_MCQS, emptyProgress(), NEVER, { teach: false })).toEqual([{ kind: 'open', cardId: 'a' }]);
  });

  it('learns three topics at a time before starting a fourth', () => {
    const { seen } = play(emptyProgress(), 5, () => false);
    const topics = seen.filter((exercise) => exercise.kind !== 'lesson').map((exercise) => exercise.cardId);
    expect(topics).toEqual(['a', 'b', 'c', 'a', 'b']);
  });

  it('starts a new topic as soon as one is handled', () => {
    // a, b, c, a, b, c, a: the seventh right answer makes a handled.
    const { progress } = play(emptyProgress(), 7, () => true);
    expect(nextExercises(CARDS, NO_MCQS, progress, NEVER)[0]).toEqual({ kind: 'lesson', cardId: 'd' });
  });

  it('brings a missed topic back before older topics once it has rested', () => {
    const learning = (results: boolean[], lastStep: number) => ({ lessonSeen: true, results, answered: results.length, correct: 0, lastStep });
    const progress: Progress = {
      version: 2,
      step: 6,
      topics: { a: learning([true], 1), b: learning([false], 2), c: learning([true], 3) },
      shown: {},
    };
    expect(nextExercises(CARDS, NO_MCQS, progress, NEVER)[0]?.cardId).toBe('b');
  });

  it('checks a handled topic when the random source says so', () => {
    const { progress } = play(emptyProgress(), 9, () => true);
    const withD = play(progress, 1, () => false).progress;
    expect(nextExercises(CARDS, NO_MCQS, withD, ALWAYS)[0]?.cardId).toBe('a');
  });

  it('cycles through the questions of a topic, oldest first', () => {
    const solo = [card('a')];
    const mcqs = new Map<string, Mcq[]>([['a', [{ id: 'm23.q1', module: 'm23', section: 'scope', q: 'Q', options: ['x', 'y'], answer: 0, explain: 'E' }]]]);
    let progress = recordLesson(emptyProgress(), 'a', 'lesson:a');
    const kinds: string[] = [];
    for (let i = 0; i < 5; i += 1) {
      const [exercise] = nextExercises(solo, mcqs, progress, NEVER);
      kinds.push(exercise!.kind);
      progress = recordAnswer(progress, 'a', exerciseKey(exercise!), true);
    }
    expect(kinds).toEqual(['open', 'trap', 'followUp', 'mcq', 'open']);
  });

  it('returns nothing without cards', () => {
    expect(nextExercises([], NO_MCQS, emptyProgress())).toEqual([]);
  });
});
