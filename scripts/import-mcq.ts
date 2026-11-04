/**
 * Copies the quiz questions of the track sections that cards point to (`mcqSections`) from the
 * Senior Full-Stack Track into `src/content/mcq/mXX.json`, one file per track module, so the app
 * downloads a module's questions only when a card that uses them is played. The track lives next to this
 * project on the author's machine only, so the generated file is committed and Vercel never
 * needs the track.
 *
 * Usage: pnpm import-mcq [path to backend-drills/track/modules/en]
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { ALL_CARDS } from '../src/content/cards/index.ts';
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
const outDir = join(import.meta.dirname, '../src/content/mcq');
const sectionsFile = join(import.meta.dirname, '../src/content/track-sections.generated.json');

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

const wanted = new Set(ALL_CARDS.flatMap((card) => card.mcqSections));
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

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir);
for (const moduleId of moduleIds) {
  const questions = mcqs.filter((mcq) => mcq.module === moduleId);
  writeFileSync(join(outDir, `${moduleId}.json`), `${JSON.stringify(questions, null, 2)}\n`);
}
console.log(`Wrote ${mcqs.length} questions from ${moduleIds.join(', ')} to ${outDir}`);

/**
 * Every track section that has quiz questions, so a test can check that each one has a card
 * (the track itself is not available on Vercel).
 */
function sectionsWithQuestions(): string[] {
  const allModuleIds = readdirSync(modulesDir)
    .filter((file) => /^m\d+\.js$/.test(file))
    .map((file) => file.replace('.js', ''))
    .toSorted();
  return allModuleIds.flatMap((moduleId) => {
    const sections = loadTrackModule(moduleId).quiz.map((question) => `${moduleId}#${question.section}`);
    return [...new Set(sections)];
  });
}

const trackSections = sectionsWithQuestions();
writeFileSync(sectionsFile, `${JSON.stringify(trackSections, null, 2)}\n`);
console.log(`Wrote ${trackSections.length} track sections with questions to ${sectionsFile}`);
