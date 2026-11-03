import { useState } from 'react';
import type { Trap } from '../content/types.ts';
import { Button } from '../ui/Button.tsx';
import { Feedback } from '../ui/Feedback.tsx';
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
  onReviewLesson: () => void;
}) {
  const [choice, setChoice] = useState<boolean | null>(null);
  const correct = choice === trap.isTrue;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <p className="mb-2 text-sm font-bold uppercase tracking-wider text-gold">Spot the trap</p>
        <h2 className="text-xl font-bold">True or false?</h2>
      </div>
      <p className="rounded-2xl border-2 border-line p-4 text-lg">
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
