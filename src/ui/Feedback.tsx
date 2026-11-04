import type { ReactNode } from 'react';
import { Button } from './Button.tsx';

/**
 * The coloured panel that slides up from the bottom after a check, with a big ✓ or ✕, the
 * explanation and the button to move on. After a miss, it also offers the topic's lesson.
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
    <div
      role="status"
      className={`slide-up sticky bottom-0 -mx-4 border-t-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 ${
        correct ? 'border-success bg-success-soft' : 'border-danger bg-danger-soft'
      }`}
    >
      <p className={`mb-2 flex items-center gap-3 text-2xl font-black ${correct ? 'text-success-ink' : 'text-danger-ink'}`}>
        <span aria-hidden className={`pop grid size-10 place-items-center rounded-full text-xl text-white ${correct ? 'bg-success' : 'bg-danger'}`}>
          {correct ? '✓' : '✕'}
        </span>
        {title}
      </p>
      <div className="mb-4 text-[0.95rem] font-medium">{children}</div>
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
