import { useState, type ReactNode } from 'react';
import type { Card, Level } from '../content/types.ts';
import { XP_FOR_FOLLOW_UP, XP_FOR_RATING } from '../progress/model.ts';
import { downgrade, RATINGS, suggestRating, type Rating } from '../srs/schedule.ts';
import { Button } from '../ui/Button.tsx';
import { Text } from '../ui/Text.tsx';
import type { ExerciseResult } from './types.ts';

const RATING_LABELS: Record<Rating, { title: string; hint: string }> = {
  again: { title: 'Again', hint: 'Couldn’t say it' },
  hard: { title: 'Hard', hint: 'Partly' },
  good: { title: 'Good', hint: 'Got it' },
  easy: { title: 'Easy', hint: 'Nailed it' },
};

const LEVEL_STYLES: Record<Level, string> = {
  junior: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
  mid: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
  senior: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
};

type Phase = 'think' | 'review' | 'probe';

/**
 * "Say it": the learner answers out loud, reveals the model answer, ticks the key points they
 * said and rates themselves. A good rating brings the interviewer's follow-up questions; a
 * missed follow-up lowers the rating by one step.
 */
export function SayItExercise({ card, onDone }: { card: Card; onDone: (result: ExerciseResult) => void }) {
  const [phase, setPhase] = useState<Phase>('think');
  const [said, setSaid] = useState<boolean[]>(() => card.keyPoints.map(() => false));
  const [rating, setRating] = useState<Rating>('good');
  const [probeIndex, setProbeIndex] = useState(0);
  const [probeRevealed, setProbeRevealed] = useState(false);
  const [missedProbes, setMissedProbes] = useState(0);

  const suggested = suggestRating(said.filter(Boolean).length, card.keyPoints.length);

  function finish(chosen: Rating, missed: number, probesAnswered: number) {
    const finalRating = missed > 0 ? downgrade(chosen) : chosen;
    const probeXp = (probesAnswered - missed) * XP_FOR_FOLLOW_UP;
    onDone({ passed: finalRating !== 'again', xp: XP_FOR_RATING[finalRating] + probeXp, rating: finalRating });
  }

  function rate(chosen: Rating) {
    const deserveProbes = chosen === 'good' || chosen === 'easy';
    if (deserveProbes && card.followUps.length > 0) {
      setRating(chosen);
      setPhase('probe');
      return;
    }
    finish(chosen, 0, 0);
  }

  function answerProbe(gotIt: boolean) {
    const missed = missedProbes + (gotIt ? 0 : 1);
    const next = probeIndex + 1;
    if (next >= card.followUps.length) {
      finish(rating, missed, next);
      return;
    }
    setMissedProbes(missed);
    setProbeIndex(next);
    setProbeRevealed(false);
  }

  if (phase === 'probe') {
    const followUp = card.followUps[probeIndex]!;
    return (
      <div className="flex flex-1 flex-col gap-5">
        <p className="text-sm font-bold uppercase tracking-wider text-gold">
          The interviewer digs deeper · {probeIndex + 1}/{card.followUps.length}
        </p>
        <h2 className="text-xl font-bold">
          <Text>{followUp.question}</Text>
        </h2>
        {probeRevealed ? (
          <>
            <p className="rounded-2xl bg-surface p-4">
              <Text>{followUp.answer}</Text>
            </p>
            <div className="mt-auto grid grid-cols-2 gap-3">
              <Button variant="danger" onClick={() => answerProbe(false)}>
                I missed it
              </Button>
              <Button onClick={() => answerProbe(true)}>I had it</Button>
            </div>
          </>
        ) : (
          <div className="mt-auto flex flex-col gap-3">
            <p className="text-center text-muted">Answer out loud, then check.</p>
            <Button block onClick={() => setProbeRevealed(true)}>
              Show the answer
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${LEVEL_STYLES[card.level]}`}>{card.level}</span>
        <span className="text-sm font-bold uppercase tracking-wider text-gold">Say it out loud</span>
      </div>
      <h2 className="text-xl font-bold leading-snug">
        <Text>{card.question}</Text>
      </h2>

      {phase === 'think' ? (
        <div className="mt-auto flex flex-col gap-3">
          <p className="text-center text-muted">Answer as you would in the interview, then reveal.</p>
          <Button block onClick={() => setPhase('review')}>
            Show the answer
          </Button>
        </div>
      ) : (
        <>
          <section className="rounded-2xl bg-surface p-4">
            <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-muted">Model answer</h3>
            <p>
              <Text>{card.answer}</Text>
            </p>
          </section>

          <section>
            <h3 className="mb-2 font-bold">Tick what you said</h3>
            <ul className="flex flex-col gap-2">
              {card.keyPoints.map((point, index) => (
                <li key={point}>
                  <label className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 ${said[index] ? 'border-brand bg-brand-soft' : 'border-line'}`}>
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

          <div className="flex flex-col divide-y divide-line rounded-2xl border-2 border-line">
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
            {card.lessons.length > 0 && (
              <Details title="Learn more in the track">
                <ul className="space-y-1">
                  {card.lessons.map((lesson) => (
                    <li key={`${lesson.module}-${lesson.section}`}>
                      <b>{lesson.module}</b> · <Text>{lesson.title}</Text>
                    </li>
                  ))}
                </ul>
              </Details>
            )}
          </div>

          <section className="sticky bottom-0 -mx-4 mt-auto border-t-2 border-line bg-page px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            <h3 className="mb-2 text-center text-sm font-bold text-muted">How did you do?</h3>
            <div className="grid grid-cols-4 gap-2">
              {RATINGS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => rate(option)}
                  aria-label={`${RATING_LABELS[option].title}: ${RATING_LABELS[option].hint}`}
                  className={`press flex flex-col items-center rounded-2xl border-2 px-1 py-2 ${
                    option === suggested ? 'border-brand bg-brand-soft' : 'border-line bg-page'
                  }`}
                >
                  <span className="font-bold">{RATING_LABELS[option].title}</span>
                  <span className="text-xs text-muted">{RATING_LABELS[option].hint}</span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Details({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group px-4 py-3">
      <summary className="font-bold">{title}</summary>
      <div className="pt-2 text-[0.95rem]">{children}</div>
    </details>
  );
}
