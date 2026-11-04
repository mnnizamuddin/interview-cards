import type { Card, Mcq, QuestionVariant, Takeaway } from './types.ts';

/**
 * Translations of the content are overlays: they hold only the prose of a card or track question,
 * in the same shape, and are laid over the English original when the interface is in French.
 * Ids, answers (`isTrue`, `answer`), code and every other field come from the English original,
 * so progress, grading and code never depend on the language.
 *
 * French overlays live in `src/content/fr/cards/<card file>.json` (card id → {@link CardText})
 * and `src/content/fr/mcq/<module>.json` (question id → {@link McqText}).
 */

/** The prose of a card: every field a reader sees, nothing that grades or runs. */
export type CardText = {
  topic: string;
  question: string;
  answer: string;
  keyPoints: string[];
  explanation: string;
  example: string;
  mistakes: string[];
  followUps: { question: string; answer: string }[];
  traps: { statement: string; why: string; twin?: { statement: string; why: string } }[];
  lesson: { intro?: string; points: string[]; takeaways?: Takeaway[] };
  questionVariants?: QuestionVariant[];
  codeChoices?: { prompt: string; why: string }[];
};

/** The prose of a track question, as the track's HTML. The code and the right answer are not in it. */
export type McqText = {
  q: string;
  options: string[];
  explain: string;
};

/** The prose of `card`, in its own language. */
export function cardText(card: Card): CardText {
  const { lesson } = card;
  return {
    topic: card.topic,
    question: card.question,
    answer: card.answer,
    keyPoints: card.keyPoints,
    explanation: card.explanation,
    example: card.example,
    mistakes: card.mistakes,
    followUps: card.followUps.map(({ question, answer }) => ({ question, answer })),
    traps: card.traps.map(({ statement, why, twin }) => (twin ? { statement, why, twin: { statement: twin.statement, why: twin.why } } : { statement, why })),
    lesson: {
      ...(lesson.intro !== undefined && { intro: lesson.intro }),
      points: lesson.points,
      ...(lesson.takeaways && { takeaways: lesson.takeaways.map(({ term, detail }) => ({ term, detail })) }),
    },
    ...(card.questionVariants && { questionVariants: card.questionVariants.map(({ question, bridge }) => ({ question, bridge })) }),
    ...(card.codeChoices && { codeChoices: card.codeChoices.map(({ prompt, why }) => ({ prompt, why })) }),
  };
}

/** `card` with its prose replaced by `text`; everything else stays the original's. */
export function translateCard(card: Card, text: CardText): Card {
  return {
    ...card,
    topic: text.topic,
    question: text.question,
    answer: text.answer,
    keyPoints: text.keyPoints,
    explanation: text.explanation,
    example: text.example,
    mistakes: text.mistakes,
    followUps: card.followUps.map((followUp, index) => ({ ...followUp, ...text.followUps[index] })),
    traps: card.traps.map((trap, index) => {
      const translated = text.traps[index];
      return { ...trap, ...translated, ...(trap.twin && translated?.twin && { twin: translated.twin }) };
    }),
    lesson: { ...card.lesson, ...text.lesson },
    ...(card.questionVariants && text.questionVariants && { questionVariants: text.questionVariants }),
    ...(card.codeChoices && {
      codeChoices: card.codeChoices.map((choice, index) => ({ ...choice, ...text.codeChoices?.[index] })),
    }),
  };
}

/** The prose of a track question. */
export function mcqText(mcq: Mcq): McqText {
  return { q: mcq.q, options: mcq.options, explain: mcq.explain };
}

/** `mcq` with its prose replaced by `text`; the code and the right answer stay the original's. */
export function translateMcq(mcq: Mcq, text: McqText): Mcq {
  return { ...mcq, q: text.q, options: text.options, explain: text.explain };
}

/** Inline code in card text: the parts between backticks. */
function codeSpans(text: string): string[] {
  return text.split('`').filter((_, index) => index % 2 === 1);
}

/** Inline code in track HTML: the contents of `<code>` elements. */
function htmlCodeSpans(html: string): string[] {
  return [...html.matchAll(/<code>([\s\S]*?)<\/code>/g)].map((match) => match[1]!);
}

/** The `path: value` pairs of every string in a nested text object, as `traps.0.why`. */
function stringsOf(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') {
    return [[path, value]];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => stringsOf(item, `${path}.${index}`));
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, item]) => stringsOf(item, path ? `${path}.${key}` : key));
  }
  return [];
}

/**
 * How a translation differs in shape from its original: a missing or extra field, a list of
 * another length, an empty string, or inline code that is not exactly the original's (code must
 * never be translated). Returns one message per problem; none means it mirrors the original.
 *
 * @param spans How to find inline code in a string: backticks for cards, `<code>` for track HTML.
 */
export function mirrorProblems(original: object, translation: object, spans: (text: string) => string[]): string[] {
  const originalStrings = new Map(stringsOf(original));
  const translatedStrings = new Map(stringsOf(translation));
  const problems: string[] = [];
  for (const [path, text] of originalStrings) {
    const translated = translatedStrings.get(path);
    if (translated === undefined) {
      problems.push(`${path}: missing`);
      continue;
    }
    if (translated.trim() === '' && text.trim() !== '') {
      problems.push(`${path}: empty`);
      continue;
    }
    const expected = [...new Set(spans(text))].toSorted();
    const actual = [...new Set(spans(translated))].toSorted();
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
      problems.push(`${path}: inline code differs, expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }
  for (const path of translatedStrings.keys()) {
    if (!originalStrings.has(path)) {
      problems.push(`${path}: not in the original`);
    }
  }
  return problems;
}

/** Shape problems of a card translation; see {@link mirrorProblems}. */
export function cardTextProblems(card: Card, text: CardText): string[] {
  const problems = mirrorProblems(cardText(card), text, codeSpans);
  for (const [path, value] of stringsOf(text)) {
    if (value.split('`').length % 2 === 0) {
      problems.push(`${path}: unclosed backtick`);
    }
  }
  return problems;
}

/** Shape problems of a track question translation; see {@link mirrorProblems}. */
export function mcqTextProblems(mcq: Mcq, text: McqText): string[] {
  return mirrorProblems(mcqText(mcq), text, htmlCodeSpans);
}
