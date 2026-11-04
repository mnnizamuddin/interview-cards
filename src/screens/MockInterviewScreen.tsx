import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Content } from '../content/load.ts';
import type { Card } from '../content/types.ts';
import { OpenQuestion } from '../exercises/OpenQuestion.tsx';
import { exerciseKey, type Exercise } from '../play/engine.ts';
import { pickMockInterview, type MockInterview } from '../play/mock-interview.ts';
import { recordAnswer, type Progress } from '../play/progress.ts';
import { trackMissed } from '../play/review.ts';
import { Button } from '../ui/Button.tsx';
import { LessonView } from '../ui/LessonView.tsx';
import { ProgressBar } from '../ui/ProgressBar.tsx';
import { Text } from '../ui/Text.tsx';
import { unitTitle, useUnits } from '../ui/useUnits.ts';

/**
 * A mock interview on one topic: the main question, then its follow-ups in a row, answered out
 * loud and self-checked. The lesson stays hidden until the summary at the end.
 */
export function MockInterviewScreen({
  content,
  progress,
  onProgress,
  onExit,
  now,
  random = Math.random,
}: {
  /** The topics to draw from, already downloaded. */
  content: Content;
  progress: Progress;
  onProgress: (progress: Progress) => void;
  onExit: () => void;
  /** The clock in milliseconds, injected so tests can freeze it. */
  now: () => number;
  random?: () => number;
}) {
  const { t } = useTranslation();
  const units = useUnits();
  const { cards } = content;
  const [interview, setInterview] = useState<MockInterview | undefined>(() => pickMockInterview(cards, progress, now(), random));
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [reviewing, setReviewing] = useState(false);

  const card = interview ? content.cardsById.get(interview.cardId) : undefined;
  if (!interview || !card) {
    return null;
  }

  const total = interview.questions.length;
  const current = interview.questions[index];

  function answer(question: Exercise, correct: boolean) {
    // Interview questions are all open, so self-checked.
    const answered = recordAnswer(progress, question.cardId, exerciseKey(question), { correct, graded: false, at: now() });
    onProgress(trackMissed(answered, question, correct));
    setResults((previous) => [...previous, correct]);
    setIndex((previous) => previous + 1);
  }

  /** Starts another interview, on a different topic whenever there is one. */
  function startNext() {
    const others = cards.filter((candidate) => candidate.id !== interview?.cardId);
    setInterview(pickMockInterview(others.length > 0 ? others : cards, progress, now(), random));
    setIndex(0);
    setResults([]);
    setReviewing(false);
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      {/* A lesson opened from the summary has its own header with a ×. */}
      <header className={`flex items-center gap-3 py-2 ${reviewing ? 'hidden' : ''}`}>
        <button type="button" onClick={onExit} aria-label={t('mock.leave')} className="p-2 text-2xl leading-none text-muted">
          ×
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{t('mock.title', { topic: card.topic })}</p>
          <ProgressBar value={index} max={total} label={t('mock.progress')} />
        </div>
        {current && (
          <span className="text-sm font-bold text-muted">
            {index + 1}/{total}
          </span>
        )}
      </header>

      <main className="flex flex-1 flex-col pb-4 pt-3">
        {current ? (
          <OpenQuestion
            key={index}
            card={card}
            followUpIndex={current.kind === 'followUp' ? current.index : undefined}
            onDone={({ correct }) => answer(current, correct)}
          />
        ) : reviewing ? (
          <LessonView card={card} unitTitle={unitTitle(units, card.unit)} close={{ label: t('common.backToSummary'), onClose: () => setReviewing(false) }} />
        ) : (
          <InterviewSummary
            card={card}
            questions={interview.questions}
            results={results}
            onReviewLesson={() => setReviewing(true)}
            onNext={startNext}
            onExit={onExit}
          />
        )}
      </main>
    </div>
  );
}

function questionText(card: Card, question: Exercise): string {
  return question.kind === 'followUp' ? card.followUps[question.index]!.question : card.question;
}

function InterviewSummary({
  card,
  questions,
  results,
  onReviewLesson,
  onNext,
  onExit,
}: {
  card: Card;
  questions: Exercise[];
  results: boolean[];
  onReviewLesson: () => void;
  onNext: () => void;
  onExit: () => void;
}) {
  const { t } = useTranslation();
  const had = results.filter(Boolean).length;
  return (
    <div className="flex flex-1 flex-col gap-5">
      <div>
        <p className="mb-1 text-sm font-bold uppercase tracking-wider text-gold">{t('mock.over')}</p>
        <h2 className="text-2xl font-extrabold">
          {t('mock.score', { had, total: questions.length })}
        </h2>
        <p className="text-muted">{card.topic}</p>
      </div>
      <ol className="flex flex-col gap-2">
        {questions.map((question, index) => (
          <li key={index} className="flex gap-3 rounded-2xl border-2 border-b-4 border-line bg-card p-3">
            <span className={`font-extrabold ${results[index] ? 'text-success-ink' : 'text-danger-ink'}`} aria-label={results[index] ? t('mock.hadIt') : t('mock.missedIt')}>
              {results[index] ? '✓' : '✗'}
            </span>
            <span className="text-[0.95rem]">
              <Text>{questionText(card, question)}</Text>
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-auto flex flex-col gap-3 pb-[env(safe-area-inset-bottom)]">
        <Button block onClick={onNext} autoFocus>
          {t('mock.next')}
        </Button>
        <Button block variant="secondary" onClick={onReviewLesson}>
          {t('common.reviewLesson')}
        </Button>
        <Button variant="ghost" onClick={onExit}>
          {t('common.backHome')}
        </Button>
      </div>
    </div>
  );
}
