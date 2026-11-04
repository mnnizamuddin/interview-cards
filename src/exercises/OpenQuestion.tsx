import { useState, type ReactNode } from 'react';
import type { Card, Level } from '../content/types.ts';
import { Button } from '../ui/Button.tsx';
import { Text } from '../ui/Text.tsx';
import type { ExerciseResult } from './types.ts';

const LEVEL_STYLES: Record<Level, string> = {
  junior: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
  mid: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
  senior: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
};

/**
 * An open interview question: the learner answers out loud, reveals the model answer, ticks the
 * key points they said and says whether they had it. Used for a topic's main question (with its
 * key points and background), for its other phrasings (the same answer, introduced by a bridge),
 * and for each follow-up question (answer only).
 */
export function OpenQuestion({
  card,
  followUpIndex,
  variantIndex,
  onDone,
  onReviewLesson,
}: {
  card: Card;
  /** Set for a follow-up question; absent for the topic's main interview question. */
  followUpIndex?: number;
  /** Set for another phrasing of the main question. */
  variantIndex?: number;
  onDone: (result: ExerciseResult) => void;
  /** Absent in a mock interview, where the lesson waits until the end. */
  onReviewLesson?: () => void;
}) {
  const followUp = followUpIndex === undefined ? undefined : card.followUps[followUpIndex];
  const variant = variantIndex === undefined ? undefined : card.questionVariants?.[variantIndex];
  const question = followUp?.question ?? variant?.question ?? card.question;
  const answer = followUp?.answer ?? card.answer;
  const keyPoints = followUp ? [] : card.keyPoints;

  const [revealed, setRevealed] = useState(false);
  const [said, setSaid] = useState<boolean[]>(() => keyPoints.map(() => false));
  const saidCount = said.filter(Boolean).length;
  // Suggest "I had it" once at least half of the key points were said.
  const suggestHadIt = keyPoints.length === 0 || saidCount * 2 >= keyPoints.length;

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${LEVEL_STYLES[card.level]}`}>{card.level}</span>
        <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand">
          {followUp ? 'The interviewer digs deeper' : 'Say it out loud'}
        </span>
      </div>
      {followUp && <p className="-mb-3 text-sm text-muted">{card.topic}</p>}
      <h2 className="text-xl font-bold leading-snug">
        <Text>{question}</Text>
      </h2>

      {!revealed ? (
        <div className="mt-auto flex flex-col gap-3">
          <p className="text-center text-muted">Answer as you would in the interview, then reveal.</p>
          <Button block onClick={() => setRevealed(true)}>
            Show the answer
          </Button>
        </div>
      ) : (
        <>
          <section className="rounded-3xl border border-line bg-card p-5 shadow-sm">
            <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-muted">Model answer</h3>
            {variant && (
              <p className="mb-2 font-semibold">
                <Text>{variant.bridge}</Text>
              </p>
            )}
            <p>
              <Text>{answer}</Text>
            </p>
          </section>

          {keyPoints.length > 0 && (
            <section>
              <h3 className="mb-2 font-bold">Tick what you said</h3>
              <ul className="flex flex-col gap-2">
                {keyPoints.map((point, index) => (
                  <li key={point}>
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 ${said[index] ? 'border-brand bg-brand-soft' : 'border-line bg-card'}`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 size-5 accent-brand"
                        checked={said[index]}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          setSaid((previous) => previous.map((value, i) => (i === index ? checked : value)));
                        }}
                      />
                      <span>
                        <Text>{point}</Text>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!followUp && (
            <div className="flex flex-col divide-y divide-line rounded-3xl border border-line bg-card">
              <Details title="Why they ask">
                <Text>{card.explanation}</Text>
              </Details>
              <Details title="Real-world example">
                <Text>{card.example}</Text>
              </Details>
              <Details title="Common mistakes">
                <ul className="list-disc space-y-1 pl-5">
                  {card.mistakes.map((mistake) => (
                    <li key={mistake}>
                      <Text>{mistake}</Text>
                    </li>
                  ))}
                </ul>
              </Details>
            </div>
          )}

          {onReviewLesson && (
            <Button variant="ghost" onClick={onReviewLesson}>
              Review the lesson
            </Button>
          )}

          <section className="sticky bottom-0 -mx-4 mt-auto border-t border-line bg-page/95 px-4 backdrop-blur pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            <h3 className="mb-2 text-center text-sm font-bold text-muted">Did you have it?</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant={suggestHadIt ? 'secondary' : 'danger'} onClick={() => onDone({ correct: false })}>
                I missed it
              </Button>
              <Button variant={suggestHadIt ? 'primary' : 'secondary'} onClick={() => onDone({ correct: true })}>
                I had it
              </Button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Details({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="px-4 py-3">
      <summary className="font-bold">{title}</summary>
      <div className="pt-2 text-[0.95rem]">{children}</div>
    </details>
  );
}
