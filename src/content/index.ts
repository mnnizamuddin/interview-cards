import { ALL_CARDS } from './cards/index.ts';
import type { Card, Mcq } from './types.ts';

/**
 * All the content at once, for tests and scripts. The app never imports this file: it reads the
 * light topic list in `catalog.ts` and loads the cards it needs with `load.ts`, so the content
 * stays out of the first download.
 */

export { UNITS } from './units.ts';

/** Every card, in learning order: new cards are introduced in this order. */
export const CARDS: Card[] = ALL_CARDS;

const mcqFiles = import.meta.glob<Mcq[]>('./mcq/*.json', { eager: true, import: 'default' });

export const MCQS: Mcq[] = Object.keys(mcqFiles)
  .toSorted()
  .flatMap((path) => mcqFiles[path]!);

/** The track questions that can follow each card, matched by the card's track sections. */
export const MCQS_BY_CARD: ReadonlyMap<string, Mcq[]> = new Map(
  CARDS.map((card) => [card.id, MCQS.filter((mcq) => card.mcqSections.includes(`${mcq.module}#${mcq.section}`))]),
);

export const CARDS_BY_ID: ReadonlyMap<string, Card> = new Map(CARDS.map((card) => [card.id, card]));

export const MCQS_BY_ID: ReadonlyMap<string, Mcq> = new Map(MCQS.map((mcq) => [mcq.id, mcq]));
