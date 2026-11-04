/**
 * `part` out of `total` as a whole percentage, rounded, but never misleading at the ends: it shows
 * 0 only when `part` is 0 and 100 only when `part` is `total`. Plain rounding would show 0% for
 * 1 topic handled out of 365, and 100% with one topic left out of 365.
 */
export function percent(part: number, total: number): number {
  if (total <= 0 || part <= 0) {
    return 0;
  }
  if (part >= total) {
    return 100;
  }
  const rounded = Math.round((part / total) * 100);
  return Math.min(99, Math.max(1, rounded));
}
