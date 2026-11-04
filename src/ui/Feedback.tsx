import type { ReactNode } from 'react';
import { Button } from './Button.tsx';

/**
 * The coloured panel shown after a check, with the explanation and the button to move on. After a
 * miss, it also offers the topic's lesson.
 */
export function Feedback({
  correct,
  title,
  children,
  onContinue,
  onReviewLesson,
}: {
  correct: boolean;
  title: string;
  children: ReactNode;
  onContinue: () => void;
  onReviewLesson?: () => void;
}) {
  return (
    <div role="status" className={`rounded-3xl p-4 ${correct ? 'bg-success-soft' : 'bg-danger-soft'}`}>
      <p className={`mb-1 flex items-center gap-2 text-lg font-extrabold ${correct ? 'text-success' : 'text-danger'}`}>
        <span aria-hidden className={`grid size-7 place-items-center rounded-full text-sm text-white ${correct ? 'bg-success' : 'bg-danger'}`}>
          {correct ? '✓' : '✕'}
        </span>
        {title}
      </p>
      <div className="mb-4 text-[0.95rem]">{children}</div>
      <div className="flex flex-col gap-2">
        <Button block variant={correct ? 'success' : 'danger'} onClick={onContinue} autoFocus>
          Continue
        </Button>
        {!correct && onReviewLesson && (
          <Button variant="ghost" onClick={onReviewLesson}>
            Review the lesson
          </Button>
        )}
      </div>
    </div>
  );
}
