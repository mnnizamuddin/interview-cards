import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Topic } from '../content/catalog.ts';
import type { Unit } from '../content/types.ts';
import { countHandled, HANDLED_FOR_MS, toCurrentProgress, topicStatus, type Progress, type TopicStatus } from '../play/progress.ts';
import { weakTopicIds } from '../play/review.ts';
import { Button } from '../ui/Button.tsx';
import { ProgressBar } from '../ui/ProgressBar.tsx';
import { Text } from '../ui/Text.tsx';
import { LanguageSelector } from '../ui/LanguageSelector.tsx';
import { ThemeToggle } from '../ui/ThemeToggle.tsx';

/** The colour of each status dot; the labels are in the translation files, under `home.status`. */
const STATUS_DOTS: Record<TopicStatus, string> = {
  new: 'bg-line',
  learning: 'bg-gold',
  handled: 'bg-success',
  stale: 'bg-sky-500',
};

const HANDLED_FOR_DAYS = HANDLED_FOR_MS / (24 * 60 * 60 * 1000);

function percent(part: number, total: number): number {
  return Math.round((part / Math.max(1, total)) * 100);
}

export function HomeScreen({
  units,
  topics,
  progress,
  today,
  now,
  onPlay,
  onMockInterview,
  onReview,
  onOpenLesson,
  onImport,
  onReset,
}: {
  units: Unit[];
  topics: readonly Topic[];
  progress: Progress;
  /** The current day as `YYYY-MM-DD`, used to name the backup file. */
  today: string;
  /** The current time in milliseconds: handled topics older than the validity need a check. */
  now: number;
  /** Starts playing on one unit, or on every topic when `unitId` is undefined. */
  onPlay: (unitId?: string) => void;
  /** Starts a mock interview on a topic from one unit, or from every unit when `unitId` is undefined. */
  onMockInterview: (unitId?: string) => void;
  /** Starts a series on the questions missed last time, on the weakest topics. */
  onReview: () => void;
  onOpenLesson: (cardId: string) => void;
  onImport: (progress: Progress) => void;
  /** Deletes all progress on this device, once the learner has confirmed. */
  onReset: () => void;
}) {
  const { t } = useTranslation();
  const handled = countHandled(topics.map((topic) => topic.id), progress, now);
  const share = percent(handled, topics.length);
  const weakSpots = weakTopicIds(
    topics.map((topic) => topic.id),
    progress,
    now,
  ).length;
  const answered = Object.values(progress.topics).reduce((sum, topic) => sum + topic.answered, 0);
  const correct = Object.values(progress.topics).reduce((sum, topic) => sum + topic.correct, 0);

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold text-brand-ink">Interview Cards</h1>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </header>

      <section className="rounded-3xl border-2 border-b-4 border-line bg-card p-5">
        <p className="text-sm font-bold uppercase tracking-wider text-muted">{t('home.topicsYouHandle')}</p>
        <p className="mb-2 text-4xl font-extrabold">
          {share}
          <span className="text-2xl">%</span>
        </p>
        <div className="mb-2">
          <ProgressBar value={share} />
        </div>
        <p className="mb-4 text-sm text-muted">
          {t('home.handledOf', { handled, total: topics.length })} · {t('home.answers', { count: answered })}
          {answered > 0 ? t('home.rightShare', { percent: percent(correct, answered) }) : ''}
        </p>
        <Button block onClick={() => onPlay()}>
          {answered === 0 ? t('home.startPlaying') : t('home.keepPlaying')}
        </Button>
        <Button block variant="secondary" className="mt-3" onClick={() => onMockInterview()}>
          {t('home.mockInterview')}
        </Button>
        <Button block variant="secondary" className="mt-3" disabled={weakSpots === 0} onClick={onReview}>
          {weakSpots === 0 ? t('home.noWeakSpots') : t('home.reviewWeakSpots', { count: weakSpots })}
        </Button>
        <p className="mt-3 text-center text-xs text-muted">{t('home.handledRule', { days: HANDLED_FOR_DAYS })}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold">{t('home.units')}</h2>
        {units.map((unit) => {
          const unitTopics = topics.filter((topic) => topic.unit === unit.id);
          const unitHandled = countHandled(unitTopics.map((topic) => topic.id), progress, now);
          const unitShare = percent(unitHandled, unitTopics.length);
          return (
            <details key={unit.id} className="unit rounded-3xl border-2 border-b-4 border-line bg-card">
              <summary className="flex flex-col gap-2 p-4">
                <span className="flex items-baseline justify-between gap-3 pr-6">
                  <span className="font-extrabold">{unit.title}</span>
                  <span className="shrink-0 text-sm text-muted">{t('common.percent', { value: unitShare })}</span>
                </span>
                <ProgressBar value={unitShare} size="sm" />
                <span className="text-sm text-muted">
                  <Text>{unit.description}</Text>
                </span>
              </summary>
              <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                <Button variant="secondary" aria-label={t('home.playUnitLabel', { unit: unit.title })} onClick={() => onPlay(unit.id)}>
                  {t('home.playUnit')}
                </Button>
                <Button variant="secondary" aria-label={t('home.mockInterviewOn', { unit: unit.title })} onClick={() => onMockInterview(unit.id)}>
                  {t('home.mockInterview')}
                </Button>
              </div>
              <ul className="flex flex-col gap-2 px-3 pb-3">
                {unitTopics.map((topic) => {
                  const status = topicStatus(progress.topics[topic.id], now);
                  return (
                    <li key={topic.id}>
                      <button
                        type="button"
                        onClick={() => onOpenLesson(topic.id)}
                        className="flex w-full items-center gap-3 rounded-2xl bg-surface px-4 py-3 text-left"
                      >
                        <span className={`size-2.5 shrink-0 rounded-full ${STATUS_DOTS[status]}`} aria-hidden />
                        <span className="flex-1 text-[0.95rem] font-semibold">{topic.topic}</span>
                        <span className="shrink-0 text-xs font-bold uppercase text-muted">{t(`home.status.${status}`)}</span>
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
  const { t } = useTranslation();
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
        window.alert(t('backup.notABackup'));
        return;
      }
      if (window.confirm(t('backup.confirmReplace'))) {
        onImport(parsed);
      }
    } catch {
      window.alert(t('backup.notJson'));
    }
  }

  function resetProgress() {
    if (window.confirm(t('backup.confirmReset'))) {
      onReset();
    }
  }

  return (
    <footer className="mt-4 flex flex-col items-center gap-1 border-t-2 border-line pt-4 text-sm">
      <p className="text-center text-muted">{t('backup.deviceOnly')}</p>
      <p className="mt-2 text-center text-xs text-muted" aria-label={t('backup.versionLabel', { version: __APP_VERSION__, commit: __APP_COMMIT__ })}>
        {t('backup.version', { version: __APP_VERSION__, commit: __APP_COMMIT__ })}
      </p>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={exportProgress}>
          {t('backup.backUp')}
        </Button>
        <Button variant="ghost" onClick={() => fileInput.current?.click()}>
          {t('backup.restore')}
        </Button>
        <Button variant="ghost-danger" onClick={resetProgress}>
          {t('backup.reset')}
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
