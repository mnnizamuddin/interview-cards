import { useState } from 'react';
import type { Mcq } from '../content/types.ts';
import { XP_FOR_CHECK } from '../progress/model.ts';
import { Feedback } from '../ui/Feedback.tsx';
import { CodeBlock, TrackHtml } from '../ui/Text.tsx';
import type { ExerciseResult } from './types.ts';

/** A multiple-choice question from the Senior Full-Stack Track, often "what does this print?". */
export function McqExercise({ mcq, onDone }: { mcq: Mcq; onDone: (result: ExerciseResult) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked === mcq.answer;

  function optionStyle(index: number): string {
    if (picked === null) {
      return 'border-line bg-page';
    }
    if (index === mcq.answer) {
      return 'border-brand bg-brand-soft';
    }
    return index === picked ? 'border-danger bg-danger-soft' : 'border-line bg-page opacity-60';
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-bold uppercase tracking-wider text-gold">Quick check · track {mcq.module.toUpperCase()}</p>
        <h2 className="text-lg font-bold">
          <TrackHtml html={mcq.q} />
        </h2>
      </div>
      {mcq.code !== undefined && <CodeBlock code={mcq.code} />}
      <ul className="flex flex-col gap-2">
        {mcq.options.map((option, index) => (
          <li key={index}>
            <button
              type="button"
              disabled={picked !== null}
              onClick={() => setPicked(index)}
              className={`press w-full rounded-2xl border-2 px-4 py-3 text-left ${optionStyle(index)}`}
            >
              <TrackHtml html={option} />
            </button>
          </li>
        ))}
      </ul>
      {picked !== null && (
        <div className="mt-auto">
          <Feedback
            correct={correct}
            title={correct ? 'Correct!' : 'Not quite'}
            onContinue={() => onDone({ passed: correct, xp: correct ? XP_FOR_CHECK : 0 })}
          >
            <TrackHtml html={mcq.explain} />
          </Feedback>
        </div>
      )}
    </div>
  );
}
