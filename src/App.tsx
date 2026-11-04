import { useEffect, useState } from 'react';
import { CARDS, CARDS_BY_ID, UNITS } from './content/index.ts';
import { toDayKey } from './play/day.ts';
import type { Progress } from './play/progress.ts';
import { HomeScreen } from './screens/HomeScreen.tsx';
import { MockInterviewScreen } from './screens/MockInterviewScreen.tsx';
import { PlayScreen } from './screens/PlayScreen.tsx';
import { LessonView } from './ui/LessonView.tsx';

/** Where progress is kept. The browser uses IndexedDB; tests pass an in-memory store. */
export type ProgressStore = {
  load: () => Promise<Progress>;
  save: (progress: Progress) => Promise<void>;
};

type Screen =
  | { name: 'home' }
  | { name: 'play'; unitId?: string }
  | { name: 'mock'; unitId?: string }
  | { name: 'lesson'; cardId: string };

/**
 * @param now The clock, used only to name backup files; injected so tests can freeze it.
 * @param random The random source for the occasional check on a handled topic; injected for tests.
 */
export function App({ store, now, random }: { store: ProgressStore; now: () => Date; random?: () => number }) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

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

  const goHome = () => setScreen({ name: 'home' });

  if (screen.name === 'play') {
    const unit = UNITS.find((candidate) => candidate.id === screen.unitId);
    return (
      <PlayScreen
        cards={unit ? CARDS.filter((card) => card.unit === unit.id) : CARDS}
        title={unit ? unit.title : 'All topics'}
        progress={progress}
        onProgress={setProgress}
        onStop={goHome}
        random={random}
      />
    );
  }

  if (screen.name === 'mock') {
    return (
      <MockInterviewScreen
        cards={screen.unitId ? CARDS.filter((card) => card.unit === screen.unitId) : CARDS}
        progress={progress}
        onProgress={setProgress}
        onExit={goHome}
        random={random}
      />
    );
  }

  if (screen.name === 'lesson') {
    const card = CARDS_BY_ID.get(screen.cardId);
    if (card) {
      return (
        <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <LessonView card={card} unitTitle={UNITS.find((unit) => unit.id === card.unit)?.title ?? ''} actionLabel="Close" onDone={goHome} />
        </div>
      );
    }
  }

  return (
    <HomeScreen
      units={UNITS}
      cards={CARDS}
      progress={progress}
      today={toDayKey(now())}
      onPlay={(unitId) => setScreen({ name: 'play', unitId })}
      onMockInterview={(unitId) => setScreen({ name: 'mock', unitId })}
      onOpenLesson={(cardId) => setScreen({ name: 'lesson', cardId })}
      onImport={setProgress}
    />
  );
}
