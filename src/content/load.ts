import type { Language } from '../i18n/language.ts';
import type { Topic } from './catalog.ts';
import { translateCard, translateMcq, type CardText, type McqText } from './translation.ts';
import type { Card, Mcq } from './types.ts';

/**
 * Loads the cards of some topics, with their track questions, on demand. Each card file and each
 * track module's questions is its own chunk, so playing one unit downloads only that unit's files;
 * the service worker then keeps them for offline use. In French, the French overlay of each file
 * (`fr/cards/*.json`, `fr/mcq/*.json`) is downloaded too and laid over the English original.
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
const frenchCardFiles = import.meta.glob<Record<string, CardText>>('./fr/cards/*.json', { import: 'default' });
const frenchMcqFiles = import.meta.glob<Record<string, McqText>>('./fr/mcq/*.json', { import: 'default' });

/** Downloads the card files and question files `topics` need, then keeps only those topics' cards. */
export async function loadContent(topics: readonly Topic[], language: Language = 'en'): Promise<Content> {
  const files = [...new Set(topics.map((topic) => topic.file))];
  const modules = [...new Set(topics.flatMap((topic) => topic.mcqModules))];
  const [cardLists, mcqLists] = await Promise.all([
    Promise.all(files.map((file) => loadCardFile(file, language))),
    Promise.all(modules.map((module) => loadMcqFile(module, language))),
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

/**
 * The French overlay of a content file, or an empty one when it has none: an untranslated card
 * or question then shows in English rather than failing.
 */
async function loadOverlay<Text>(overlays: Record<string, () => Promise<Record<string, Text>>>, path: string, language: Language): Promise<Record<string, Text>> {
  const load = overlays[path];
  if (language === 'en' || !load) {
    return {};
  }
  return load();
}

async function loadCardFile(file: string, language: Language): Promise<Card[]> {
  const load = cardFiles[`./cards/${file}.ts`];
  if (!load) {
    throw new Error(`No card file named ${file}`);
  }
  const [module, overlay] = await Promise.all([load(), loadOverlay(frenchCardFiles, `./fr/cards/${file}.json`, language)]);
  const cards = Object.values(module).filter(Array.isArray).flat() as Card[];
  return cards.map((card) => {
    const text = overlay[card.id];
    return text ? translateCard(card, text) : card;
  });
}

async function loadMcqFile(module: string, language: Language): Promise<Mcq[]> {
  const load = mcqFiles[`./mcq/${module}.json`];
  if (!load) {
    throw new Error(`No track questions for ${module}: run pnpm import-mcq`);
  }
  const [mcqs, overlay] = await Promise.all([load(), loadOverlay(frenchMcqFiles, `./fr/mcq/${module}.json`, language)]);
  return mcqs.map((mcq) => {
    const text = overlay[mcq.id];
    return text ? translateMcq(mcq, text) : mcq;
  });
}
