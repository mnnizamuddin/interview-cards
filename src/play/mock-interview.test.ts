import { describe, expect, it } from 'vitest';
import type { Card } from '../content/types.ts';
import { exerciseKey } from './engine.ts';
import { pickMockInterview } from './mock-interview.ts';
import { emptyProgress, recordAnswer, type Progress } from './progress.ts';

function card(id: string, followUpCount: number): Card {
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
    followUps: Array.from({ length: followUpCount }, (_, index) => ({ question: `Deeper ${index}?`, answer: 'Yes' })),
    traps: [],
    mcqSections: [],
  };
}

/** Answers a topic right three times, which makes it handled. */
function handle(progress: Progress, cardId: string): Progress {
  let updated = progress;
  for (let i = 0; i < 3; i += 1) {
    updated = recordAnswer(updated, cardId, `open:${cardId}`, true);
  }
  return updated;
}

describe('pickMockInterview', () => {
  it('asks the main question, then up to four follow-ups in the card order', () => {
    const interview = pickMockInterview([card('a', 6)], emptyProgress(), () => 0);
    expect(interview?.questions).toEqual([
      { kind: 'open', cardId: 'a' },
      { kind: 'followUp', cardId: 'a', index: 0 },
      { kind: 'followUp', cardId: 'a', index: 1 },
      { kind: 'followUp', cardId: 'a', index: 2 },
      { kind: 'followUp', cardId: 'a', index: 3 },
    ]);
  });

  it('prefers the follow-ups shown longest ago', () => {
    let progress = emptyProgress();
    for (const index of [0, 1]) {
      progress = recordAnswer(progress, 'a', exerciseKey({ kind: 'followUp', cardId: 'a', index }), true);
    }
    const indexes = pickMockInterview([card('a', 6)], progress, () => 0)!.questions.slice(1).map((question) => (question.kind === 'followUp' ? question.index : -1));
    expect(indexes).toEqual([2, 3, 4, 5]);
  });

  it('picks among topics not handled yet', () => {
    const cards = [card('a', 2), card('b', 2), card('c', 2)];
    const progress = handle(handle(emptyProgress(), 'a'), 'c');
    // Whatever the random draw, only b is left.
    expect(pickMockInterview(cards, progress, () => 0.99)?.cardId).toBe('b');
  });

  it('falls back to every topic once all are handled, and needs cards', () => {
    const cards = [card('a', 2), card('b', 2)];
    const progress = handle(handle(emptyProgress(), 'a'), 'b');
    expect(pickMockInterview(cards, progress, () => 0.99)?.cardId).toBe('b');
    expect(pickMockInterview([], emptyProgress())).toBeUndefined();
  });
});
