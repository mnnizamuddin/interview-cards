/**
 * The public question lists the cards cover (Mocklingo's articles). Only the shape is kept here:
 * how many questions each list has and how many follow-ups each question has. The questions
 * themselves are rephrased on the cards, and every answer is our own.
 */
export type QuestionList = {
  id: string;
  title: string;
  questions: number;
  followUpsPerQuestion: number;
};

export const QUESTION_LISTS: QuestionList[] = [
  { id: 'fullstack-100', title: 'Top 100 full-stack developer questions', questions: 100, followUpsPerQuestion: 3 },
  { id: 'frontend-100', title: 'Top 100 frontend developer questions', questions: 100, followUpsPerQuestion: 2 },
  { id: 'backend-100', title: 'Top 100 backend developer questions', questions: 100, followUpsPerQuestion: 3 },
  { id: 'react-50', title: 'Top 50 React developer questions', questions: 50, followUpsPerQuestion: 3 },
];
