import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CodeChoice } from '../content/types.ts';
import { shuffledOrder } from '../play/shuffle.ts';
import { Button } from '../ui/Button.tsx';
import { CodeBlock } from '../ui/CodeBlock.tsx';
import { Feedback } from '../ui/Feedback.tsx';
import { Kicker } from '../ui/Kicker.tsx';
import { Text } from '../ui/Text.tsx';
import type { ExerciseResult } from './types.ts';

type Version = 'better' | 'worse';

/**
 * "Which code is better?": two versions shown as A and B in a random order. The learner chooses
 * one, then the better one is marked and the explanation shown.
 */
export function CodeChoiceExercise({
  choice,
  onDone,
  onReviewLesson,
  random,
}: {
  choice: CodeChoice;
  onDone: (result: ExerciseResult) => void;
  onReviewLesson?: () => void;
  random?: () => number;
}) {
  const { t } = useTranslation();
  const [versions] = useState<Version[]>(() => shuffledOrder(2, random).map((index) => (index === 0 ? 'better' : 'worse')));
  const [picked, setPicked] = useState<Version | null>(null);
  const correct = picked === 'better';

  function blockStyle(version: Version): string {
    if (picked === null) {
      return 'border-line';
    }
    if (version === 'better') {
      return 'border-success bg-success-soft';
    }
    return version === picked ? 'border-danger' : 'border-line opacity-60';
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <Kicker>{t('codeChoice.kicker')}</Kicker>
        <h2 className="mt-3 text-xl font-bold leading-snug">
          <Text>{choice.prompt}</Text>
        </h2>
      </div>
      {versions.map((version, index) => {
        const label = index === 0 ? 'A' : 'B';
        return (
          <section key={version} aria-label={t('codeChoice.version', { label })} className={`flex flex-col gap-2 rounded-3xl border-2 border-b-4 bg-card p-3 ${blockStyle(version)}`}>
            <p className="flex items-center gap-2 text-sm font-extrabold">
              {t('codeChoice.version', { label })}
              {picked !== null && version === 'better' && <span className="text-success-ink">{t('codeChoice.better')}</span>}
            </p>
            <CodeBlock code={choice[version]} lang={choice.codeLang} wrap />
            {picked === null && (
              <Button variant="secondary" onClick={() => setPicked(version)}>
                {t('codeChoice.choose', { label })}
              </Button>
            )}
          </section>
        );
      })}
      {picked !== null && (
        <div className="mt-auto">
          <Feedback
            correct={correct}
            title={correct ? t('common.correct') : t('codeChoice.isBetter', { label: versions.indexOf('better') === 0 ? 'A' : 'B' })}
            onContinue={() => onDone({ correct })}
            onReviewLesson={onReviewLesson}
          >
            <Text>{choice.why}</Text>
          </Feedback>
        </div>
      )}
    </div>
  );
}
