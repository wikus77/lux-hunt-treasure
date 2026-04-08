/**
 * Shared props for daily shell mini-game modals (DailyEngineV2Card).
 * © 2025 Joseph MULÉ – M1SSION™
 */

import type { PinRotatorReplayContext } from './pinRotatorReplayTypes';

export type { PinRotatorReplayContext };

export interface ShellGameProps {
  onClose: () => void;
  onComplete: () => void;
  /** Allowlist-only: completed pin_rotator_timing local simulation (no claims). */
  replayTestMode?: boolean;
  pinRotatorReplayContext?: PinRotatorReplayContext | null;
}
