import type { Unit } from '../types.ts';

/** The French title and description of each unit, by unit id. The English ones are in `../units.ts`. */
export const UNITS_FR: Record<string, Pick<Unit, 'title' | 'description'>> = {
  'js-core': {
    title: 'Les bases de JavaScript',
    description: 'Portée, closures, `this`, prototypes, égalité, modules, copies et mémoire.',
  },
  'async-js': {
    title: 'JavaScript asynchrone',
    description: 'L’event loop, les promesses, `await`, l’annulation, le debounce et les tâches longues.',
  },
  typescript: {
    title: 'TypeScript',
    description: 'Config stricte, narrowing, unions, génériques, validation et typage des composants React.',
  },
  'web-platform': {
    title: 'HTML, CSS et le navigateur',
    description: 'Layout, rendu, stockage, accessibilité et façons de rendre une page.',
  },
  react: {
    title: 'React et le state',
    description: 'Rendu, hooks, formulaires, mémoïsation, listes et tests de composants.',
  },
  'web-performance': {
    title: 'Performance web',
    description: 'Code splitting, lazy loading, images, bundles, resource hints, jank et workers.',
  },
  'frontend-architecture': {
    title: 'Architecture frontend',
    description: 'Les grosses applis à plusieurs équipes : design systems, micro-frontends, monorepos et migrations.',
  },
  'frontend-design': {
    title: 'System design frontend',
    description: 'L’épreuve de conception frontend : autocomplétion, tableau en temps réel, page produit, checkout, fil d’actualité.',
  },
  'coding-rounds': {
    title: 'Épreuves de code frontend',
    description: 'Utilitaires from scratch, machine coding, tests à la maison, code review et debugging.',
  },
  frameworks: {
    title: 'Autres frameworks',
    description: 'Vue, Angular, signals et islands : ce qu’un dev React doit en savoir.',
  },
  node: {
    title: 'Node.js en production',
    description: 'L’event loop sous charge, plusieurs cœurs, deadlines, retries, concurrence et streams.',
  },
  'backend-api': {
    title: 'Backend et conception d’API',
    description: 'REST et GraphQL, HTTP, middlewares, auth, CORS, rate limiting et jobs longs.',
  },
  databases: {
    title: 'Bases de données',
    description: 'SQL et NoSQL, index, transactions, pooling, sharding et conception de schéma.',
  },
  sql: {
    title: 'Requêtes SQL',
    description: 'Jointures, `NULL`, agrégats, CTE, `LATERAL`, fonctions de fenêtrage et upserts sous PostgreSQL.',
  },
  mongodb: {
    title: 'MongoDB',
    description: 'Patterns de schéma, index, agrégation, replica sets, transactions et change streams.',
  },
  'system-design': {
    title: 'System design',
    description: 'Concevoir des services de bout en bout : scalabilité, cache, temps réel, uploads et checkout.',
  },
  messaging: {
    title: 'Files, événements et caches',
    description: 'Files de messages, Kafka, dead letters, outbox, event sourcing, ordre des messages et patterns de cache.',
  },
  delivery: {
    title: 'Tests, DevOps et livraison',
    description: 'Tests, CI/CD, Docker, infrastructure as code, feature flags et déploiements.',
  },
  security: {
    title: 'Sécurité',
    description: 'XSS, injection SQL, CSRF, secrets, HTTPS et revue de sécurité avant la mise en production.',
  },
  llm: {
    title: 'Fonctionnalités LLM',
    description: 'Tokens, streaming, sortie structurée, tool calling, RAG, prompt injection et évaluation.',
  },
  behavioural: {
    title: 'Comportemental et mises en situation',
    description: 'Raconter ton travail avec une structure claire et de vrais compromis.',
  },
  'interview-loop': {
    title: 'Le processus de recrutement',
    description: 'Chaque étape : appel RH, live coding, test à la maison, épreuve avec l’IA, tes questions.',
  },
  trends: {
    title: 'Tendances du secteur',
    description: 'Assistants IA, edge functions, meta-frameworks, Web Components et Web Vitals.',
  },
};
