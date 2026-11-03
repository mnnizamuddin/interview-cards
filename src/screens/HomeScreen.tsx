import { useRef } from 'react';
import type { Card, Unit } from '../content/types.ts';
import { countHandled, isHandled, isProgress, type Progress } from '../play/progress.ts';
import { Button } from '../ui/Button.tsx';
import { Text } from '../ui/Text.tsx';

type TopicStatus = 'new' | 'learning' | 'handled';

const STATUS_STYLES: Record<TopicStatus, { label: string; dot: string }> = {
  new: { label: 'New', dot: 'bg-line' },
  learning: { label: 'Learning', dot: 'bg-gold' },
  handled: { label: 'Handled', dot: 'bg-brand' },
};

function topicStatus(card: Card, progress: Progress): TopicStatus {
  const state = progress.topics[card.id];
  if (!state) {
    return 'new';
  }
  return isHandled(state) ? 'handled' : 'learning';
}

function percent(part: number, total: number): number {
  return Math.round((part / Math.max(1, total)) * 100);
}

export function HomeScreen({
  units,
  cards,
  progress,
  today,
  onPlay,
  onOpenLesson,
  onImport,
}: {
  units: Unit[];
  cards: Card[];
  progress: Progress;
  /** The current day as `YYYY-MM-DD`, used to name the backup file. */
  today: string;
  /** Starts playing on one unit, or on every topic when `unitId` is undefined. */
  onPlay: (unitId?: string) => void;
  onOpenLesson: (cardId: string) => void;
  onImport: (progress: Progress) => void;
}) {
  const handled = countHandled(cards.map((card) => card.id), progress);
  const share = percent(handled, cards.length);
  const answered = Object.values(progress.topics).reduce((sum, topic) => sum + topic.answered, 0);
  const correct = Object.values(progress.topics).reduce((sum, topic) => sum + topic.correct, 0);

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header>
        <h1 className="text-xl font-extrabold text-brand">Interview Cards</h1>
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
        <p className="mt-3 text-center text-xs text-muted">A topic counts once your last 3 answers on it are right.</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold">Units</h2>
        {units.map((unit) => {
          const unitCards = cards.filter((card) => card.unit === unit.id);
          const unitHandled = countHandled(unitCards.map((card) => card.id), progress);
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
              <div className="px-3 pb-3">
                <Button block variant="secondary" onClick={() => onPlay(unit.id)}>
                  Play this unit
                </Button>
              </div>
              <ul className="flex flex-col gap-2 px-3 pb-3">
                {unitCards.map((card) => {
                  const status = STATUS_STYLES[topicStatus(card, progress)];
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

      <BackupSection progress={progress} today={today} onImport={onImport} />
    </div>
  );
}

/** Progress lives on this device only; the backup file is how it survives a reset or a new phone. */
function BackupSection({ progress, today, onImport }: { progress: Progress; today: string; onImport: (progress: Progress) => void }) {
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
