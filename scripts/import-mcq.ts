/**
 * Copies the quiz questions of the track sections that cards point to (`mcqSections`) from the
 * Senior Full-Stack Track into `src/content/mcq.generated.json`. The track lives next to this
 * project on the author's machine only, so the generated file is committed and Vercel never
 * needs the track.
 *
 * Usage: pnpm import-mcq [path to backend-drills/track/modules/en]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { asyncCards } from '../src/content/cards/async.ts';
import { javascriptCards } from '../src/content/cards/javascript.ts';
import type { Mcq } from '../src/content/types.ts';

type TrackQuestion = {
  id: string;
  section: string;
  q: string;
  code?: string;
  lang?: string;
  options: string[];
  answer: number;
  explain: string;
};

const modulesDir = resolve(process.argv[2] ?? join(import.meta.dirname, '../../backend-drills/track/modules/en'));
const outFile = join(import.meta.dirname, '../src/content/mcq.generated.json');

/** Runs a track module file, which assigns itself to `window.TRACK_CONTENT.en[id]`. */
function loadTrackModule(moduleId: string): { quiz: TrackQuestion[] } {
  const window = { TRACK_CONTENT: { en: {} as Record<string, { quiz: TrackQuestion[] }> } };
  runInNewContext(readFileSync(join(modulesDir, `${moduleId}.js`), 'utf8'), { window });
  const content = window.TRACK_CONTENT.en[moduleId];
  if (!content) {
    throw new Error(`${moduleId}.js did not define window.TRACK_CONTENT.en.${moduleId}`);
  }
  return content;
}

const wanted = new Set([...javascriptCards, ...asyncCards].flatMap((card) => card.mcqSections));
const moduleIds = [...new Set([...wanted].map((ref) => ref.split('#')[0]!))].toSorted();

const mcqs: Mcq[] = moduleIds.flatMap((moduleId) =>
  loadTrackModule(moduleId)
    .quiz.filter((question) => wanted.has(`${moduleId}#${question.section}`))
    .map((question) => ({
      id: `${moduleId}.${question.id}`,
      module: moduleId,
      section: question.section,
      q: question.q,
      ...(question.code === undefined ? {} : { code: question.code, lang: question.lang ?? 'js' }),
      options: question.options,
      answer: question.answer,
      explain: question.explain,
    })),
);

for (const ref of wanted) {
  if (!mcqs.some((mcq) => `${mcq.module}#${mcq.section}` === ref)) {
    console.warn(`No track question found for ${ref}`);
  }
}

writeFileSync(outFile, `${JSON.stringify(mcqs, null, 2)}\n`);
console.log(`Wrote ${mcqs.length} questions from ${moduleIds.join(', ')} to ${outFile}`);
