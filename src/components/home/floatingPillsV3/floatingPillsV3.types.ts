/**
 * Floating Pills V3 — UI-only types (M1SSION™).
 */

export type TimeTierV3 = 'calm' | 'mid' | 'critical';

export interface FloatingPillTapPayload {
  source: 'action' | 'commit' | 'agent' | 'time' | 'battle';
}
