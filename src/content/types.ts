/**
 * Content model. Text fields are plain strings where `backticks` mark inline code; the UI
 * renders them as <code>. Imported track questions are the exception: they carry the track's
 * own HTML (see {@link Mcq}).
 */

export type Level = 'junior' | 'mid' | 'senior';

export type Path = 'frontend' | 'backend' | 'fullstack' | 'react';

/** A deeper question the interviewer asks after a good answer. */
export type FollowUp = {
  question: string;
  answer: string;
  /**
   * The list follow-ups this answers, as `list#question.followUp`: `fullstack-100#16.2` is the
   * second follow-up of question 16. Several lists often ask the same follow-up, so one of ours
   * can answer several. Only the questions are shared with the lists.
   */
  fromLists?: string[];
};

/** A true-or-false statement built from a common mistake. */
export type Trap = {
  statement: string;
  isTrue: boolean;
  why: string;
  /**
   * The same fact stated the other way, so its answer is the opposite of `isTrue`. Asked on its
   * own, it stops the learner from remembering "this sentence is false" instead of the fact.
   */
  twin?: {
    statement: string;
    why: string;
  };
};

/**
 * Another way to ask the topic's main question, often as a production scenario, answered by the
 * same model answer and key points.
 */
export type QuestionVariant = {
  question: string;
  /** Shown above the model answer: how this question maps to the topic, for a scenario which concept the symptom points to. */
  bridge: string;
};

/**
 * The bite-sized lesson shown before a topic's first question and after a miss: what you need
 * to know to answer, in a few short points, with an optional short code example.
 */
export type Lesson = {
  points: string[];
  code?: string;
  codeLang?: 'js' | 'ts' | 'tsx' | 'sql' | 'css' | 'html' | 'bash' | 'http';
};

/**
 * "Which code is better?": two versions of the same code, one clearly better for a reason the
 * prompt points at. They are shown in a random order; the learner picks one, then sees why.
 */
export type CodeChoice = {
  /** What both versions do and what to judge: "Both load an order's lines. Which one should ship?" */
  prompt: string;
  codeLang: NonNullable<Lesson['codeLang']>;
  better: string;
  worse: string;
  /** Why the better version wins, and what goes wrong with the other one. */
  why: string;
};

/** One interview question, with everything needed to rehearse and check the answer. */
export type Card = {
  id: string;
  unit: string;
  /** The topic's short name, as listed on the home screen: "Closures", "CORS". */
  topic: string;
  lesson: Lesson;
  level: Level;
  paths: Path[];
  question: string;
  /** Other ways to ask the main question; the model answer and key points stay the same. */
  questionVariants?: QuestionVariant[];
  /** The model answer, written to be said aloud in about a minute. */
  answer: string;
  /** What a good spoken answer must contain; the learner ticks the ones they said. */
  keyPoints: string[];
  /** Why interviewers ask it and what they listen for. */
  explanation: string;
  /** A production story from the running example (the shop's storefront, back office and API). */
  example: string;
  mistakes: string[];
  followUps: FollowUp[];
  traps: Trap[];
  /** "Which code is better?" pairs, on topics where code makes sense. */
  codeChoices?: CodeChoice[];
  /** Track sections whose quiz questions become quick checks, as `m23#scope`. May be empty. */
  mcqSections: string[];
  /**
   * The public question lists this card answers, as `list#number`, for example
   * `fullstack-100#16` for question 16 of Mocklingo's full-stack list. Only the question is shared:
   * every answer is our own.
   */
  fromLists?: string[];
};

export type Unit = {
  id: string;
  title: string;
  description: string;
};

/** A multiple-choice question imported from the track. Its text is trusted HTML from the track. */
export type Mcq = {
  id: string;
  module: string;
  section: string;
  q: string;
  code?: string;
  lang?: string;
  options: string[];
  answer: number;
  explain: string;
};
