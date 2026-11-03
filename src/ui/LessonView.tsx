import type { Card } from '../content/types.ts';
import { Button } from './Button.tsx';
import { CodeBlock, Text } from './Text.tsx';

/** A topic's bite-sized lesson: a few short points and an optional code example. */
export function LessonView({
  card,
  unitTitle,
  actionLabel,
  onDone,
}: {
  card: Card;
  unitTitle: string;
  actionLabel: string;
  onDone: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-5">
      <div>
        <p className="mb-1 text-sm font-bold uppercase tracking-wider text-sky-500">Lesson · {unitTitle}</p>
        <h2 className="text-2xl font-extrabold">{card.topic ?? card.question}</h2>
      </div>
      {card.lesson ? (
        <ol className="flex flex-col gap-3">
          {card.lesson.points.map((point, index) => (
            <li key={point} className="flex gap-3 rounded-2xl bg-surface p-4">
              <span className="font-extrabold text-sky-500" aria-hidden>
                {index + 1}
              </span>
              <span>
                <Text>{point}</Text>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-2xl bg-surface p-4">
          <Text>{card.explanation}</Text>
        </p>
      )}
      {card.lesson?.code !== undefined && <CodeBlock code={card.lesson.code} />}
      <div className="sticky bottom-0 -mx-4 mt-auto bg-page px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <Button block onClick={onDone} autoFocus>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
