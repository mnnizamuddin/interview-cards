import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Mcq } from '../content/types.ts';
import { shuffledOrder } from '../play/shuffle.ts';
import { Button } from '../ui/Button.tsx';
import { CodeBlock } from '../ui/CodeBlock.tsx';
import { Feedback } from '../ui/Feedback.tsx';
import { Kicker } from '../ui/Kicker.tsx';
import { TrackHtml } from '../ui/Text.tsx';
import type { ExerciseResult } from './types.ts';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * A multiple-choice question, often "what does this print?". The learner selects an option, then
 * checks it, so a slip of the finger is not a wrong answer. Options are shuffled each time the
 * question is shown; the indexes below are the question's own.
 */
export function McqExercise({
  mcq,
  onDone,
  onReviewLesson,
  random,
}: {
  mcq: Mcq;
  onDone: (result: ExerciseResult) => void;
  onReviewLesson?: () => void;
  random?: () => number;
}) {
  const { t } = useTranslation();
  const [order] = useState(() => shuffledOrder(mcq.options.length, random));
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = selected === mcq.answer;

  function optionStyle(index: number): string {
    if (!checked) {
      return index === selected ? 'border-brand bg-brand-soft' : 'border-line bg-card';
    }
    if (index === mcq.answer) {
      return 'border-success bg-success-soft';
    }
    return index === selected ? 'border-danger bg-danger-soft' : 'border-line bg-card opacity-60';
  }

  function badgeStyle(index: number): string {
    if (checked && index === mcq.answer) {
      return 'border-success bg-success text-white';
    }
    if (checked && index === selected) {
      return 'border-danger bg-danger text-white';
    }
    return index === selected ? 'border-brand-strong bg-brand-strong text-white' : 'border-line bg-card text-muted';
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Kicker>{t('common.quickCheck')}</Kicker>
        <h2 className="text-xl font-bold leading-snug">
          <TrackHtml html={mcq.q} />
        </h2>
      </div>
      {mcq.code !== undefined && <CodeBlock code={mcq.code} lang={mcq.lang} />}
      <ul className="flex flex-col gap-2.5">
        {order.map((index, position) => (
          <li key={index}>
            <button
              type="button"
              disabled={checked}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
              className={`press flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-3 text-left font-semibold ${optionStyle(index)}`}
            >
              <span aria-hidden className={`grid size-9 shrink-0 place-items-center rounded-xl border-2 text-sm font-extrabold ${badgeStyle(index)}`}>
                {LETTERS[position]}
              </span>
              <span>
                <TrackHtml html={mcq.options[index]!} />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        {checked ? (
          <Feedback correct={correct} title={correct ? t('common.correct') : t('mcq.notQuite')} onContinue={() => onDone({ correct })} onReviewLesson={onReviewLesson}>
            <TrackHtml html={mcq.explain} />
          </Feedback>
        ) : (
          <Button block disabled={selected === null} onClick={() => setChecked(true)}>
            {t('mcq.check')}
          </Button>
        )}
      </div>
    </div>
  );
}
