import { useState } from 'react';
import { UNITS } from '../content/catalog.ts';
import type { Content } from '../content/load.ts';
import type { Card, Trap } from '../content/types.ts';
import { CodeChoiceExercise } from '../exercises/CodeChoiceExercise.tsx';
import { McqExercise } from '../exercises/McqExercise.tsx';
import { OpenQuestion } from '../exercises/OpenQuestion.tsx';
import { TrapExercise } from '../exercises/TrapExercise.tsx';
import type { ExerciseResult } from '../exercises/types.ts';
import { exerciseKey, isGraded, nextExercises, type Exercise } from '../play/engine.ts';
import { isHandled, recordAnswer, recordLesson, type Progress } from '../play/progress.ts';
import { currentReplay, recordFirstPass, recordReplay, SERIES_LENGTH, startSeries, type Series } from '../play/series.ts';
import { Button } from '../ui/Button.tsx';
import { LessonView } from '../ui/LessonView.tsx';

const UNIT_TITLES = new Map(UNITS.map((unit) => [unit.id, unit.title]));

/**
 * A series of {@link SERIES_LENGTH} questions on `cards`, then the missed ones again until each
 * is right once, then a summary. First-pass answers are saved at once; replays are practice and
 * change nothing.
 *
 * With `teach` (unit practice), new topics open with their lesson, a header button shows the
 * current topic's lesson, and a miss offers it. Without it (the main mode), no lesson is ever
 * shown: it is pure recall.
 */
export function PlayScreen({
  content,
  title,
  teach,
  progress,
  onProgress,
  onStop,
  now,
  random = Math.random,
}: {
  /** The cards to play, already downloaded. */
  content: Content;
  title: string;
  teach: boolean;
  progress: Progress;
  onProgress: (progress: Progress) => void;
  onStop: () => void;
  /** The clock in milliseconds, injected so tests can freeze it. */
  now: () => number;
  random?: () => number;
}) {
  const { cards } = content;
  const [queue, setQueue] = useState<Exercise[]>(() => nextExercises(cards, content.mcqsByCard, progress, { now: now(), random, teach }));
  const [series, setSeries] = useState<Series>(startSeries);
  const [turn, setTurn] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [reviewingTopic, setReviewingTopic] = useState<string | null>(null);
  const [justHandled, setJustHandled] = useState<string | null>(null);

  const replay = currentReplay(series);
  const current = replay ?? (series.phase === 'questions' ? queue[0] : undefined);
  const card = current ? content.cardsById.get(current.cardId) : undefined;

  function nextTurn() {
    setTurn((value) => value + 1);
    setReviewing(false);
  }

  function advanceQueue(updated: Progress) {
    const rest = queue.slice(1);
    setQueue(rest.length > 0 ? rest : nextExercises(cards, content.mcqsByCard, updated, { now: now(), random, teach }));
  }

  function finishLesson(exercise: Exercise) {
    const updated = recordLesson(progress, exercise.cardId, exerciseKey(exercise));
    onProgress(updated);
    setJustHandled(null);
    advanceQueue(updated);
    nextTurn();
  }

  function finishQuestion(exercise: Exercise, { correct }: ExerciseResult) {
    const at = now();
    const wasHandled = isHandled(progress.topics[exercise.cardId], at);
    const updated = recordAnswer(progress, exercise.cardId, exerciseKey(exercise), { correct, graded: isGraded(exercise), at });
    const becameHandled = !wasHandled && isHandled(updated.topics[exercise.cardId], at);
    onProgress(updated);
    setSeries((value) => recordFirstPass(value, exercise, correct, becameHandled));
    setJustHandled(becameHandled ? (content.cardsById.get(exercise.cardId)?.topic ?? null) : null);
    advanceQueue(updated);
    nextTurn();
  }

  function finishReplay({ correct }: ExerciseResult) {
    setSeries((value) => recordReplay(value, correct));
    setJustHandled(null);
    nextTurn();
  }

  function startNextSeries() {
    setSeries(startSeries());
    setQueue(nextExercises(cards, content.mcqsByCard, progress, { now: now(), random, teach }));
    setJustHandled(null);
    nextTurn();
  }

  const reviewedCard = reviewingTopic ? content.cardsById.get(reviewingTopic) : undefined;

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header className="flex items-center gap-3 py-2">
        <button type="button" onClick={onStop} aria-label="Stop playing" className="p-2 text-2xl leading-none text-muted">
          ×
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{title}</p>
          <div
            className="h-2 overflow-hidden rounded-full bg-surface"
            role="progressbar"
            aria-label="Series progress"
            aria-valuenow={series.asked}
            aria-valuemin={0}
            aria-valuemax={SERIES_LENGTH}
          >
            <div className="h-full rounded-full bg-brand transition-[width] duration-300" style={{ width: `${(series.asked / SERIES_LENGTH) * 100}%` }} />
          </div>
        </div>
        <SeriesCounter series={series} />
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

      {justHandled && series.phase !== 'done' && (
        <p role="status" className="mt-2 rounded-xl bg-brand-soft px-3 py-2 text-sm font-bold text-brand">
          ✓ You now handle {justHandled}
        </p>
      )}
      {replay && !reviewing && (
        <p className="mt-2 rounded-xl bg-surface px-3 py-2 text-sm font-bold text-muted">Missed earlier: one more try. This one does not change your progress.</p>
      )}

      <main className="flex flex-1 flex-col pb-4 pt-3">
        {series.phase === 'done' ? (
          reviewedCard ? (
            <LessonView card={reviewedCard} unitTitle={UNIT_TITLES.get(reviewedCard.unit) ?? ''} actionLabel="Back to the summary" onDone={() => setReviewingTopic(null)} />
          ) : (
            <SeriesSummary series={series} cardsById={content.cardsById} onReviewLesson={teach ? setReviewingTopic : undefined} onNext={startNextSeries} onExit={onStop} />
          )
        ) : (
          current &&
          card && (
            <>
              {reviewing && current.kind !== 'lesson' && (
                <LessonView card={card} unitTitle={UNIT_TITLES.get(card.unit) ?? ''} actionLabel="Back to the question" onDone={() => setReviewing(false)} />
              )}
              <div className={reviewing ? 'hidden' : 'flex flex-1 flex-col'}>
                <ExerciseView
                  key={turn}
                  exercise={current}
                  card={card}
                  mcqsById={content.mcqsById}
                  onLessonDone={() => finishLesson(current)}
                  onAnswer={(result) => (replay ? finishReplay(result) : finishQuestion(current, result))}
                  onReviewLesson={teach ? () => setReviewing(true) : undefined}
                />
              </div>
            </>
          )
        )}
      </main>
    </div>
  );
}

