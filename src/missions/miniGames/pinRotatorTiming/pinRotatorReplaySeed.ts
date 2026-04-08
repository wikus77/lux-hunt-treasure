/**
 * Deterministic targets for pin rotator pilot — mirrors Edge `pinHash` / seed in dailyPinRotatorPilotClaim.
 * Used only for local replay when progress_json is incomplete.
 * © 2025 Joseph MULÉ – M1SSION™
 */

import type { PinRotatorReplayContext } from '@/missions/dailyMiniGames/pinRotatorReplayTypes';
import { MISSION_ID_DMG_V1_D01_PIN_ROTATOR } from '@/missions/serverReal/claimDailyPhase';

function pinHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getPilotPinRotatorTargetsFromSeed(dayKey: string, userId: string, missionId: string) {
  const seed = pinHash(dayKey + userId + missionId);
  return {
    targetP1: seed % 360,
    targetP2: (seed * 31 + 17) % 360,
  };
}

export function resolvePinRotatorReplayTargets(
  ctx: PinRotatorReplayContext | null | undefined
): { p1: number; p2: number; t1: number; t2: number } | null {
  if (!ctx?.userId || !ctx.dayKey || !ctx.missionId) return null;

  const j = ctx.progressJson;
  const num = (k: string): number | null =>
    j && typeof j[k] === 'number' && Number.isFinite(j[k] as number) ? (j[k] as number) : null;

  const p1 = num('target_p1');
  const p2 = num('target_p2');
  const t1 = num('tol_p1') ?? 22;
  const t2 = num('tol_p2') ?? 12;

  if (p1 != null && p2 != null) {
    return { p1, p2, t1, t2 };
  }

  if (ctx.missionId !== MISSION_ID_DMG_V1_D01_PIN_ROTATOR) return null;

  const { targetP1, targetP2 } = getPilotPinRotatorTargetsFromSeed(ctx.dayKey, ctx.userId, ctx.missionId);
  return { p1: targetP1, p2: targetP2, t1: 22, t2: 12 };
}
