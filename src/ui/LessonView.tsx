import { useRef, useState, type ReactNode } from 'react';
import type { Card } from '../content/types.ts';
import { Button } from './Button.tsx';
import { CodeBlock } from './CodeBlock.tsx';
import { Kicker } from './Kicker.tsx';
import { Text } from './Text.tsx';

/**
 * A topic's bite-sized lesson as a carousel: one card per point, then the code example, swiped
 * sideways or moved with the arrows and dots. The action button stays visible, so the learner can
 * start the questions at any card.
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
  const slides = lessonSlides(card);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  /** Scrolls to a card. The state is set at once too, for browsers without smooth scrolling. */
  function goTo(index: number) {
    const target = Math.min(slides.length - 1, Math.max(0, index));
    const element = track.current;
    element?.scrollTo?.({ left: target * element.clientWidth, behavior: 'smooth' });
    setActive(target);
  }

  function followScroll() {
    const element = track.current;
    if (element && element.clientWidth > 0) {
      setActive(Math.round(element.scrollLeft / element.clientWidth));
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Kicker>Lesson · {unitTitle}</Kicker>
        <h2 className="text-2xl font-extrabold leading-tight">{card.topic}</h2>
        <p className="text-sm text-muted">
          {slides.length} short {slides.length === 1 ? 'card' : 'cards'}: swipe, or use the arrows.
        </p>
      </div>

      <div ref={track} onScroll={followScroll} className="carousel -mx-4 flex gap-4 overflow-x-auto px-4" aria-label="Lesson cards" role="region">
        {slides.map((slide, index) => (
          <section
            key={index}
            role="group"
            aria-roledescription="card"
            aria-label={`${index + 1} of ${slides.length}`}
            className="flex min-h-64 w-full shrink-0 flex-col gap-3 rounded-3xl border border-line bg-card p-5 shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              {slide.label} · {index + 1}/{slides.length}
            </p>
            {slide.body}
          </section>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-3">
          <ArrowButton label="Previous card" disabled={active === 0} onClick={() => goTo(active - 1)}>
            ‹
          </ArrowButton>
          <div className="flex items-center gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Card ${index + 1}`}
                aria-current={index === active}
                onClick={() => goTo(index)}
                className={`h-2 rounded-full transition-all ${index === active ? 'w-6 bg-brand' : 'w-2 bg-line'}`}
              />
            ))}
          </div>
          <ArrowButton label="Next card" disabled={active === slides.length - 1} onClick={() => goTo(active + 1)}>
            ›
          </ArrowButton>
        </div>
      )}

      <div className="sticky bottom-0 -mx-4 mt-auto bg-page px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <Button block onClick={onDone} autoFocus>
          {actionLabel} <span aria-hidden>→</span>
        </Button>
      </div>
    </div>
  );
}

type Slide = { label: string; body: ReactNode };

/**
 * One card per lesson point, then one for the code example; the explanation when there is no
 * lesson. The code wraps: a code block scrolling sideways inside a carousel would fight the swipe.
 */
function lessonSlides(card: Card): Slide[] {
  if (!card.lesson) {
    return [{ label: 'Key idea', body: <TextBody text={card.explanation} /> }];
  }
  const points: Slide[] = card.lesson.points.map((point) => ({ label: 'Key idea', body: <TextBody text={point} /> }));
  const { code, codeLang } = card.lesson;
  return code === undefined ? points : [...points, { label: 'In code', body: <CodeBlock code={code} lang={codeLang} wrap /> }];
}

function TextBody({ text }: { text: string }) {
  return (
    <p className="text-[1.05rem] leading-relaxed">
      <Text>{text}</Text>
    </p>
  );
}

function ArrowButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-full border border-line bg-card text-xl leading-none text-fg disabled:opacity-30"
    >
      {children}
    </button>
  );
}
