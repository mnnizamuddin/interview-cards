import { useRef } from 'react';
import type { Card, Unit } from '../content/types.ts';
import { currentStreak, dayStats, isProgress, type Progress } from '../progress/model.ts';
import type { TodayPlan } from '../session/build-session.ts';
import type { DayKey } from '../srs/day.ts';
import { Button } from '../ui/Button.tsx';
import { Text } from '../ui/Text.tsx';

type CardStatus = 'new' | 'due' | 'learning' | 'known';

const STATUS_STYLES: Record<CardStatus, { label: string; dot: string }> = {
  new: { label: 'New', dot: 'bg-line' },
  due: { label: 'Due', dot: 'bg-gold' },
  learning: { label: 'Learning', dot: 'bg-sky-500' },
  known: { label: 'Known', dot: 'bg-brand' },
};

/** A card is "known" once its next review is three weeks or more away. */
const KNOWN_INTERVAL_DAYS = 21;

function cardStatus(card: Card, progress: Progress, today: DayKey): CardStatus {
  const state = progress.cards[card.id];
  if (!state) {
    return 'new';
  }
  if (state.dueDay <= today) {
    return 'due';
  }
  return state.intervalDays >= KNOWN_INTERVAL_DAYS ? 'known' : 'learning';
}

export function HomeScreen({
  units,
  cards,
  progress,
  today,
  plan,
  onStart,
  onImport,
}: {
  units: Unit[];
  cards: Card[];
  progress: Progress;
  today: DayKey;
  plan: TodayPlan;
  onStart: (practice: boolean) => void;
  onImport: (progress: Progress) => void;
}) {
  const streak = currentStreak(progress, today);
  const xpToday = dayStats(progress, today).xp;
  const goal = progress.settings.dailyGoalXp;
  const hasWork = plan.dueCount + plan.newCount > 0;
  const startedCards = cards.filter((card) => progress.cards[card.id]).length;

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-brand">Interview Cards</h1>
        <div className="flex items-center gap-4 font-bold">
          <span aria-label={`Streak: ${streak} days`} className={streak > 0 ? 'text-gold' : 'text-muted'}>
            🔥 {streak}
          </span>
          <span aria-label={`${xpToday} XP today`} className="text-sky-500">
            ⚡ {xpToday}
          </span>
        </div>
      </header>

      <section className="rounded-3xl border-2 border-line p-5">
        <div className="mb-1 flex items-baseline justify-between">
          <h2 className="font-bold">Daily goal</h2>
          <span className="text-sm text-muted">
            {Math.min(xpToday, goal)} / {goal} XP
          </span>
        </div>
        <div className="mb-5 h-3 overflow-hidden rounded-full bg-surface">
          <div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(100, (xpToday / goal) * 100)}%` }} />
        </div>
        {hasWork ? (
          <>
            <p className="mb-3 text-muted">
              {plan.dueCount} {plan.dueCount === 1 ? 'review' : 'reviews'} · {plan.newCount} new {plan.newCount === 1 ? 'card' : 'cards'}
            </p>
            <Button block onClick={() => onStart(false)}>
              Start today’s session
            </Button>
          </>
        ) : (
          <>
            <p className="mb-3 text-muted">All done for today. Come back tomorrow to keep your streak.</p>
            <Button block variant="secondary" disabled={startedCards === 0} onClick={() => onStart(true)}>
              Practice anyway
            </Button>
          </>
        )}
      </section>

      {units.map((unit) => {
        const unitCards = cards.filter((card) => card.unit === unit.id);
        const started = unitCards.filter((card) => progress.cards[card.id]).length;
        return (
          <section key={unit.id}>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-lg font-extrabold">{unit.title}</h2>
              <span className="text-sm text-muted">
                {started}/{unitCards.length}
              </span>
            </div>
            <p className="mb-3 text-sm text-muted">
              <Text>{unit.description}</Text>
            </p>
            <ul className="flex flex-col gap-2">
              {unitCards.map((card) => {
                const status = STATUS_STYLES[cardStatus(card, progress, today)];
                return (
                  <li key={card.id} className="flex items-start gap-3 rounded-2xl bg-surface px-4 py-3">
                    <span className={`mt-2 size-2.5 shrink-0 rounded-full ${status.dot}`} aria-hidden />
                    <span className="flex-1 text-[0.95rem]">
                      <Text>{card.question}</Text>
                    </span>
                    <span className="shrink-0 text-xs font-bold uppercase text-muted">{status.label}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <BackupSection progress={progress} today={today} onImport={onImport} />
    </div>
  );
}

/** Progress lives on this device only; the backup file is how it survives a reset or a new phone. */
function BackupSection({ progress, today, onImport }: { progress: Progress; today: DayKey; onImport: (progress: Progress) => void }) {
  const fileInput = useRef<HTMLInputElement>(null);

  function exportProgress() {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `interview-cards-progress-${today}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function importProgress(file: File) {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isProgress(parsed)) {
        window.alert('This file is not an Interview Cards backup.');
        return;
      }
      if (window.confirm('Replace your progress on this device with this backup?')) {
        onImport(parsed);
      }
    } catch {
      window.alert('This file could not be read as JSON.');
    }
  }

  return (
    <footer className="mt-4 flex flex-col items-center gap-1 border-t-2 border-line pt-4 text-sm">
      <p className="text-center text-muted">Your progress is stored on this device only.</p>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={exportProgress}>
          Back up
        </Button>
        <Button variant="ghost" onClick={() => fileInput.current?.click()}>
          Restore
        </Button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) {
            void importProgress(file);
          }
        }}
      />
    </footer>
  );
}
