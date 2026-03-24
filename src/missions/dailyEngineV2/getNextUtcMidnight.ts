/**
 * Next UTC midnight — for countdown display (informational only; server is source of truth).
 * © 2025 Joseph MULÉ – M1SSION™
 */

export function getNextUtcMidnight(): Date {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  return new Date(Date.UTC(y, m, d + 1, 0, 0, 0, 0));
}

export function getSecondsUntilNextUtcMidnight(): number {
  const next = getNextUtcMidnight();
  return Math.max(0, Math.floor((next.getTime() - Date.now()) / 1000));
}
