import type { Card, Mcq } from '../content/types.ts';
import { dayStats, type Progress } from '../progress/model.ts';
import type { DayKey } from '../srs/day.ts';

/** One screen of a session. */
export type Exercise =
  | { kind: 'say'; cardId: string }
  | { kind: 'trap'; cardId: string; trapIndex: number }
  | { kind: 'mcq'; cardId: string; mcqId: string };

export const CARDS_PER_SESSION = 5;

/** What today holds for the learner, shown on the home screen. */
export type TodayPlan = {
  dueCount: number;
  newCount: number;
};

export function planToday(cards: readonly Card[], progress: Progress, today: DayKey): TodayPlan {
  return {
    dueCount: dueCards(cards, progress, today).length,
    newCount: newCards(cards, progress, today).length,
  };
}

/**
 * Builds today's session: due reviews first, then new cards up to the daily limit, five cards at
 * most. Each card is a "say it" exercise followed by one quick check. With nothing due and no new
 * card left, `practice` reviews the cards that come due soonest instead.
 */
export function buildSession(
  cards: readonly Card[],
  mcqsByCard: ReadonlyMap<string, readonly Mcq[]>,
  progress: Progress,
  today: DayKey,
  practice = false,
): Exercise[] {
  let picked = [...dueCards(cards, progress, today), ...newCards(cards, progress, today)].slice(0, CARDS_PER_SESSION);
  if (picked.length === 0 && practice) {
    picked = soonestCards(cards, progress).slice(0, CARDS_PER_SESSION);
  }
  return picked.flatMap((card, position) => {
    const check = pickCheck(card, mcqsByCard.get(card.id) ?? [], progress, position);
    return check ? [{ kind: 'say', cardId: card.id }, check] : [{ kind: 'say', cardId: card.id }];
  });
}

function dueCards(cards: readonly Card[], progress: Progress, today: DayKey): Card[] {
  return cards
    .filter((card) => {
      const state = progress.cards[card.id];
      return state !== undefined && state.dueDay <= today;
    })
    .toSorted((a, b) => progress.cards[a.id]!.dueDay.localeCompare(progress.cards[b.id]!.dueDay));
}

function newCards(cards: readonly Card[], progress: Progress, today: DayKey): Card[] {
  const allowed = Math.max(0, progress.settings.newCardsPerDay - dayStats(progress, today).newCards);
  return cards.filter((card) => progress.cards[card.id] === undefined).slice(0, allowed);
}

function soonestCards(cards: readonly Card[], progress: Progress): Card[] {
  return cards
    .filter((card) => progress.cards[card.id] !== undefined)
    .toSorted((a, b) => progress.cards[a.id]!.dueDay.localeCompare(progress.cards[b.id]!.dueDay));
}

/**
 * Picks the quick check that follows a card. Traps and track questions alternate, and the choice
 * moves with the number of reviews and the card's place in the session, so a session mixes both
 * kinds and each visit shows a different check, without any randomness.
 */
function pickCheck(card: Card, mcqs: readonly Mcq[], progress: Progress, position: number): Exercise | undefined {
  const traps = card.traps.map((_, trapIndex): Exercise => ({ kind: 'trap', cardId: card.id, trapIndex }));
  const questions = mcqs.map((mcq): Exercise => ({ kind: 'mcq', cardId: card.id, mcqId: mcq.id }));
  const checks = interleave(traps, questions);
  if (checks.length === 0) {
    return undefined;
  }
  const state = progress.cards[card.id];
  const visits = state ? state.reps + state.lapses : 0;
  return checks[(visits + position) % checks.length];
}

/** Returns `[a0, b0, a1, b1, ...]`, then the rest of the longer list. */
function interleave<T>(first: readonly T[], second: readonly T[]): T[] {
  const length = Math.max(first.length, second.length);
  return Array.from({ length }, (_, index) => [first[index], second[index]])
    .flat()
    .filter((item): item is T => item !== undefined);
}
