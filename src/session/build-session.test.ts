import { describe, expect, it } from 'vitest';
import type { Card, Mcq } from '../content/types.ts';
import { emptyProgress, recordCardReview, type Progress } from '../progress/model.ts';
import { buildSession, planToday } from './build-session.ts';

const TODAY = '2026-11-03';

function card(id: string): Card {
  return {
    id,
    unit: 'js-core',
    level: 'mid',
    paths: ['frontend'],
    question: `Question ${id}`,
    answer: 'Answer',
    keyPoints: ['One'],
    explanation: 'Why',
    example: 'Story',
    mistakes: [],
    followUps: [],
    traps: [{ statement: 'S', isTrue: true, why: 'W' }],
    mcqSections: [],
    lessons: [],
  };
}

function mcq(id: string): Mcq {
  return { id, module: 'm23', section: 'scope', q: 'Q', options: ['x', 'y'], answer: 0, explain: 'E' };
}

const CARDS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map(card);
const NO_MCQS = new Map<string, Mcq[]>();

function reviewed(ids: string[], day: string): Progress {
  return ids.reduce((progress, id) => recordCardReview(progress, id, 'good', day), emptyProgress());
}

describe('buildSession', () => {
  it('starts a new learner with the first five cards, each followed by a check', () => {
    const session = buildSession(CARDS, NO_MCQS, emptyProgress(), TODAY);
    expect(session.filter((exercise) => exercise.kind === 'say').map((exercise) => exercise.cardId)).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(session.map((exercise) => exercise.kind).slice(0, 2)).toEqual(['say', 'trap']);
  });

  it('puts due reviews before new cards', () => {
    // Reviewed yesterday with "good": due today.
    const progress = reviewed(['c'], '2026-11-02');
    const session = buildSession(CARDS, NO_MCQS, progress, TODAY);
    expect(session[0]).toEqual({ kind: 'say', cardId: 'c' });
  });

  it('respects the daily limit of new cards', () => {
    const progress = reviewed(['a', 'b', 'c', 'd', 'e'], TODAY);
    expect(buildSession(CARDS, NO_MCQS, progress, TODAY)).toEqual([]);
    expect(planToday(CARDS, progress, TODAY)).toEqual({ dueCount: 0, newCount: 0 });
  });

  it('reviews the soonest cards in practice mode when nothing is due', () => {
    const progress = reviewed(['a', 'b', 'c', 'd', 'e'], TODAY);
    const session = buildSession(CARDS, NO_MCQS, progress, TODAY, true);
    expect(session.filter((exercise) => exercise.kind === 'say')).toHaveLength(5);
  });

  it('rotates the check between traps and track questions across visits', () => {
    const mcqs = new Map<string, Mcq[]>([['a', [mcq('m23.q1')]]]);
    const first = buildSession(CARDS, mcqs, emptyProgress(), TODAY)[1];
    const second = buildSession(CARDS, mcqs, reviewed(['a'], '2026-11-02'), TODAY)[1];
    expect(first).toEqual({ kind: 'trap', cardId: 'a', trapIndex: 0 });
    expect(second).toEqual({ kind: 'mcq', cardId: 'a', mcqId: 'm23.q1' });
  });

  it('mixes traps and track questions within a first session', () => {
    const mcqs = new Map<string, Mcq[]>(CARDS.map((c) => [c.id, [mcq(`${c.id}.q1`)]]));
    const kinds = buildSession(CARDS, mcqs, emptyProgress(), TODAY)
      .filter((exercise) => exercise.kind !== 'say')
      .map((exercise) => exercise.kind);
    expect(kinds).toEqual(['trap', 'mcq', 'trap', 'mcq', 'trap']);
  });
});
