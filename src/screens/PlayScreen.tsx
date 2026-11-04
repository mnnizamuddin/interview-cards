import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Content } from '../content/load.ts';
import type { Card, Trap } from '../content/types.ts';
import { CodeChoiceExercise } from '../exercises/CodeChoiceExercise.tsx';
import { McqExercise } from '../exercises/McqExercise.tsx';
import { OpenQuestion } from '../exercises/OpenQuestion.tsx';
import { TrapExercise } from '../exercises/TrapExercise.tsx';
import type { ExerciseResult } from '../exercises/types.ts';
import { exerciseKey, isGraded, nextExercises, type Exercise } from '../play/engine.ts';
import { isHandled, recordAnswer, recordLesson, type Progress } from '../play/progress.ts';
import { pickReview, trackMissed } from '../play/review.ts';
import { currentReplay, recordFirstPass, recordReplay, SERIES_LENGTH, startSeries, type Series } from '../play/series.ts';
import { Button } from '../ui/Button.tsx';
import { LessonView } from '../ui/LessonView.tsx';
import { ProgressBar } from '../ui/ProgressBar.tsx';
import { unitTitle, useUnits } from '../ui/useUnits.ts';

/**
 * A series of {@link SERIES_LENGTH} questions on `cards`, then the missed ones again until each
 * is right once, then a summary. First-pass answers are saved at once; replays are practice and
 * change nothing.
 *
 * With `teach` (unit practice), new topics open with their lesson, a header button shows the
 * current topic's lesson, and a miss offers it. Without it (the main mode), no lesson is ever
 * shown: it is pure recall.
 *
 * With `review` (weak-spots review), the series is the questions missed last time on the weakest
 * topics, possibly fewer than {@link SERIES_LENGTH}; there is no lesson either.
 */
