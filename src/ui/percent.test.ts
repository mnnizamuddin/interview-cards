import { describe, expect, it } from 'vitest';
import { percent } from './percent.ts';

describe('percent', () => {
  it('rounds to the nearest whole percentage', () => {
    expect(percent(14, 15)).toBe(93);
    expect(percent(1, 15)).toBe(7);
    expect(percent(1, 2)).toBe(50);
  });

  it('shows 1% rather than 0% once something counts', () => {
    expect(percent(1, 365)).toBe(1);
  });

  it('shows 99% rather than 100% while something is left', () => {
    expect(percent(364, 365)).toBe(99);
  });

  it('shows 0% and 100% only at the real ends', () => {
    expect(percent(0, 365)).toBe(0);
    expect(percent(365, 365)).toBe(100);
  });

  it('shows 0% for an empty total', () => {
    expect(percent(0, 0)).toBe(0);
  });
});
