/**
 * Weekly pin target for pin_rotator pilot (client-only).
 * One daily = one visible challenge; difficulty steps with cycle week, not with server phase2.
 * weekIndex: 1–4 from cycle_day_index mapping; fallback 1.
 * © 2025 Joseph MULÉ – M1SSION™
 */

const PINS_BY_WEEK: Record<number, number> = {
  1: 11,
  2: 19,
  3: 25,
  4: 31,
};

/** Map API cycle_day_index to week bucket 1–4. */
export function weekIndexFromCycleDayIndex(cycleDayIndex: number | null | undefined): number {
  if (cycleDayIndex == null || !Number.isFinite(cycleDayIndex)) return 1;
  const n = Math.abs(Math.floor(cycleDayIndex));
  return (n % 4) + 1;
}

/** Single visible target for the day (same for entire daily, regardless of server phase plumbing). */
export function getWeeklyPinsTarget(weekIndex: number): number {
  const w = Math.min(4, Math.max(1, Math.floor(weekIndex) || 1));
  return PINS_BY_WEEK[w] ?? 11;
}
