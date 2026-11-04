import { useState } from 'react';
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
  const [choice, setChoice] = useState<boolean | null>(null);
  const correct = choice === trap.isTrue;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <Kicker>Spot the trap</Kicker>
        <h2 className="mt-3 text-xl font-bold">True or false?</h2>
      </div>
      <p className="rounded-3xl border border-line bg-card p-5 text-lg shadow-sm">
        <Text>{trap.statement}</Text>
      </p>
      <div className="mt-auto flex flex-col gap-3">
        {choice === null ? (
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => setChoice(true)}>
              True
            </Button>
            <Button variant="secondary" onClick={() => setChoice(false)}>
              False
            </Button>
          </div>
        ) : (
          <Feedback
            correct={correct}
            title={correct ? 'Correct!' : `It's ${trap.isTrue ? 'true' : 'false'}`}
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
