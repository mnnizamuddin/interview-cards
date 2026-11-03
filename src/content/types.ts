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
};

/** A true-or-false statement built from a common mistake. */
export type Trap = {
  statement: string;
  isTrue: boolean;
  why: string;
};

/** Where the full lesson lives in the Senior Full-Stack Track. */
export type LessonRef = {
  module: string;
  section: string;
  title: string;
};

/** One interview question, with everything needed to rehearse and check the answer. */
export type Card = {
  id: string;
  unit: string;
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
  /** Track sections whose quiz questions become "what does this print" checks, as `m23#scope`. */
  mcqSections: string[];
  lessons: LessonRef[];
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
