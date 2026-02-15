/**
 * VERA MISSION: BOMBA - Config & Types
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

export const BOMB_MISSION_ID = 'bomb';

/** Timer in ms (MVP: 30s) */
export const BOMB_TIMER_MS = 30_000;

/** Wire configurations: index = correct wire (0-based), total = wires count */
export interface WireConfig {
  correctIndex: number;
  totalWires: number;
}

export const WIRE_CONFIGS: WireConfig[] = [
  { correctIndex: 0, totalWires: 2 },
  { correctIndex: 1, totalWires: 2 },
  { correctIndex: 0, totalWires: 3 },
  { correctIndex: 1, totalWires: 3 },
  { correctIndex: 2, totalWires: 3 },
];

export function getRandomWireConfig(): WireConfig {
  return WIRE_CONFIGS[Math.floor(Math.random() * WIRE_CONFIGS.length)];
}
