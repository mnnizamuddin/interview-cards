import { useState } from 'react';
import { CARDS_BY_ID, MCQS_BY_ID } from '../content/index.ts';
import { McqExercise } from '../exercises/McqExercise.tsx';
import { SayItExercise } from '../exercises/SayItExercise.tsx';
import { TrapExercise } from '../exercises/TrapExercise.tsx';
import type { ExerciseResult } from '../exercises/types.ts';
import type { Exercise } from '../session/build-session.ts';
import { afterStep, type Step } from '../session/queue.ts';

export type SessionSummary = {
  xp: number;
  cardsReviewed: number;
  checksCorrect: number;
  checksTotal: number;
};

/**
 * Runs one session: shows each exercise in turn and brings missed ones back once at the end.
 * Each result is reported at once through `onResult`, so leaving early keeps what was done.
 */
export function SessionScreen({
  exercises,
  onResult,
  onFinish,
  onQuit,
}: {
  exercises: Exercise[];
  onResult: (step: Step, result: ExerciseResult) => void;
  onFinish: (summary: SessionSummary) => void;
  onQuit: () => void;
}) {
  const [queue, setQueue] = useState<Step[]>(exercises);
  const [index, setIndex] = useState(0);
  const [summary, setSummary] = useState<SessionSummary>({ xp: 0, cardsReviewed: 0, checksCorrect: 0, checksTotal: 0 });

  const step = queue[index];

  function handleDone(result: ExerciseResult) {
    if (!step) {
      return;
    }
    onResult(step, result);
    const isCheck = step.kind !== 'say';
    const nextSummary: SessionSummary = {
      xp: summary.xp + result.xp,
      cardsReviewed: summary.cardsReviewed + (step.kind === 'say' && !step.retry ? 1 : 0),
      checksCorrect: summary.checksCorrect + (isCheck && result.passed ? 1 : 0),
      checksTotal: summary.checksTotal + (isCheck ? 1 : 0),
    };
    const nextQueue = afterStep(queue, index, result.passed);
    if (index + 1 >= nextQueue.length) {
      onFinish(nextSummary);
      return;
    }
    setSummary(nextSummary);
    setQueue(nextQueue);
    setIndex(index + 1);
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header className="flex items-center gap-3 py-2">
        <button type="button" onClick={onQuit} aria-label="Quit the session" className="p-2 text-2xl leading-none text-muted">
          ×
        </button>
        <div
          className="h-4 flex-1 overflow-hidden rounded-full bg-surface"
          role="progressbar"
          aria-label="Session progress"
          aria-valuemin={0}
          aria-valuemax={queue.length}
          aria-valuenow={index}
        >
          <div className="h-full rounded-full bg-brand transition-[width] duration-300" style={{ width: `${(index / queue.length) * 100}%` }} />
        </div>
        <span className="min-w-12 text-right font-bold text-gold" aria-label={`${summary.xp} XP this session`}>
          {summary.xp} XP
        </span>
      </header>
      {step?.retry && <p className="pt-2 text-sm font-bold text-danger">Second chance</p>}
      <main className="flex flex-1 flex-col pb-4 pt-3">{step && <StepView key={index} step={step} onDone={handleDone} />}</main>
    </div>
  );
}

function StepView({ step, onDone }: { step: Step; onDone: (result: ExerciseResult) => void }) {
  const card = CARDS_BY_ID.get(step.cardId);
  if (!card) {
    return <p>Unknown card {step.cardId}.</p>;
  }
  if (step.kind === 'say') {
    return <SayItExercise card={card} onDone={onDone} />;
  }
  if (step.kind === 'trap') {
    return <TrapExercise trap={card.traps[step.trapIndex]!} onDone={onDone} />;
  }
  const mcq = MCQS_BY_ID.get(step.mcqId);
  if (!mcq) {
    return <p>Unknown question {step.mcqId}.</p>;
  }
  return <McqExercise mcq={mcq} onDone={onDone} />;
}
