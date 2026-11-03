/**
 * Returns the indexes `0..length-1` in a random order (Fisher–Yates), so answer options do not
 * keep a position the learner could memorize.
 *
 * @param random Returns a number in [0, 1); injected so tests get a fixed order.
 */
export function shuffledOrder(length: number, random: () => number = Math.random): number[] {
  const order = Array.from({ length }, (_, index) => index);
  for (let index = length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    [order[index], order[swapWith]] = [order[swapWith]!, order[index]!];
  }
  return order;
}
