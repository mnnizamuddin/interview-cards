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
   * The list follow-up this answers, as `list#question.followUp`: `fullstack-100#16.2` is the
   * second follow-up of question 16. Only the question is shared with the list.
   */
  fromList?: string;
};

/** A true-or-false statement built from a common mistake. */
export type Trap = {
  statement: string;
  isTrue: boolean;
  why: string;
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
