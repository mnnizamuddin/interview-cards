import { useEffect, useState, type ReactNode } from 'react';
import type { Card, Trap } from '../content/types.ts';
import { Button } from './Button.tsx';
import { CodeBlock } from './CodeBlock.tsx';
import { Kicker } from './Kicker.tsx';
import { Text } from './Text.tsx';

/**
 * A topic's lesson as one scrollable page: the concept, a reference table of key takeaways, a code
 * example and a quick true/false check, with the button to start the questions fixed at the bottom.
 */
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
  const reading = useReadingProgress();
  const lesson = card.lesson;
  const intro = lesson?.intro ?? lesson?.points[0] ?? card.explanation;
  const check = card.traps[0];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="sticky top-0 z-10 -mx-4 flex flex-col gap-2 bg-page/95 px-4 pb-3 pt-1 backdrop-blur">
        <Kicker>Lesson · {unitTitle}</Kicker>
        <h2 className="text-2xl font-extrabold leading-tight">{card.topic}</h2>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-surface"
          role="progressbar"
          aria-label="Reading progress"
          aria-valuenow={Math.round(reading * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full rounded-full bg-brand transition-[width] duration-150" style={{ width: `${reading * 100}%` }} />
        </div>
      </header>

      <LessonSection title="The concept">
        <p className="text-[1.05rem] leading-relaxed">
          <Text>{intro}</Text>
        </p>
      </LessonSection>

      {lesson && <Takeaways card={card} />}

      {lesson?.code !== undefined && (
        <LessonSection title="In code">
          <CodeBlock code={lesson.code} lang={lesson.codeLang} />
        </LessonSection>
      )}

      {check && (
        <LessonSection title="Quick check">
          <InlineCheck trap={check} />
        </LessonSection>
      )}

      <div className="sticky bottom-0 -mx-4 mt-auto border-t border-line bg-page/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <Button block onClick={onDone} autoFocus>
          {actionLabel} <span aria-hidden>→</span>
        </Button>
      </div>
    </div>
  );
}

/** How far the page has been scrolled, from 0 to 1; 1 when it does not scroll at all. */
function useReadingProgress(): number {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    function update() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable <= 0 ? 1 : Math.min(1, window.scrollY / scrollable));
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return progress;
}

function LessonSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <h3 className="text-xs font-bold uppercase tracking-wide text-muted">{title}</h3>
      {children}
    </section>
  );
}

/**
 * The key takeaways as a two-column reference table. A card written before tables existed shows
 * its remaining lesson points as rows instead.
 */
function Takeaways({ card }: { card: Card }) {
  const lesson = card.lesson!;
  if (lesson.takeaways) {
    return (
      <LessonSection title="Key takeaways">
        <div className="overflow-hidden rounded-3xl border-2 border-b-4 border-line bg-card">
          {/* On a phone each row stacks, term above detail, so a long code term never squeezes the
              detail into a thin column; from tablet width it is a two-column table. The explicit
              roles keep it a table for screen readers when the cells are displayed as blocks. */}
          <table role="table" className="block w-full border-collapse text-left text-[0.95rem] sm:table">
            <tbody role="rowgroup" className="block sm:table-row-group">
              {lesson.takeaways.map((row) => (
                <tr key={row.term} role="row" className="block border-b border-line align-top last:border-b-0 sm:table-row">
                  <th role="rowheader" scope="row" className="block px-4 pb-1 pt-3 font-semibold text-brand-ink sm:table-cell sm:w-[34%] sm:py-3">
                    <Text>{row.term}</Text>
                  </th>
                  <td role="cell" className="block px-4 pb-3 leading-snug sm:table-cell sm:py-3 sm:pl-0">
                    <Text>{row.detail}</Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LessonSection>
    );
  }
  const rest = lesson.intro ? lesson.points : lesson.points.slice(1);
  if (rest.length === 0) {
    return null;
  }
  return (
    <LessonSection title="Key takeaways">
      <ol className="flex flex-col divide-y divide-line overflow-hidden rounded-3xl border-2 border-b-4 border-line bg-card">
        {rest.map((point, index) => (
          <li key={point} className="flex gap-3 px-4 py-3">
            <span aria-hidden className="font-bold text-brand-ink">
              {index + 1}
            </span>
            <span className="leading-snug">
              <Text>{point}</Text>
            </span>
          </li>
        ))}
      </ol>
    </LessonSection>
  );
}

/** A true/false statement answered inside the lesson. Practice only: it changes no progress. */
function InlineCheck({ trap }: { trap: Trap }) {
  const [choice, setChoice] = useState<boolean | null>(null);
  const correct = choice === trap.isTrue;
  return (
    <div className="flex flex-col gap-3 rounded-3xl border-2 border-b-4 border-line bg-card p-4">
      <p className="font-semibold">
        True or false? <Text>{trap.statement}</Text>
      </p>
      {choice === null ? (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => setChoice(true)}>
            True
          </Button>
          <Button variant="secondary" onClick={() => setChoice(false)}>
            False
          </Button>
        </div>
      ) : (
        <div role="status" className={`rounded-2xl p-3 ${correct ? 'bg-success-soft' : 'bg-danger-soft'}`}>
          <p className={`font-bold ${correct ? 'text-success-ink' : 'text-danger-ink'}`}>{correct ? 'Correct!' : `It's ${trap.isTrue ? 'true' : 'false'}`}</p>
          <p className="text-[0.95rem]">
            <Text>{trap.why}</Text>
          </p>
        </div>
      )}
      <p className="text-xs text-muted">Practice only: this check does not change your progress.</p>
    </div>
  );
}
