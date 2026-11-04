import { describe, expect, it } from 'vitest';
import { TOPICS } from './catalog.ts';
import { CARDS, CARDS_BY_ID, MCQS } from './index.ts';
import { loadContent } from './load.ts';
import { cardText, cardTextProblems, mcqTextProblems, translateCard, type CardText, type McqText } from './translation.ts';

/**
 * The French content: one overlay per card file and per track module, laid over the English
 * original. These tests check that every card and question has one, that it mirrors the original
 * (same lists, untouched inline code), and that it reads well on a phone.
 */

const frenchCards = new Map(
  Object.values(import.meta.glob<Record<string, CardText>>('./fr/cards/*.json', { eager: true, import: 'default' })).flatMap((overlay) => Object.entries(overlay)),
);
const frenchMcqs = new Map(
  Object.values(import.meta.glob<Record<string, McqText>>('./fr/mcq/*.json', { eager: true, import: 'default' })).flatMap((overlay) => Object.entries(overlay)),
);

/** Every string of a nested text object, with its path. */
function stringsOf(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') {
    return [[path, value]];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => stringsOf(item, `${path}.${index}`));
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, item]) => stringsOf(item, path ? `${path}.${key}` : key));
  }
  return [];
}

/** The prose of card text or track HTML: inline code, tags and `<code>` elements removed. */
function proseOf(text: string): string {
  return text
    .replace(/<code>[\s\S]*?<\/code>/g, '')
    .replace(/<[^>]+>/g, '')
    .split('`')
    .filter((_, index) => index % 2 === 0)
    .join('');
}

/** About 25% over the English limits of CONTENT.md: French runs longer, the phone stays the same. */
const LIMITS: [RegExp, number][] = [
  [/^topic$/, 48],
  [/^lesson\.intro$/, 380],
  [/^lesson\.points\.\d+$/, 280],
  [/^lesson\.takeaways\.\d+\.term$/, 44],
  [/^lesson\.takeaways\.\d+\.detail$/, 190],
  [/^keyPoints\.\d+$/, 95],
  [/^followUps\.\d+\.answer$/, 400],
  [/^questionVariants\.\d+\.question$/, 330],
  [/^questionVariants\.\d+\.bridge$/, 280],
  [/^codeChoices\.\d+\.prompt$/, 200],
  [/^codeChoices\.\d+\.why$/, 525],
];

describe('French cards', () => {
  it('cover every card, and only known cards', () => {
    expect(CARDS.filter((card) => !frenchCards.has(card.id)).map((card) => card.id)).toEqual([]);
    expect([...frenchCards.keys()].filter((id) => !CARDS_BY_ID.has(id))).toEqual([]);
  });

  it.each(CARDS.filter((card) => frenchCards.has(card.id)).map((card) => [card.id, card] as const))('%s mirrors its English card', (_, card) => {
    const text = frenchCards.get(card.id)!;
    expect(cardTextProblems(card, text)).toEqual([]);
    for (const [path, value] of stringsOf(text)) {
      const limit = LIMITS.find(([pattern]) => pattern.test(path));
      if (limit) {
        expect(value.length, `${path}: ${value}`).toBeLessThanOrEqual(limit[1]);
      }
    }
    expect(text.answer.split(/\s+/).length, 'answer').toBeLessThanOrEqual(135);
    expect(new Set(text.lesson.takeaways?.map((row) => row.term)).size, 'takeaway terms must be unique').toBe(text.lesson.takeaways?.length ?? 0);
  });
});

describe('French track questions', () => {
  it('cover every question, and only known questions', () => {
    const ids = new Set(MCQS.map((mcq) => mcq.id));
    expect(MCQS.filter((mcq) => !frenchMcqs.has(mcq.id)).map((mcq) => mcq.id)).toEqual([]);
    expect([...frenchMcqs.keys()].filter((id) => !ids.has(id))).toEqual([]);
  });

  it('mirror their English questions: same options, untouched code', () => {
    const problems = MCQS.filter((mcq) => frenchMcqs.has(mcq.id)).flatMap((mcq) => mcqTextProblems(mcq, frenchMcqs.get(mcq.id)!).map((problem) => `${mcq.id}.${problem}`));
    expect(problems).toEqual([]);
  });
});

describe('French typography', () => {
  it('puts a no-break space before ? ! : ; and %, and uses typographic apostrophes, outside code', () => {
    const texts = [...frenchCards.values(), ...frenchMcqs.values()].flatMap((text) => stringsOf(text).map(([, value]) => value));
    // A plain space before the mark, or a straight apostrophe between two letters.
    const wrong = texts.filter((text) => / [?!:;%]|\p{L}'\p{L}/u.test(proseOf(text)));
    expect(wrong.slice(0, 5)).toEqual([]);
  });
});

describe('translateCard', () => {
  const card = CARDS_BY_ID.get('js-scope')!;
  const english = cardText(card);

  it('replaces the prose and keeps ids, answers and code', () => {
    const text: CardText = {
      ...english,
      topic: 'Portée',
      traps: english.traps.map((trap) => ({ ...trap, statement: `FR ${trap.statement}` })),
    };
    const translated = translateCard(card, text);
    expect(translated.id).toBe(card.id);
    expect(translated.topic).toBe('Portée');
    expect(translated.traps.map((trap) => trap.isTrue)).toEqual(card.traps.map((trap) => trap.isTrue));
    expect(translated.traps[0]!.statement).toBe(`FR ${card.traps[0]!.statement}`);
    expect(translated.lesson.code).toBe(card.lesson.code);
    expect(translated.codeChoices?.map((choice) => choice.better)).toEqual(card.codeChoices?.map((choice) => choice.better));
  });

  it('round-trips: the English prose laid over the English card gives the same card', () => {
    expect(translateCard(card, english)).toEqual(card);
  });
});

describe('loadContent in French', () => {
  it('lays the French text over the cards and keeps their ids', async () => {
    const topics = TOPICS.filter((topic) => topic.unit === 'js-core');
    const [english, french] = await Promise.all([loadContent(topics, 'en'), loadContent(topics, 'fr')]);
    expect(french.cards.map((card) => card.id)).toEqual(english.cards.map((card) => card.id));
    const first = french.cards[0]!;
    expect(first.question).toBe(frenchCards.get(first.id)?.question ?? english.cards[0]!.question);
    expect([...french.mcqsById.keys()]).toEqual([...english.mcqsById.keys()]);
  });
});
