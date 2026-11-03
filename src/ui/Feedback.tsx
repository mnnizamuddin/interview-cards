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
    <div role="status" className={`rounded-2xl p-4 ${correct ? 'bg-brand-soft' : 'bg-danger-soft'}`}>
      <p className={`mb-1 text-lg font-extrabold ${correct ? 'text-brand' : 'text-danger'}`}>{title}</p>
      <div className="mb-4 text-[0.95rem]">{children}</div>
      <div className="flex flex-col gap-2">
        <Button block variant={correct ? 'primary' : 'danger'} onClick={onContinue} autoFocus>
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
