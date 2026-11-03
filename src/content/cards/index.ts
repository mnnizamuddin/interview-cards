import type { Card } from '../types.ts';
import { asyncCards } from './async.ts';
import { backendApiCards } from './backend-api.ts';
import { behaviouralCards } from './behavioural.ts';
import { databaseCards } from './databases.ts';
import { deliveryCards } from './delivery.ts';
import { javascriptMoreCards } from './javascript-more.ts';
import { javascriptCards } from './javascript.ts';
import { reactCards } from './react.ts';
import { securityCards } from './security.ts';
import { systemDesignCards } from './system-design.ts';
import { trendsCards } from './trends.ts';
import { webPlatformCards } from './web-platform.ts';

/**
 * Every card, in learning order: new cards are introduced in this order. The pilot units come
 * first, then the units of the full-stack list in the order of its sections.
 */
export const ALL_CARDS: Card[] = [
  ...javascriptCards,
  ...javascriptMoreCards,
  ...asyncCards,
  ...webPlatformCards,
  ...reactCards,
  ...backendApiCards,
  ...databaseCards,
  ...systemDesignCards,
  ...deliveryCards,
  ...securityCards,
  ...behaviouralCards,
  ...trendsCards,
];
