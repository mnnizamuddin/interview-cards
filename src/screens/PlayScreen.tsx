import { useState } from 'react';
import { CARDS_BY_ID, MCQS_BY_CARD, MCQS_BY_ID, UNITS } from '../content/index.ts';
import type { Card } from '../content/types.ts';
import { McqExercise } from '../exercises/McqExercise.tsx';
import { OpenQuestion } from '../exercises/OpenQuestion.tsx';
import { TrapExercise } from '../exercises/TrapExercise.tsx';
import type { ExerciseResult } from '../exercises/types.ts';
import { exerciseKey, nextExercises, type Exercise } from '../play/engine.ts';
import { countHandled, isHandled, recordAnswer, recordLesson, type Progress } from '../play/progress.ts';
import { LessonView } from '../ui/LessonView.tsx';

const UNIT_TITLES = new Map(UNITS.map((unit) => [unit.id, unit.title]));

/**
 * The endless stream of questions on `cards`: every answer is saved at once, and the learner
 * stops whenever they want.
 *
 * With `teach` (unit practice), new topics open with their lesson, a header button shows the
 * current topic's lesson, and a miss offers it. Without it (the main mode), `cards` must be
 * started topics only, and no lesson is ever shown: it is pure recall.
 */
export function PlayScreen({
  cards,
  title,
  teach,
  progress,
  onProgress,
  onStop,
  random = Math.random,
}: {
  cards: Card[];
  title: string;
  teach: boolean;
  progress: Progress;
  onProgress: (progress: Progress) => void;
  onStop: () => void;
  random?: () => number;
}) {
  const [queue, setQueue] = useState<Exercise[]>(() => nextExercises(cards, MCQS_BY_CARD, progress, random, { teach }));
  const [turn, setTurn] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [sitting, setSitting] = useState({ answered: 0, correct: 0 });
  const [justHandled, setJustHandled] = useState<string | null>(null);

  const current = queue[0];
  const card = current ? CARDS_BY_ID.get(current.cardId) : undefined;
  const handledShare = Math.round((countHandled(cards.map((c) => c.id), progress) / Math.max(1, cards.length)) * 100);

  function advance(updated: Progress) {
    const rest = queue.slice(1);
    setQueue(rest.length > 0 ? rest : nextExercises(cards, MCQS_BY_CARD, updated, random, { teach }));
    setTurn((value) => value + 1);
    setReviewing(false);
  }

  function finishLesson(exercise: Exercise) {
    const updated = recordLesson(progress, exercise.cardId, exerciseKey(exercise));
    onProgress(updated);
    setJustHandled(null);
    advance(updated);
  }

  function finishQuestion(exercise: Exercise, { correct }: ExerciseResult) {
    const wasHandled = isHandled(progress.topics[exercise.cardId]);
    const updated = recordAnswer(progress, exercise.cardId, exerciseKey(exercise), correct);
    onProgress(updated);
    setSitting((value) => ({ answered: value.answered + 1, correct: value.correct + (correct ? 1 : 0) }));
    const nowHandled = !wasHandled && isHandled(updated.topics[exercise.cardId]);
    setJustHandled(nowHandled ? (CARDS_BY_ID.get(exercise.cardId)?.topic ?? null) : null);
    advance(updated);
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header className="flex items-center gap-3 py-2">
        <button type="button" onClick={onStop} aria-label="Stop playing" className="p-2 text-2xl leading-none text-muted">
          ×
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{title}</p>
          <div className="h-2 overflow-hidden rounded-full bg-surface" role="progressbar" aria-label="Topics handled" aria-valuenow={handledShare} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-brand transition-[width] duration-300" style={{ width: `${handledShare}%` }} />
          </div>
        </div>
        <span className="text-right text-sm font-bold text-muted" aria-label={`${sitting.correct} right out of ${sitting.answered} this time`}>
          ✓ {sitting.correct}/{sitting.answered}
        </span>
        {teach && current && current.kind !== 'lesson' && !reviewing && (
          <button
            type="button"
            onClick={() => setReviewing(true)}
            className="rounded-full border-2 border-line px-3 py-1 text-sm font-bold text-sky-500"
          >
            Lesson
          </button>
        )}
      </header>

      {justHandled && (
        <p role="status" className="mt-2 rounded-xl bg-brand-soft px-3 py-2 text-sm font-bold text-brand">
          ✓ You now handle {justHandled}
        </p>
      )}

      <main className="flex flex-1 flex-col pb-4 pt-3">
        {current && card && (
          <>
            {reviewing && current.kind !== 'lesson' && (
              <LessonView card={card} unitTitle={UNIT_TITLES.get(card.unit) ?? ''} actionLabel="Back to the question" onDone={() => setReviewing(false)} />
            )}
            <div className={reviewing ? 'hidden' : 'flex flex-1 flex-col'}>
              <ExerciseView
                key={turn}
                exercise={current}
                card={card}
                onLessonDone={() => finishLesson(current)}
                onAnswer={(result) => finishQuestion(current, result)}
                onReviewLesson={teach ? () => setReviewing(true) : undefined}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function ExerciseView({
  exercise,
  card,
  onLessonDone,
  onAnswer,
  onReviewLesson,
}: {
  exercise: Exercise;
  card: Card;
  onLessonDone: () => void;
  onAnswer: (result: ExerciseResult) => void;
  /** Absent in the main mode, which never shows lessons. */
  onReviewLesson?: () => void;
}) {
  switch (exercise.kind) {
    case 'lesson':
      return <LessonView card={card} unitTitle={UNIT_TITLES.get(card.unit) ?? ''} actionLabel="Got it, ask me" onDone={onLessonDone} />;
    case 'open':
      return <OpenQuestion card={card} onDone={onAnswer} onReviewLesson={onReviewLesson} />;
    case 'followUp':
      return <OpenQuestion card={card} followUpIndex={exercise.index} onDone={onAnswer} onReviewLesson={onReviewLesson} />;
    case 'trap':
      return <TrapExercise trap={card.traps[exercise.index]!} onDone={onAnswer} onReviewLesson={onReviewLesson} />;
    case 'mcq': {
      const mcq = MCQS_BY_ID.get(exercise.mcqId);
      return mcq ? <McqExercise mcq={mcq} onDone={onAnswer} onReviewLesson={onReviewLesson} /> : <p>Unknown question.</p>;
    }
  }
}
