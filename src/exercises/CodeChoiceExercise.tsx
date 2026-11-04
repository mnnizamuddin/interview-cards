import { useState } from 'react';
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
  const [versions] = useState<Version[]>(() => shuffledOrder(2, random).map((index) => (index === 0 ? 'better' : 'worse')));
  const [picked, setPicked] = useState<Version | null>(null);
  const correct = picked === 'better';

  function blockStyle(version: Version): string {
    if (picked === null) {
      return 'border-line';
    }
    if (version === 'better') {
      return 'border-success ring-2 ring-success/25';
    }
    return version === picked ? 'border-danger' : 'border-line opacity-60';
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <Kicker>Which code is better?</Kicker>
        <h2 className="mt-3 text-xl font-bold leading-snug">
          <Text>{choice.prompt}</Text>
        </h2>
      </div>
      {versions.map((version, index) => {
        const label = index === 0 ? 'A' : 'B';
        return (
          <section key={version} aria-label={`Version ${label}`} className={`flex flex-col gap-2 rounded-3xl border bg-card p-3 shadow-sm ${blockStyle(version)}`}>
            <p className="flex items-center gap-2 text-sm font-extrabold">
              Version {label}
              {picked !== null && version === 'better' && <span className="text-success">✓ better</span>}
            </p>
            <CodeBlock code={choice[version]} lang={choice.codeLang} wrap />
            {picked === null && (
              <Button variant="secondary" onClick={() => setPicked(version)}>
                Choose {label}
              </Button>
            )}
          </section>
        );
      })}
      {picked !== null && (
        <div className="mt-auto">
          <Feedback
            correct={correct}
            title={correct ? 'Correct!' : `Version ${versions.indexOf('better') === 0 ? 'A' : 'B'} is better`}
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