/** "7 / 15" during the questions, then how many replays are left. */
function SeriesCounter({ series }: { series: Series }) {
  if (series.phase === 'questions') {
    return (
      <span className="text-sm font-bold text-muted" aria-label={`Question ${series.asked + 1} of ${SERIES_LENGTH}`}>
        {series.asked + 1}/{SERIES_LENGTH}
      </span>
    );
  }
  if (series.phase === 'replays') {
    return (
      <span className="text-sm font-bold text-gold" aria-label={`${series.replays.length} missed ${series.replays.length === 1 ? 'question' : 'questions'} to retry`}>
        ↻ {series.replays.length}
      </span>
    );
  }
  return null;
}

function SeriesSummary({
  series,
  cardsById,
  onReviewLesson,
  onNext,
  onExit,
}: {
  series: Series;
  cardsById: Content['cardsById'];
  /** Absent in the main mode, which never shows lessons. */
  onReviewLesson?: (cardId: string) => void;
  onNext: () => void;
  onExit: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-5">
      <div>
        <p className="mb-1 text-sm font-bold uppercase tracking-wider text-brand">Series complete</p>
        <h2 className="text-2xl font-extrabold">
          {series.correct} of {SERIES_LENGTH} right first time
        </h2>
      </div>
      {series.handledTopics.length > 0 && (
        <section>
          <h3 className="mb-2 font-extrabold">You now handle</h3>
          <ul className="flex flex-col gap-2">
            {series.handledTopics.map((cardId) => (
              <li key={cardId} className="rounded-2xl bg-brand-soft px-4 py-3 font-semibold text-brand">
                ✓ {cardsById.get(cardId)?.topic}
              </li>
            ))}
          </ul>
        </section>
      )}
      {series.missedTopics.length > 0 && (
        <section>
          <h3 className="mb-2 font-extrabold">Missed this time</h3>
          <ul className="flex flex-col gap-2">
            {series.missedTopics.map((cardId) => (
              <li key={cardId} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
                <span className="flex-1 font-semibold">{cardsById.get(cardId)?.topic}</span>
                {onReviewLesson && (
                  <Button variant="ghost" className="shrink-0 text-sky-500" onClick={() => onReviewLesson(cardId)} aria-label={`Lesson on ${cardsById.get(cardId)?.topic}`}>
                    Lesson
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="mt-auto flex flex-col gap-3 pb-[env(safe-area-inset-bottom)]">
        <Button block onClick={onNext} autoFocus>
          Next series
        </Button>
        <Button variant="ghost" onClick={onExit}>
          Back home
        </Button>
      </div>
    </div>
  );
}

/** The trap itself, or its twin: the same fact stated the other way, so its answer is the opposite. */
function trapToAsk(trap: Trap, twin: boolean | undefined): Trap {
  if (!twin || !trap.twin) {
    return trap;
  }
  return { statement: trap.twin.statement, isTrue: !trap.isTrue, why: trap.twin.why };
}

function ExerciseView({
  exercise,
  card,
  mcqsById,
  onLessonDone,
  onAnswer,
  onReviewLesson,
}: {
  exercise: Exercise;
  card: Card;
  mcqsById: Content['mcqsById'];
  onLessonDone: () => void;
  onAnswer: (result: ExerciseResult) => void;
  /** Absent in the main mode, which never shows lessons. */
  onReviewLesson?: () => void;
}) {
  switch (exercise.kind) {
    case 'lesson':
      return <LessonView card={card} unitTitle={UNIT_TITLES.get(card.unit) ?? ''} actionLabel="Got it, ask me" onDone={onLessonDone} />;
    case 'open':
      return <OpenQuestion card={card} variantIndex={exercise.variant} onDone={onAnswer} onReviewLesson={onReviewLesson} />;
    case 'followUp':
      return <OpenQuestion card={card} followUpIndex={exercise.index} onDone={onAnswer} onReviewLesson={onReviewLesson} />;
    case 'trap':
      return <TrapExercise trap={trapToAsk(card.traps[exercise.index]!, exercise.twin)} onDone={onAnswer} onReviewLesson={onReviewLesson} />;
    case 'mcq': {
      const mcq = mcqsById.get(exercise.mcqId);
      return mcq ? <McqExercise mcq={mcq} onDone={onAnswer} onReviewLesson={onReviewLesson} /> : <p>Unknown question.</p>;
    }
    case 'codeChoice':
      return <CodeChoiceExercise choice={card.codeChoices![exercise.index]!} onDone={onAnswer} onReviewLesson={onReviewLesson} />;
  }
}
