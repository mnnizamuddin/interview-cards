import type { ReactNode } from 'react';

/** The small pill above a question or lesson that names what kind of screen it is. */
export function Kicker({ children, tone = 'brand' }: { children: ReactNode; tone?: 'brand' | 'gold' }) {
  const colours = tone === 'brand' ? 'bg-brand-soft text-brand' : 'bg-gold/15 text-gold';
  return <p className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${colours}`}>{children}</p>;
}
