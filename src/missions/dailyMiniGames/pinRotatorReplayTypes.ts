/**
 * Props payload for allowlist-only pin rotator replay (client-local, no server mutation).
 * © 2025 Joseph MULÉ – M1SSION™
 */

export interface PinRotatorReplayContext {
  dayKey: string;
  missionId: string;
  userId: string;
  progressJson: Record<string, unknown> | null;
}