export function PlayScreen({
  content,
  title,
  teach,
  review = false,
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
  /** A weak-spots review instead of the engine's stream. */
  review?: boolean;
  progress: Progress;
  onProgress: (progress: Progress) => void;
  onStop: () => void;
  /** The clock in milliseconds, injected so tests can freeze it. */
  now: () => number;
  random?: () => number;
}) {
  const { t } = useTranslation();
  const units = useUnits();
  const { cards } = content;
  /** The first questions of a series: the weak spots in a review, else the engine's next pick. */
  function planFor(current: Progress): Exercise[] {
    return review ? pickReview(cards, content.mcqsByCard, current, now()) : nextExercises(cards, content.mcqsByCard, current, { now: now(), random, teach, newTopics: teach ? 'in-order' : 'random' });
  }

  const [queue, setQueue] = useState<Exercise[]>(() => planFor(progress));
  const [series, setSeries] = useState<Series>(() => startSeries(review ? queue.length : SERIES_LENGTH));
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
    // A review is planned up front; the engine's stream is refilled as it runs out.
    setQueue(rest.length > 0 || review ? rest : nextExercises(cards, content.mcqsByCard, updated, { now: now(), random, teach, newTopics: teach ? 'in-order' : 'random' }));
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
    const answered = recordAnswer(progress, exercise.cardId, exerciseKey(exercise), { correct, graded: isGraded(exercise), at });
    const updated = trackMissed(answered, exercise, correct);
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
    const plan = planFor(progress);
    setSeries(startSeries(review ? plan.length : SERIES_LENGTH));
    setQueue(plan);
    setJustHandled(null);
    nextTurn();
  }

  const reviewedCard = reviewingTopic ? content.cardsById.get(reviewingTopic) : undefined;

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      {/* A lesson opened to look something up has its own header with a ×. */}
      <header className={`flex items-center gap-3 py-2 ${reviewing || reviewedCard ? 'hidden' : ''}`}>
        <button type="button" onClick={onStop} aria-label={t('play.stop')} className="p-2 text-2xl leading-none text-muted">
          ×
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{title}</p>
          <ProgressBar value={series.asked} max={series.length} label={t('play.seriesProgress')} />
        </div>
        <SeriesCounter series={series} />
        {teach && current && current.kind !== 'lesson' && !reviewing && (
          <button
            type="button"
            onClick={() => setReviewing(true)}
            className="rounded-full border-2 border-line px-3 py-1 text-sm font-bold text-brand-ink"
          >
            {t('common.lesson')}
          </button>
        )}
      </header>

      {justHandled && series.phase !== 'done' && (
        <p role="status" className="mt-2 rounded-2xl bg-success-soft px-3 py-2 text-sm font-bold text-success-ink">
          {t('play.nowHandle', { topic: justHandled })}
        </p>
      )}
      {replay && !reviewing && (
        <p className="mt-2 rounded-xl bg-surface px-3 py-2 text-sm font-bold text-muted">{t('play.replayNotice')}</p>
      )}

      <main className="flex flex-1 flex-col pb-4 pt-3">
        {series.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="text-lg font-bold">{t('play.noWeakSpotsTitle')}</p>
            <p className="text-muted">{t('play.noWeakSpotsText')}</p>
            <Button onClick={onStop}>{t('common.backHome')}</Button>
          </div>
        ) : series.phase === 'done' ? (
          reviewedCard ? (
            <LessonView card={reviewedCard} unitTitle={unitTitle(units, reviewedCard.unit)} close={{ label: t('common.backToSummary'), onClose: () => setReviewingTopic(null) }} />
          ) : (
            <SeriesSummary series={series} cardsById={content.cardsById} onReviewLesson={teach ? setReviewingTopic : undefined} onNext={startNextSeries} onExit={onStop} />
          )
        ) : (
          current &&
          card && (
            <>
              {reviewing && current.kind !== 'lesson' && (
                <LessonView card={card} unitTitle={unitTitle(units, card.unit)} close={{ label: t('common.backToQuestion'), onClose: () => setReviewing(false) }} />
              )}
              <div className={reviewing ? 'hidden' : 'flex flex-1 flex-col'}>
                <ExerciseView
                  key={turn}
                  exercise={current}
                  card={card}
                  unitTitle={unitTitle(units, card.unit)}
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
  const { t } = useTranslation();
  if (series.phase === 'questions') {
    return (
      <span className="text-sm font-bold text-muted" aria-label={t('play.questionOf', { current: series.asked + 1, total: series.length })}>
        {series.asked + 1}/{series.length}
      </span>
    );
  }
  if (series.phase === 'replays') {
    return (
      <span className="text-sm font-bold text-gold" aria-label={t('play.toRetry', { count: series.replays.length })}>
        ↻ {series.replays.length}
      </span>
    );
  }
  return null;
}

/** The end-of-series emoji and the translation key of its message, by first-time accuracy. */
function cheerFor(accuracy: number): { emoji: string; message: 'play.cheerTop' | 'play.cheerGood' | 'play.cheerPractice' } {
  if (accuracy >= 90) {
    return { emoji: '🏆', message: 'play.cheerTop' };
  }
  if (accuracy >= 60) {
    return { emoji: '🎉', message: 'play.cheerGood' };
  }
  return { emoji: '💪', message: 'play.cheerPractice' };
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-b-4 border-line bg-card px-3 py-3">
      <span className="text-2xl font-black text-brand-ink">{value}</span>
      <span className="text-xs font-bold uppercase tracking-wide text-muted">{label}</span>
    </div>
  );
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
  const { t } = useTranslation();
  const accuracy = Math.round((series.correct / Math.max(1, series.length)) * 100);
  const cheer = cheerFor(accuracy);
  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex flex-col items-center gap-1 pt-4 text-center">
        <span aria-hidden className="pop text-7xl">
          {cheer.emoji}
        </span>
        <p className="mt-2 text-sm font-extrabold uppercase tracking-wider text-brand-ink">{t('play.seriesComplete')}</p>
        <h2 className="text-3xl font-black leading-tight">
          {t('play.rightFirstTime', { correct: series.correct, total: series.length })}
        </h2>
        <p className="font-semibold text-muted">{t(cheer.message)}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatTile value={t('common.percent', { value: accuracy })} label={t('play.accuracy')} />
        <StatTile value={String(series.handledTopics.length)} label={t('play.topicsHandled', { count: series.handledTopics.length })} />
      </div>
      {series.handledTopics.length > 0 && (
        <section>
          <h3 className="mb-2 font-extrabold">{t('play.youNowHandle')}</h3>
          <ul className="flex flex-col gap-2">
            {series.handledTopics.map((cardId) => (
              <li key={cardId} className="rounded-2xl bg-success-soft px-4 py-3 font-semibold text-success-ink">
                ✓ {cardsById.get(cardId)?.topic}
              </li>
            ))}
          </ul>
        </section>
      )}
      {series.missedTopics.length > 0 && (
        <section>
          <h3 className="mb-2 font-extrabold">{t('play.missedThisTime')}</h3>
          <ul className="flex flex-col gap-2">
            {series.missedTopics.map((cardId) => (
              <li key={cardId} className="flex items-center gap-3 rounded-2xl border-2 border-b-4 border-line bg-card px-4 py-3">
                <span className="flex-1 font-semibold">{cardsById.get(cardId)?.topic}</span>
                {onReviewLesson && (
                  <Button variant="ghost" className="shrink-0 text-sky-500" onClick={() => onReviewLesson(cardId)} aria-label={t('play.lessonOn', { topic: cardsById.get(cardId)?.topic })}>
                    {t('common.lesson')}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="mt-auto flex flex-col gap-3 pb-[env(safe-area-inset-bottom)]">
        <Button block onClick={onNext} autoFocus>
          {t('play.nextSeries')}
        </Button>
        <Button variant="ghost" onClick={onExit}>
          {t('common.backHome')}
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
  unitTitle,
  mcqsById,
  onLessonDone,
  onAnswer,
  onReviewLesson,
}: {
  exercise: Exercise;
  card: Card;
  /** The title of the card's unit, in the language on screen. */
  unitTitle: string;
  mcqsById: Content['mcqsById'];
  onLessonDone: () => void;
  onAnswer: (result: ExerciseResult) => void;
  /** Absent in the main mode, which never shows lessons. */
  onReviewLesson?: () => void;
}) {
  const { t } = useTranslation();
  switch (exercise.kind) {
    case 'lesson':
      return <LessonView card={card} unitTitle={unitTitle} start={{ label: t('play.gotIt'), onStart: onLessonDone }} />;
    case 'open':
      return <OpenQuestion card={card} variantIndex={exercise.variant} onDone={onAnswer} onReviewLesson={onReviewLesson} />;
    case 'followUp':
      return <OpenQuestion card={card} followUpIndex={exercise.index} onDone={onAnswer} onReviewLesson={onReviewLesson} />;
    case 'trap':
      return <TrapExercise trap={trapToAsk(card.traps[exercise.index]!, exercise.twin)} onDone={onAnswer} onReviewLesson={onReviewLesson} />;
    case 'mcq': {
      const mcq = mcqsById.get(exercise.mcqId);
      return mcq ? <McqExercise mcq={mcq} onDone={onAnswer} onReviewLesson={onReviewLesson} /> : <p>{t('play.unknownQuestion')}</p>;
    }
    case 'codeChoice':
      return <CodeChoiceExercise choice={card.codeChoices![exercise.index]!} onDone={onAnswer} onReviewLesson={onReviewLesson} />;
  }
}
