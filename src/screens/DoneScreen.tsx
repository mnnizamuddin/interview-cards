import { Button } from '../ui/Button.tsx';
import type { SessionSummary } from './SessionScreen.tsx';

export function DoneScreen({ summary, streak, onContinue }: { summary: SessionSummary; streak: number; onContinue: () => void }) {
  const accuracy = summary.checksTotal === 0 ? 100 : Math.round((summary.checksCorrect / summary.checksTotal) * 100);
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-8 px-4 py-8 text-center">
      <div>
        <p className="mb-2 text-6xl" aria-hidden>
          🎉
        </p>
        <h1 className="text-2xl font-extrabold text-brand">Session complete!</h1>
      </div>
      <dl className="grid w-full grid-cols-3 gap-3">
        <Stat label="XP" value={`${summary.xp}`} tone="text-gold" />
        <Stat label="Checks" value={`${accuracy}%`} tone="text-brand" />
        <Stat label="Streak" value={`🔥 ${streak}`} tone="text-gold" />
      </dl>
      <p className="text-muted">
        {summary.cardsReviewed} {summary.cardsReviewed === 1 ? 'question' : 'questions'} rehearsed.
      </p>
      <Button block onClick={onContinue} autoFocus>
        Continue
      </Button>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border-2 border-line p-3">
      <dt className="text-xs font-bold uppercase text-muted">{label}</dt>
      <dd className={`text-xl font-extrabold ${tone}`}>{value}</dd>
    </div>
  );
}
