import type { Topic } from './catalog.ts';
import type { Card, Mcq } from './types.ts';

/**
 * Loads the cards of some topics, with their track questions, on demand. Each card file and each
 * track module's questions is its own chunk, so playing one unit downloads only that unit's files;
 * the service worker then keeps them for offline use.
 */

/** The cards of the requested topics, ready to play. */
export type Content = {
  /** In learning order. */
  cards: Card[];
  cardsById: ReadonlyMap<string, Card>;
  /** The track questions that can follow each card, matched by the card's track sections. */
  mcqsByCard: ReadonlyMap<string, Mcq[]>;
  mcqsById: ReadonlyMap<string, Mcq>;
};

const cardFiles = import.meta.glob<Record<string, unknown>>(['./cards/*.ts', '!./cards/index.ts']);
const mcqFiles = import.meta.glob<Mcq[]>('./mcq/*.json', { import: 'default' });

/** Downloads the card files and question files `topics` need, then keeps only those topics' cards. */
export async function loadContent(topics: readonly Topic[]): Promise<Content> {
  const files = [...new Set(topics.map((topic) => topic.file))];
  const modules = [...new Set(topics.flatMap((topic) => topic.mcqModules))];
  const [cardLists, mcqLists] = await Promise.all([
    Promise.all(files.map((file) => loadCardFile(file))),
    Promise.all(modules.map((module) => loadMcqFile(module))),
  ]);

  const loaded = new Map(cardLists.flat().map((card) => [card.id, card]));
  const cards = topics.map((topic) => loaded.get(topic.id)).filter((card): card is Card => card !== undefined);
  const mcqs = mcqLists.flat();
  return {
    cards,
    cardsById: new Map(cards.map((card) => [card.id, card])),
    mcqsByCard: new Map(cards.map((card) => [card.id, mcqs.filter((mcq) => card.mcqSections.includes(`${mcq.module}#${mcq.section}`))])),
    mcqsById: new Map(mcqs.map((mcq) => [mcq.id, mcq])),
  };
}

async function loadCardFile(file: string): Promise<Card[]> {
  const load = cardFiles[`./cards/${file}.ts`];
  if (!load) {
    throw new Error(`No card file named ${file}`);
  }
  const module = await load();
  return Object.values(module).filter(Array.isArray).flat() as Card[];
}

async function loadMcqFile(module: string): Promise<Mcq[]> {
  const load = mcqFiles[`./mcq/${module}.json`];
  if (!load) {
    throw new Error(`No track questions for ${module}: run pnpm import-mcq`);
  }
  return load();
}
