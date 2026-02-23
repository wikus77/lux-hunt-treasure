/**
 * MISSION PROFILE ENGINE™ — Scan step timings (10–40s total).
 * dataComplexity 0..1 => total 10..40s, steps distributed.
 */

import type { ScanStep, ScanStepId } from './types';

const STEP_ORDER: ScanStepId[] = [
  'reading_intel',
  'measuring_geo',
  'discipline_check',
  'operational_power',
  'stabilizing_signal',
];

export function getScanTotalDurationMs(dataComplexity: number): number {
  const clamped = Math.max(0, Math.min(1, dataComplexity));
  return Math.round(10000 + clamped * 30000); // 10s .. 40s
}

export function buildScanSteps(dataComplexity: number): ScanStep[] {
  const totalMs = getScanTotalDurationMs(dataComplexity);
  const stepCount = STEP_ORDER.length;
  const baseMs = Math.floor(totalMs / stepCount);
  const remainder = totalMs - baseMs * stepCount;
  return STEP_ORDER.map((id, i) => {
    const extra = i < remainder ? 1 : 0;
    return {
      id,
      labelKey: `mission_profile_engine_scan_${id}`,
      durationMs: baseMs + extra,
      completed: false,
    };
  });
}

export { STEP_ORDER };
