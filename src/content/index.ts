import { asyncCards } from './cards/async.ts';
import { javascriptCards } from './cards/javascript.ts';
import mcqData from './mcq.generated.json';
import type { Card, Mcq, Unit } from './types.ts';

export const UNITS: Unit[] = [
  {
    id: 'js-core',
    title: 'JavaScript core',
    description: 'Scope, closures, `this`, prototypes, equality, modules, copies and memory.',
  },
  {
    id: 'async-js',
    title: 'Async JavaScript',
    description: 'The event loop, promises, `await`, cancellation, debounce and long tasks.',
  },
];

/** Every card, in learning order: new cards are introduced in this order. */
export const CARDS: Card[] = [...javascriptCards, ...asyncCards];

export const MCQS: Mcq[] = mcqData as Mcq[];

/** The track questions that can follow each card, matched by the card's track sections. */
export const MCQS_BY_CARD: ReadonlyMap<string, Mcq[]> = new Map(
  CARDS.map((card) => [card.id, MCQS.filter((mcq) => card.mcqSections.includes(`${mcq.module}#${mcq.section}`))]),
);

export const CARDS_BY_ID: ReadonlyMap<string, Card> = new Map(CARDS.map((card) => [card.id, card]));

export const MCQS_BY_ID: ReadonlyMap<string, Mcq> = new Map(MCQS.map((mcq) => [mcq.id, mcq]));
