import { describe, expect, it } from 'vitest';
import { CARDS, MCQS, UNITS } from './index.ts';
import { QUESTION_LISTS } from './lists.ts';
import TRACK_SECTIONS from './track-sections.generated.json';

/** `list#1` to `list#count`. */
function listReferences(listId: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => `${listId}#${index + 1}`);
}

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

  it.each(CARDS.map((card) => [card.id, card] as const))('%s has a short topic name and a bite-sized lesson', (_, card) => {
    expect(card.topic, 'topic').toBeTruthy();
    expect(card.topic!.length).toBeLessThanOrEqual(40);
    expect(card.lesson, 'lesson').toBeDefined();
    const { points, code, codeLang } = card.lesson!;
    expect(points.length).toBeGreaterThanOrEqual(3);
    expect(points.length).toBeLessThanOrEqual(5);
    for (const point of points) {
      expect(point.length, point).toBeLessThanOrEqual(220);
      expect(point.split('`').length % 2, point).toBe(1);
    }
    if (code !== undefined) {
      expect(code.split('\n').length).toBeLessThanOrEqual(10);
      expect(codeLang, 'codeLang is required with code').toBeDefined();
    }
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
    const imported = new Set(MCQS.map((mcq) => `${mcq.module}#${mcq.section}`));
    for (const card of CARDS) {
      for (const section of card.mcqSections) {
        expect(imported, `${card.id} → ${section}: run pnpm import-mcq`).toContain(section);
      }
    }
    expect(MCQS.every((mcq) => mcq.answer >= 0 && mcq.answer < mcq.options.length)).toBe(true);
  });

  it.each(QUESTION_LISTS.map((list) => [list.id, list] as const))('answer every question of %s exactly once', (_, list) => {
    const references = CARDS.flatMap((card) => card.fromLists ?? []).filter((reference) => reference.startsWith(`${list.id}#`));
    expect(new Set(references).size, 'a list question is used twice').toBe(references.length);
    const missing = listReferences(list.id, list.questions).filter((reference) => !references.includes(reference));
    expect(missing).toEqual([]);
  });

  it.each(QUESTION_LISTS.map((list) => [list.id, list] as const))('answer every follow-up of %s exactly once', (_, list) => {
    const references = CARDS.flatMap((card) => card.followUps.flatMap((followUp) => followUp.fromLists ?? [])).filter((reference) =>
      reference.startsWith(`${list.id}#`),
    );
    expect(new Set(references).size, 'a list follow-up is used twice').toBe(references.length);
    const expected = listReferences(list.id, list.questions).flatMap((question) =>
      Array.from({ length: list.followUpsPerQuestion }, (_, index) => `${question}.${index + 1}`),
    );
    expect(expected.filter((reference) => !references.includes(reference))).toEqual([]);
  });

  it.each(CARDS.map((card) => [card.id, card] as const))('%s keeps follow-up answers short and their list references well formed', (_, card) => {
    const knownLists = new Set(QUESTION_LISTS.map((list) => list.id));
    for (const reference of card.fromLists ?? []) {
      expect(knownLists, reference).toContain(reference.split('#')[0]);
    }
    for (const followUp of card.followUps) {
      expect(followUp.answer.length, followUp.question).toBeLessThanOrEqual(320);
      for (const reference of followUp.fromLists ?? []) {
        expect(reference).toMatch(/^[a-z]+-\d+#\d+\.\d$/);
        // A follow-up belongs to a card that answers its main question.
        expect(card.fromLists ?? [], reference).toContain(reference.split('.')[0]);
      }
    }
  });

  it('has a card for every track section that has quiz questions', () => {
    const linked = new Set(CARDS.flatMap((card) => card.mcqSections));
    const missing = TRACK_SECTIONS.filter((section) => !linked.has(section));
    expect(missing).toEqual([]);
  });

  it('every unit has at least one card', () => {
    for (const unit of UNITS) {
      expect(CARDS.some((card) => card.unit === unit.id), unit.id).toBe(true);
    }
  });
});
