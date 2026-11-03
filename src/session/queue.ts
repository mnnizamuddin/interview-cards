import type { Exercise } from './build-session.ts';

/** An exercise in the running session; `retry` marks the second chance after a miss. */
export type Step = Exercise & { retry?: boolean };

/**
 * Returns the queue after the current step is finished. A missed exercise comes back once at
 * the end of the session, as in Duolingo; a missed retry does not come back again.
 */
export function afterStep(queue: readonly Step[], index: number, passed: boolean): Step[] {
  const current = queue[index];
  if (passed || !current || current.retry) {
    return [...queue];
  }
  return [...queue, { ...current, retry: true }];
}
