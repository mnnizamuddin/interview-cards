import type { ReactNode } from 'react';
import { Button } from './Button.tsx';

/** The coloured panel shown after a check, with the explanation and the button to move on. */
export function Feedback({
  correct,
  title,
  children,
  onContinue,
}: {
  correct: boolean;
  title: string;
  children: ReactNode;
  onContinue: () => void;
}) {
  return (
    <div
      role="status"
      className={`rounded-2xl p-4 ${correct ? 'bg-brand-soft' : 'bg-danger-soft'}`}
    >
      <p className={`mb-1 text-lg font-extrabold ${correct ? 'text-brand' : 'text-danger'}`}>{title}</p>
      <div className="mb-4 text-[0.95rem]">{children}</div>
      <Button block variant={correct ? 'primary' : 'danger'} onClick={onContinue} autoFocus>
        Continue
      </Button>
    </div>
  );
}
