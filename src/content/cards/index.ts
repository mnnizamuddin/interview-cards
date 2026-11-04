import type { Card } from '../types.ts';
import { asyncCards } from './async.ts';
import { backendApiCards } from './backend-api.ts';
import { behaviouralCards } from './behavioural.ts';
import { databaseCards } from './databases.ts';
import { deliveryCards } from './delivery.ts';
import { frontendMoreCards } from './frontend-more.ts';
import { javascriptMoreCards } from './javascript-more.ts';
import { javascriptCards } from './javascript.ts';
import { messagingCards } from './messaging.ts';
import { reactAdvancedCards } from './react-advanced.ts';
import { reactStateCards } from './react-state.ts';
import { reactCards } from './react.ts';
import { securityCards } from './security.ts';
import { systemDesignCards } from './system-design.ts';
import { trendsCards } from './trends.ts';
import { webPlatformCards } from './web-platform.ts';

/**
 * Every card, in learning order: new cards are introduced in this order. The pilot units come
 * first, then the units of the full-stack list in the order of its sections, then the cards added
 * for the frontend, backend and React lists.
 */
export const ALL_CARDS: Card[] = [
  ...javascriptCards,
  ...javascriptMoreCards,
  ...asyncCards,
  ...webPlatformCards,
  ...reactCards,
  ...reactStateCards,
  ...reactAdvancedCards,
  ...frontendMoreCards,
  ...backendApiCards,
  ...databaseCards,
  ...systemDesignCards,
  ...messagingCards,
  ...deliveryCards,
  ...securityCards,
  ...behaviouralCards,
  ...trendsCards,
];
