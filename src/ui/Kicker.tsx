import type { ReactNode } from 'react';

/** The small pill above a question or lesson that names what kind of screen it is. */
export function Kicker({ children, tone = 'brand' }: { children: ReactNode; tone?: 'brand' | 'gold' }) {
  const colours = tone === 'brand' ? 'bg-brand-soft text-brand-ink' : 'bg-gold/15 text-gold';
  return <p className={`inline-flex w-fit items-center rounded-xl px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${colours}`}>{children}</p>;
}
