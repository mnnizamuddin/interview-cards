import { describe, expect, it } from 'vitest';
import { shuffledOrder } from './shuffle.ts';

/** A fixed sequence of "random" numbers, repeated. */
function sequence(values: number[]): () => number {
  let call = 0;
  return () => values[call++ % values.length]!;
}

describe('shuffledOrder', () => {
  it('keeps every index exactly once', () => {
    const order = shuffledOrder(4, sequence([0.9, 0.1, 0.5]));
    expect(order.toSorted()).toEqual([0, 1, 2, 3]);
  });

  it('follows the random source', () => {
    // index 3 swaps with 0, index 2 with 0, index 1 with 0.
    expect(shuffledOrder(4, sequence([0]))).toEqual([1, 2, 3, 0]);
    // A value just under 1 always swaps an index with itself.
    expect(shuffledOrder(4, sequence([0.99]))).toEqual([0, 1, 2, 3]);
  });

  it('handles empty and single lists', () => {
    expect(shuffledOrder(0)).toEqual([]);
    expect(shuffledOrder(1)).toEqual([0]);
  });
});
