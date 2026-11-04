/**
 * Writes `src/content/topics.generated.json`: one light entry per card (id, unit, topic name,
 * the card file it lives in, the track modules of its quiz questions), in learning order. The
 * home screen reads only this list; the app loads a card file and its question files when a unit,
 * a series or a mock interview needs them.
 *
 * Run it after adding, moving or renaming a card: `pnpm topics`. A content test fails when the
 * list is out of date.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ALL_CARDS } from '../src/content/cards/index.ts';
import type { Topic } from '../src/content/catalog.ts';
import type { CardText } from '../src/content/translation.ts';
import type { Card } from '../src/content/types.ts';

const cardsDir = join(import.meta.dirname, '../src/content/cards');
const frenchDir = join(import.meta.dirname, '../src/content/fr/cards');
const outFile = join(import.meta.dirname, '../src/content/topics.generated.json');

/** Maps each card id to the card file that declares it. */
async function fileOfEachCard(): Promise<Map<string, string>> {
  const files = readdirSync(cardsDir).filter((file) => file.endsWith('.ts') && file !== 'index.ts');
  const entries = await Promise.all(
    files.map(async (file) => {
      const module: Record<string, unknown> = await import(pathToFileURL(join(cardsDir, file)).href);
      const cards = Object.values(module).filter(Array.isArray).flat() as Card[];
      return cards.map((card) => [card.id, file.replace('.ts', '')] as const);
    }),
  );
  return new Map(entries.flat());
}

/** The French topic name of each card that has a French overlay. */
function frenchTopicNames(): Map<string, string> {
  if (!existsSync(frenchDir)) {
    return new Map();
  }
  const overlays = readdirSync(frenchDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => JSON.parse(readFileSync(join(frenchDir, file), 'utf8')) as Record<string, CardText>);
  return new Map(overlays.flatMap((overlay) => Object.entries(overlay).map(([id, text]) => [id, text.topic] as const)));
}

const files = await fileOfEachCard();
const frenchTopics = frenchTopicNames();
const topics: Topic[] = ALL_CARDS.map((card) => {
  const file = files.get(card.id);
  if (!file) {
    throw new Error(`${card.id} is in ALL_CARDS but in no card file`);
  }
  return {
    id: card.id,
    unit: card.unit,
    topic: card.topic,
    ...(frenchTopics.has(card.id) && { topicFr: frenchTopics.get(card.id) }),
    file,
    mcqModules: [...new Set(card.mcqSections.map((section) => section.split('#')[0]!))].toSorted(),
  };
});

writeFileSync(outFile, `${JSON.stringify(topics, null, 2)}\n`);
console.log(`Wrote ${topics.length} topics to ${outFile}`);
