import { useEffect, useState } from 'react';
import { CARDS, MCQS_BY_CARD, UNITS } from './content/index.ts';
import type { ExerciseResult } from './exercises/types.ts';
import { addXp, currentStreak, recordCardReview, recordSessionDone, type Progress } from './progress/model.ts';
import { DoneScreen } from './screens/DoneScreen.tsx';
import { HomeScreen } from './screens/HomeScreen.tsx';
import { SessionScreen, type SessionSummary } from './screens/SessionScreen.tsx';
import { buildSession, planToday, type Exercise } from './session/build-session.ts';
import type { Step } from './session/queue.ts';
import { toDayKey } from './srs/day.ts';

/** Where progress is kept. The browser uses IndexedDB; tests pass an in-memory store. */
export type ProgressStore = {
  load: () => Promise<Progress>;
  save: (progress: Progress) => Promise<void>;
};

type Screen = { name: 'home' } | { name: 'session'; exercises: Exercise[] } | { name: 'done'; summary: SessionSummary };

/**
 * @param now The clock, injected so tests can freeze the date.
 */
export function App({ store, now }: { store: ProgressStore; now: () => Date }) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const today = toDayKey(now());

  useEffect(() => {
    let cancelled = false;
    void store.load().then((loaded) => {
      if (!cancelled) {
        setProgress(loaded);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [store]);

  useEffect(() => {
    if (progress) {
      void store.save(progress);
    }
  }, [progress, store]);

  if (!progress) {
    return <p className="p-8 text-center text-muted">Loading…</p>;
  }

  function startSession(practice: boolean) {
    const exercises = buildSession(CARDS, MCQS_BY_CARD, progress!, today, { practice });
    if (exercises.length > 0) {
      setScreen({ name: 'session', exercises });
    }
  }

  /**
   * A session on one unit only: its due cards, then its new cards even past the daily limit, since
   * the learner chose the unit; once all are seen, the ones that come due soonest.
   */
  function startUnitSession(unitId: string) {
    const unitCards = CARDS.filter((card) => card.unit === unitId);
    const exercises = buildSession(unitCards, MCQS_BY_CARD, progress!, today, { practice: true, ignoreNewLimit: true });
    if (exercises.length > 0) {
      setScreen({ name: 'session', exercises });
    }
  }

  function recordResult(step: Step, result: ExerciseResult) {
    setProgress((previous) => {
      const reviewed = result.rating ? recordCardReview(previous!, step.cardId, result.rating, today) : previous!;
      return addXp(reviewed, result.xp, today);
    });
  }

  function finishSession(summary: SessionSummary) {
    setProgress((previous) => recordSessionDone(previous!, today));
    setScreen({ name: 'done', summary });
  }

  if (screen.name === 'session') {
    return (
      <SessionScreen
        exercises={screen.exercises}
        onResult={recordResult}
        onFinish={finishSession}
        onQuit={() => setScreen({ name: 'home' })}
      />
    );
  }

  if (screen.name === 'done') {
    return <DoneScreen summary={screen.summary} streak={currentStreak(progress, today)} onContinue={() => setScreen({ name: 'home' })} />;
  }

  return (
    <HomeScreen
      units={UNITS}
      cards={CARDS}
      progress={progress}
      today={today}
      plan={planToday(CARDS, progress, today)}
      onStart={startSession}
      onStartUnit={startUnitSession}
      onImport={setProgress}
    />
  );
}
