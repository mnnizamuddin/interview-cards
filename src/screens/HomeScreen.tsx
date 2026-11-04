import { useRef } from 'react';
import type { Card, Unit } from '../content/types.ts';
import { countHandled, HANDLED_FOR_MS, toCurrentProgress, topicStatus, type Progress, type TopicStatus } from '../play/progress.ts';
import { Button } from '../ui/Button.tsx';
import { Text } from '../ui/Text.tsx';
import { ThemeToggle } from '../ui/ThemeToggle.tsx';

const STATUS_STYLES: Record<TopicStatus, { label: string; dot: string }> = {
  new: { label: 'New', dot: 'bg-line' },
  learning: { label: 'Learning', dot: 'bg-gold' },
  handled: { label: 'Handled', dot: 'bg-brand' },
  stale: { label: 'Needs a check', dot: 'bg-sky-500' },
};

const HANDLED_FOR_DAYS = HANDLED_FOR_MS / (24 * 60 * 60 * 1000);

function percent(part: number, total: number): number {
  return Math.round((part / Math.max(1, total)) * 100);
}

export function HomeScreen({
  units,
  cards,
  progress,
  today,
  now,
  onPlay,
  onMockInterview,
  onOpenLesson,
  onImport,
  onReset,
}: {
  units: Unit[];
  cards: Card[];
  progress: Progress;
  /** The current day as `YYYY-MM-DD`, used to name the backup file. */
  today: string;
  /** The current time in milliseconds: handled topics older than the validity need a check. */
  now: number;
  /** Starts playing on one unit, or on every topic when `unitId` is undefined. */
  onPlay: (unitId?: string) => void;
  /** Starts a mock interview on a topic from one unit, or from every unit when `unitId` is undefined. */
  onMockInterview: (unitId?: string) => void;
  onOpenLesson: (cardId: string) => void;
  onImport: (progress: Progress) => void;
  /** Deletes all progress on this device, once the learner has confirmed. */
  onReset: () => void;
}) {
  const handled = countHandled(cards.map((card) => card.id), progress, now);
  const share = percent(handled, cards.length);
  const answered = Object.values(progress.topics).reduce((sum, topic) => sum + topic.answered, 0);
  const correct = Object.values(progress.topics).reduce((sum, topic) => sum + topic.correct, 0);

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold text-brand">Interview Cards</h1>
        <ThemeToggle />
      </header>

      <section className="rounded-3xl border-2 border-line p-5">
        <p className="text-sm font-bold uppercase tracking-wider text-muted">Topics you handle</p>
        <p className="mb-2 text-4xl font-extrabold">
          {share}
          <span className="text-2xl">%</span>
        </p>
        <div className="mb-2 h-3 overflow-hidden rounded-full bg-surface">
          <div className="h-full rounded-full bg-brand" style={{ width: `${share}%` }} />
        </div>
        <p className="mb-4 text-sm text-muted">
          {handled} of {cards.length} topics · {answered} {answered === 1 ? 'answer' : 'answers'}
          {answered > 0 ? `, ${percent(correct, answered)}% right` : ''}
        </p>
        <Button block onClick={() => onPlay()}>
          {answered === 0 ? 'Start playing' : 'Keep playing'}
        </Button>
        <Button block variant="secondary" className="mt-3" onClick={() => onMockInterview()}>
          Mock interview
        </Button>
        <p className="mt-3 text-center text-xs text-muted">A topic counts once your last 3 answers on it are right, at least one of them a true/false or quick check, and for {HANDLED_FOR_DAYS} days after your last answer.</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold">Units</h2>
        {units.map((unit) => {
          const unitCards = cards.filter((card) => card.unit === unit.id);
          const unitHandled = countHandled(unitCards.map((card) => card.id), progress, now);
          const unitShare = percent(unitHandled, unitCards.length);
          return (
            <details key={unit.id} className="unit rounded-2xl border-2 border-line">
              <summary className="flex flex-col gap-2 p-4">
                <span className="flex items-baseline justify-between gap-3 pr-6">
                  <span className="font-extrabold">{unit.title}</span>
                  <span className="shrink-0 text-sm text-muted">{unitShare}%</span>
                </span>
                <span className="h-2 overflow-hidden rounded-full bg-surface" aria-hidden>
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${unitShare}%` }} />
                </span>
                <span className="text-sm text-muted">
                  <Text>{unit.description}</Text>
                </span>
              </summary>
              <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                <Button variant="secondary" aria-label={`Play ${unit.title}`} onClick={() => onPlay(unit.id)}>
                  Play this unit
                </Button>
                <Button variant="secondary" aria-label={`Mock interview on ${unit.title}`} onClick={() => onMockInterview(unit.id)}>
                  Mock interview
                </Button>
              </div>
              <ul className="flex flex-col gap-2 px-3 pb-3">
                {unitCards.map((card) => {
                  const status = STATUS_STYLES[topicStatus(progress.topics[card.id], now)];
                  return (
                    <li key={card.id}>
                      <button
                        type="button"
                        onClick={() => onOpenLesson(card.id)}
                        className="flex w-full items-center gap-3 rounded-2xl bg-surface px-4 py-3 text-left"
                      >
                        <span className={`size-2.5 shrink-0 rounded-full ${status.dot}`} aria-hidden />
                        <span className="flex-1 text-[0.95rem] font-semibold">{card.topic ?? card.question}</span>
                        <span className="shrink-0 text-xs font-bold uppercase text-muted">{status.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </section>

      <BackupSection progress={progress} today={today} now={now} onImport={onImport} onReset={onReset} />
    </div>
  );
}

/** Progress lives on this device only; the backup file is how it survives a reset or a new phone. */
function BackupSection({
  progress,
  today,
  now,
  onImport,
  onReset,
}: {
  progress: Progress;
  today: string;
  now: number;
  onImport: (progress: Progress) => void;
  onReset: () => void;
}) {
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
      const parsed = toCurrentProgress(JSON.parse(await file.text()), now);
      if (!parsed) {
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

  function resetProgress() {
    if (window.confirm('Delete all your progress on this device? Back it up first if you may want it again.')) {
      onReset();
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
        <Button variant="ghost-danger" onClick={resetProgress}>
          Reset
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
