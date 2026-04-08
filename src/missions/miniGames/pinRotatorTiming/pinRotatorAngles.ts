/**
 * Pin rotator — minimal angle helper for server payload.
 * © 2025 Joseph MULÉ – M1SSION™
 */

export function normalizeDegrees(d: number): number {
  let x = d % 360;
  if (x < 0) x += 360;
  return x;
}
