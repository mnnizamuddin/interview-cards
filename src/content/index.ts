import { ALL_CARDS } from './cards/index.ts';
import mcqData from './mcq.generated.json';
import type { Card, Mcq, Unit } from './types.ts';

/** Units in the order the home screen lists them. */
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
  {
    id: 'web-platform',
    title: 'HTML, CSS and the browser',
    description: 'Layout, rendering, storage, accessibility and how pages are rendered.',
  },
  {
    id: 'react',
    title: 'React and state',
    description: 'Rendering, hooks, forms, memoization, lists and testing components.',
  },
  {
    id: 'web-performance',
    title: 'Web performance',
    description: 'Code splitting, lazy loading, images, bundles, resource hints, jank and workers.',
  },
  {
    id: 'frontend-architecture',
    title: 'Frontend architecture',
    description: 'Large apps across teams: design systems, micro-frontends, monorepos and migrations.',
  },
  {
    id: 'frameworks',
    title: 'Other frameworks',
    description: 'Vue, Angular, signals and islands: what a React developer should know about them.',
  },
  {
    id: 'backend-api',
    title: 'Backend and API design',
    description: 'REST and GraphQL, HTTP, middleware, auth, CORS, rate limits and long-running jobs.',
  },
  {
    id: 'databases',
    title: 'Databases',
    description: 'SQL and NoSQL, indexes, transactions, pooling, sharding and schema design.',
  },
  {
    id: 'system-design',
    title: 'System design',
    description: 'Designing services end to end: scaling, caching, real-time, uploads and checkout.',
  },
  {
    id: 'messaging',
    title: 'Queues, events and caches',
    description: 'Message queues, Kafka, dead letters, outbox, event sourcing, ordering and cache patterns.',
  },
  {
    id: 'delivery',
    title: 'Testing, DevOps and delivery',
    description: 'Tests, CI/CD, Docker, infrastructure as code, feature flags and deployments.',
  },
  {
    id: 'security',
    title: 'Security',
    description: 'XSS, SQL injection, CSRF, secrets, HTTPS and a pre-launch security review.',
  },
  {
    id: 'behavioural',
    title: 'Behavioural and scenarios',
    description: 'Stories about your work, told with a clear structure and real trade-offs.',
  },
  {
    id: 'trends',
    title: 'Industry trends',
    description: 'AI assistants, edge functions, meta-frameworks, Web Components and Web Vitals.',
  },
];

/** Every card, in learning order: new cards are introduced in this order. */
export const CARDS: Card[] = ALL_CARDS;

export const MCQS: Mcq[] = mcqData as Mcq[];

/** The track questions that can follow each card, matched by the card's track sections. */
export const MCQS_BY_CARD: ReadonlyMap<string, Mcq[]> = new Map(
  CARDS.map((card) => [card.id, MCQS.filter((mcq) => card.mcqSections.includes(`${mcq.module}#${mcq.section}`))]),
);

export const CARDS_BY_ID: ReadonlyMap<string, Card> = new Map(CARDS.map((card) => [card.id, card]));

export const MCQS_BY_ID: ReadonlyMap<string, Mcq> = new Map(MCQS.map((mcq) => [mcq.id, mcq]));
