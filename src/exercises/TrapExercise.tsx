import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Trap } from '../content/types.ts';
import { Button } from '../ui/Button.tsx';
import { Feedback } from '../ui/Feedback.tsx';
import { Kicker } from '../ui/Kicker.tsx';
import { Text } from '../ui/Text.tsx';
import type { ExerciseResult } from './types.ts';

/** "Spot the trap": the learner decides whether a statement from a common mistake is true. */
export function TrapExercise({
  trap,
  onDone,
  onReviewLesson,
}: {
  trap: Trap;
  onDone: (result: ExerciseResult) => void;
  onReviewLesson?: () => void;
}) {
  const { t } = useTranslation();
  const [choice, setChoice] = useState<boolean | null>(null);
  const correct = choice === trap.isTrue;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <Kicker>{t('trap.kicker')}</Kicker>
        <h2 className="mt-3 text-xl font-bold">{t('common.trueOrFalse')}</h2>
      </div>
      <p className="rounded-3xl border-2 border-b-4 border-line bg-card p-5 text-lg">
        <Text>{trap.statement}</Text>
      </p>
      <div className="mt-auto flex flex-col gap-3">
        {choice === null ? (
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => setChoice(true)}>
              {t('common.true')}
            </Button>
            <Button variant="secondary" onClick={() => setChoice(false)}>
              {t('common.false')}
            </Button>
          </div>
        ) : (
          <Feedback
            correct={correct}
            title={correct ? t('common.correct') : trap.isTrue ? t('common.itIsTrue') : t('common.itIsFalse')}
            onContinue={() => onDone({ correct })}
            onReviewLesson={onReviewLesson}
          >
            <Text>{trap.why}</Text>
          </Feedback>
        )}
      </div>
    </div>
  );
}
