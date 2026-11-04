import { describe, expect, it } from 'vitest';
import type { Card, Mcq } from '../content/types.ts';
import { exerciseKey, isGraded, nextExercises, type Exercise } from './engine.ts';
import { emptyProgress, HANDLED_FOR_MS, recordAnswer, recordLesson, type Progress } from './progress.ts';

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
/** A fixed moment: the tests never read the real clock. */
const NOW = Date.UTC(2026, 10, 4, 9, 0);

/** Plays `count` questions, answering each with `answer(cardId)`. */
function play(progress: Progress, count: number, answer: (cardId: string) => boolean, random = NEVER, now = NOW): { progress: Progress; seen: Exercise[] } {
  const seen: Exercise[] = [];
  let current = progress;
  for (let i = 0; i < count; i += 1) {
    for (const exercise of nextExercises(CARDS, NO_MCQS, current, { now, random })) {
      seen.push(exercise);
      current =
        exercise.kind === 'lesson'
          ? recordLesson(current, exercise.cardId, exerciseKey(exercise))
          : recordAnswer(current, exercise.cardId, exerciseKey(exercise), { correct: answer(exercise.cardId), graded: isGraded(exercise), at: now });
    }
  }
  return { progress: current, seen };
}

describe('nextExercises', () => {
  it('opens a new topic with its lesson, then its interview question', () => {
    expect(nextExercises(CARDS, NO_MCQS, emptyProgress(), { now: NOW, random: NEVER })).toEqual([
      { kind: 'lesson', cardId: 'a' },
      { kind: 'open', cardId: 'a' },
    ]);
  });

  it('asks a new topic straight away, with no lesson, when not teaching', () => {
    expect(nextExercises(CARDS, NO_MCQS, emptyProgress(), { now: NOW, random: NEVER, teach: false })).toEqual([{ kind: 'open', cardId: 'a' }]);
  });

  it('learns three topics at a time before starting a fourth', () => {
    const { seen } = play(emptyProgress(), 5, () => false);
    const topics = seen.filter((exercise) => exercise.kind !== 'lesson').map((exercise) => exercise.cardId);
    expect(topics).toEqual(['a', 'b', 'c', 'a', 'b']);
  });

  it('starts a new topic as soon as one is handled', () => {
    // a, b, c, a, b, c, a: the seventh right answer makes a handled (open, trap, follow-up: one graded).
    const { progress } = play(emptyProgress(), 7, () => true);
    expect(nextExercises(CARDS, NO_MCQS, progress, { now: NOW, random: NEVER })[0]).toEqual({ kind: 'lesson', cardId: 'd' });
  });

  it('brings a missed topic back before older topics once it has rested', () => {
    const learning = (results: boolean[], lastStep: number) => ({
      lessonSeen: true,
      results: results.map((correct) => ({ correct, graded: true, at: NOW })),
      answered: results.length,
      correct: 0,
      lastStep,
    });
    const progress: Progress = {
      version: 3,
      step: 6,
      topics: { a: learning([true], 1), b: learning([false], 2), c: learning([true], 3) },
      shown: {},
    };
    expect(nextExercises(CARDS, NO_MCQS, progress, { now: NOW, random: NEVER })[0]?.cardId).toBe('b');
  });

  it('checks a handled topic when the random source says so', () => {
    const { progress } = play(emptyProgress(), 9, () => true);
    const withD = play(progress, 1, () => false).progress;
    expect(nextExercises(CARDS, NO_MCQS, withD, { now: NOW, random: ALWAYS })[0]?.cardId).toBe('a');
  });

  it('cycles through the questions of a topic, oldest first', () => {
    const solo = [card('a')];
    const mcqs = new Map<string, Mcq[]>([['a', [{ id: 'm23.q1', module: 'm23', section: 'scope', q: 'Q', options: ['x', 'y'], answer: 0, explain: 'E' }]]]);
    let progress = recordLesson(emptyProgress(), 'a', 'lesson:a');
    const kinds: string[] = [];
    for (let i = 0; i < 5; i += 1) {
      const [exercise] = nextExercises(solo, mcqs, progress, { now: NOW, random: NEVER });
      kinds.push(exercise!.kind);
      progress = recordAnswer(progress, 'a', exerciseKey(exercise!), { correct: true, graded: isGraded(exercise!), at: NOW });
    }
    expect(kinds).toEqual(['open', 'trap', 'followUp', 'mcq', 'open']);
  });

  it('asks trap twins and other phrasings of the main question as questions of their own', () => {
    const solo: Card[] = [
      {
        ...card('a'),
        traps: [{ statement: 'S', isTrue: true, why: 'W', twin: { statement: 'Not S', why: 'W' } }],
        questionVariants: [{ question: 'Scenario', bridge: 'Bridge' }],
      },
    ];
    let progress = recordLesson(emptyProgress(), 'a', 'lesson:a');
    const keys: string[] = [];
    for (let i = 0; i < 5; i += 1) {
      const [exercise] = nextExercises(solo, NO_MCQS, progress, { now: NOW, random: NEVER });
      keys.push(exerciseKey(exercise!));
      progress = recordAnswer(progress, 'a', exerciseKey(exercise!), { correct: true, graded: isGraded(exercise!), at: NOW });
    }
    expect(keys).toEqual(['open:a', 'trap:a:0', 'followUp:a:0', 'open:a:v0', 'trap:a:0:twin']);
  });

  it('brings back a handled topic that needs a check, as if it were being learned', () => {
    const handledAt = (lastStep: number) => ({
      lessonSeen: true,
      results: [true, true, true].map((correct) => ({ correct, graded: true, at: NOW })),
      answered: 3,
      correct: 3,
      lastStep,
    });
    const progress: Progress = { version: 3, step: 9, topics: { a: handledAt(3), b: handledAt(6), c: handledAt(9) }, shown: {} };
    const fourTopics = CARDS.slice(0, 4);
    // While a, b and c are handled, the new topic d comes next.
    expect(nextExercises(fourTopics, NO_MCQS, progress, { now: NOW, random: NEVER })[0]?.cardId).toBe('d');
    // Once they need a check, they count as being learned again: the oldest rested one comes back first.
    const later = NOW + HANDLED_FOR_MS + 1;
    expect(nextExercises(fourTopics, NO_MCQS, progress, { now: later, random: NEVER })[0]?.cardId).toBe('a');
  });

  it('returns nothing without cards', () => {
    expect(nextExercises([], NO_MCQS, emptyProgress(), { now: NOW })).toEqual([]);
  });
});
