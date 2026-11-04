import type { Card } from '../types.ts';
import { asyncCards } from './async.ts';
import { backendApiCards } from './backend-api.ts';
import { backendMoreCards } from './backend-more.ts';
import { behaviouralCards } from './behavioural.ts';
import { codingRoundCards } from './coding-rounds.ts';
import { databasesMoreCards } from './databases-more.ts';
import { databaseCards } from './databases.ts';
import { deliveryMoreCards } from './delivery-more.ts';
import { deliveryCards } from './delivery.ts';
import { frontendDesignCards } from './frontend-design.ts';
import { frontendGapsCards } from './frontend-gaps.ts';
import { frontendMoreCards } from './frontend-more.ts';
import { interviewLoopCards } from './interview-loop.ts';
import { javascriptMoreCards } from './javascript-more.ts';
import { javascriptCards } from './javascript.ts';
import { llmCards } from './llm.ts';
import { messagingCards } from './messaging.ts';
import { mongodbCards } from './mongodb.ts';
import { nodeAsyncCards } from './node-async.ts';
import { nodeRuntimeCards } from './node-runtime.ts';
import { reactAdvancedCards } from './react-advanced.ts';
import { reactGapsCards } from './react-gaps.ts';
import { reactStateCards } from './react-state.ts';
import { reactCards } from './react.ts';
import { securityCards } from './security.ts';
import { sqlCards } from './sql.ts';
import { systemDesignCards } from './system-design.ts';
import { trendsCards } from './trends.ts';
import { typescriptCards } from './typescript.ts';
import { webPlatformCards } from './web-platform.ts';

/**
 * Every card, in learning order: new cards are introduced in this order. The pilot units come
 * first, then the units of the full-stack list in the order of its sections, then the cards added
 * for the frontend, backend and React lists, then the cards that cover the rest of the Senior
 * Full-Stack Track.
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
  ...typescriptCards,
  ...frontendGapsCards,
  ...reactGapsCards,
  ...nodeRuntimeCards,
  ...nodeAsyncCards,
  ...sqlCards,
  ...databasesMoreCards,
  ...mongodbCards,
  ...backendMoreCards,
  ...deliveryMoreCards,
  ...llmCards,
  ...frontendDesignCards,
  ...codingRoundCards,
  ...interviewLoopCards,
];
