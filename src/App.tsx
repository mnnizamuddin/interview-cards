import { useEffect, useState } from 'react';
import { TOPICS, UNITS, type Topic } from './content/catalog.ts';
import { loadContent, type Content } from './content/load.ts';
import { toDayKey } from './play/day.ts';
import { emptyProgress, type Progress } from './play/progress.ts';
import { weakTopicIds } from './play/review.ts';
import { HomeScreen } from './screens/HomeScreen.tsx';
import { MockInterviewScreen } from './screens/MockInterviewScreen.tsx';
import { PlayScreen } from './screens/PlayScreen.tsx';
import { Button } from './ui/Button.tsx';
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
  /** The weak topics are fixed when the review starts, so its content can load. */
  | { name: 'review'; topicIds: string[] }
  | { name: 'lesson'; cardId: string };

/** The topics a screen plays or shows: one unit, one lesson, or everything. */
function topicsFor(screen: Screen): readonly Topic[] {
  switch (screen.name) {
    case 'home':
      return [];
    case 'lesson':
      return TOPICS.filter((topic) => topic.id === screen.cardId);
    case 'play':
    case 'mock':
      return screen.unitId ? TOPICS.filter((topic) => topic.unit === screen.unitId) : TOPICS;
    case 'review':
      return TOPICS.filter((topic) => screen.topicIds.includes(topic.id));
  }
}

type Loaded = { screen: Screen; content: Content } | { screen: Screen; failed: true };

/**
 * Loads the content of the current screen. The home screen needs none: it only lists topics.
 * Returns `undefined` while loading, and `failed` when the files could not be downloaded.
 */
function useScreenContent(screen: Screen): Content | 'failed' | undefined {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    if (screen.name === 'home') {
      return;
    }
    let cancelled = false;
    loadContent(topicsFor(screen)).then(
      (content) => {
        if (!cancelled) {
          setLoaded({ screen, content });
        }
      },
      () => {
        if (!cancelled) {
          setLoaded({ screen, failed: true });
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [screen]);

  if (!loaded || loaded.screen !== screen) {
    return undefined;
  }
  return 'failed' in loaded ? 'failed' : loaded.content;
}

/**
 * @param now The clock: it decides when a handled topic needs a check and names backup files;
 *   injected so tests can freeze it.
 * @param random The random source for the occasional check on a handled topic; injected for tests.
 */
export function App({ store, now, random }: { store: ProgressStore; now: () => Date; random?: () => number }) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const content = useScreenContent(screen);

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

  if (screen.name === 'home') {
    return (
      <HomeScreen
        units={UNITS}
        topics={TOPICS}
        progress={progress}
        today={toDayKey(now())}
        now={now().getTime()}
        onPlay={(unitId) => setScreen({ name: 'play', unitId })}
        onMockInterview={(unitId) => setScreen({ name: 'mock', unitId })}
        onReview={() => setScreen({ name: 'review', topicIds: weakTopicIds(TOPICS.map((topic) => topic.id), progress, now().getTime()) })}
        onOpenLesson={(cardId) => setScreen({ name: 'lesson', cardId })}
        onImport={setProgress}
        onReset={() => setProgress(emptyProgress())}
      />
    );
  }

  if (content === undefined) {
    return <p className="p-8 text-center text-muted">Loading the questions…</p>;
  }

  if (content === 'failed') {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 p-8 text-center">
        <p>The questions could not be downloaded. Check your connection: once a unit has been played online, it works offline.</p>
        <Button onClick={goHome}>Back home</Button>
      </div>
    );
  }

  if (screen.name === 'play') {
    const unit = UNITS.find((candidate) => candidate.id === screen.unitId);
    return (
      <PlayScreen
        content={content}
        title={unit ? unit.title : 'All topics'}
        teach={unit !== undefined}
        progress={progress}
        onProgress={setProgress}
        onStop={goHome}
        now={() => now().getTime()}
        random={random}
      />
    );
  }

  if (screen.name === 'review') {
    return (
      <PlayScreen
        content={content}
        title="Weak spots"
        teach={false}
        review
        progress={progress}
        onProgress={setProgress}
        onStop={goHome}
        now={() => now().getTime()}
        random={random}
      />
    );
  }

  if (screen.name === 'mock') {
    return (
      <MockInterviewScreen
        content={content}
        progress={progress}
        onProgress={setProgress}
        onExit={goHome}
        now={() => now().getTime()}
        random={random}
      />
    );
  }

  const card = content.cardsById.get(screen.cardId);
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      {card && <LessonView card={card} unitTitle={UNITS.find((unit) => unit.id === card.unit)?.title ?? ''} close={{ label: 'Close the lesson', onClose: goHome }} />}
    </div>
  );
}
