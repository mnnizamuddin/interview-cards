import { describe, expect, it } from 'vitest';
import { CARDS, MCQS, MCQS_BY_CARD, UNITS } from './index.ts';

/** Shape rules every card must follow, so a new card cannot silently break a session. */
describe('cards', () => {
  it('have unique ids and belong to a known unit', () => {
    expect(new Set(CARDS.map((card) => card.id)).size).toBe(CARDS.length);
    const unitIds = new Set(UNITS.map((unit) => unit.id));
    for (const card of CARDS) {
      expect(unitIds, card.id).toContain(card.unit);
    }
  });

  it.each(CARDS.map((card) => [card.id, card] as const))('%s has every part of the card', (_, card) => {
    expect(card.keyPoints.length).toBeGreaterThanOrEqual(3);
    expect(card.keyPoints.length).toBeLessThanOrEqual(5);
    expect(card.mistakes.length).toBeGreaterThanOrEqual(2);
    expect(card.followUps.length).toBeGreaterThanOrEqual(1);
    expect(card.traps.length).toBeGreaterThanOrEqual(2);
    expect(card.traps.some((trap) => trap.isTrue)).toBe(true);
  });

  it.each(CARDS.map((card) => [card.id, card] as const))('%s keeps the spoken answer short enough to say in about a minute', (_, card) => {
    expect(card.answer.split(/\s+/).length).toBeLessThanOrEqual(110);
  });

  it.each(CARDS.map((card) => [card.id, card] as const))('%s closes every inline code mark', (_, card) => {
    const texts = [
      card.question,
      card.answer,
      card.explanation,
      card.example,
      ...card.keyPoints,
      ...card.mistakes,
      ...card.followUps.flatMap((followUp) => [followUp.question, followUp.answer]),
      ...card.traps.flatMap((trap) => [trap.statement, trap.why]),
    ];
    for (const text of texts) {
      expect(text.split('`').length % 2, text).toBe(1);
    }
  });

  it('point only to track sections that were imported', () => {
    for (const card of CARDS) {
      expect(MCQS_BY_CARD.get(card.id)?.length, card.id).toBeGreaterThan(0);
    }
    expect(MCQS.every((mcq) => mcq.answer >= 0 && mcq.answer < mcq.options.length)).toBe(true);
  });
});
