/**
 * Daily Mini Games — client registry (shell → modal mapping only).
 * No hooks, no business logic, no side effects.
 * Resolves by game_type (preferred when API sends it) then by mission_id.
 * © 2025 Joseph MULÉ – M1SSION™
 */

import type { ComponentType } from 'react';
import {
  MISSION_ID_CIPHER_DRILL,
  MISSION_ID_WORD_DUEL,
  MISSION_ID_SIGNAL_PATTERN,
  MISSION_ID_DMG_V1_D01_PIN_ROTATOR,
  MISSION_ID_TACTICAL_TIC_TAC_TOE,
  MISSION_ID_SHEEP_HERD_V1,
  MISSION_ID_NEUROMATCH_MEMORY_V1,
  GAME_TYPE_PIN_ROTATOR_TIMING,
  GAME_TYPE_TIC_TAC_TOE,
  GAME_TYPE_SHEEP_HERD,
  GAME_TYPE_NEURO_MATCH,
} from '@/missions/serverReal/claimDailyPhase';
import { CipherDrillModal } from '@/missions/ui/CipherDrillModal';
import { WordDuelMemoryModal } from '@/missions/ui/WordDuelMemoryModal';
import { SignalPatternNumbersModal } from '@/missions/ui/SignalPatternNumbersModal';
import { PinRotatorTimingModal } from '@/missions/miniGames/pinRotatorTiming/PinRotatorTimingModal';
import { TicTacToeModal } from '@/missions/miniGames/ticTacToe/TicTacToeModal';
import { SheepHerdModal } from '@/missions/miniGames/sheepHerd/SheepHerdModal';
import { NeuroMatchModal } from '@/missions/miniGames/neuroMatch/NeuroMatchModal';
import type { ShellGameProps } from '@/missions/dailyMiniGames/shellGameProps';

export type { ShellGameProps, PinRotatorReplayContext } from '@/missions/dailyMiniGames/shellGameProps';

const MINI_GAME_BY_MISSION_ID: Record<string, ComponentType<ShellGameProps>> = {
  [MISSION_ID_CIPHER_DRILL]: CipherDrillModal,
  [MISSION_ID_WORD_DUEL]: WordDuelMemoryModal,
  [MISSION_ID_SIGNAL_PATTERN]: SignalPatternNumbersModal,
  [MISSION_ID_DMG_V1_D01_PIN_ROTATOR]: PinRotatorTimingModal,
  [MISSION_ID_TACTICAL_TIC_TAC_TOE]: TicTacToeModal,
  [MISSION_ID_SHEEP_HERD_V1]: SheepHerdModal,
  [MISSION_ID_NEUROMATCH_MEMORY_V1]: NeuroMatchModal,
};

const MINI_GAME_BY_GAME_TYPE: Record<string, ComponentType<ShellGameProps>> = {
  [GAME_TYPE_PIN_ROTATOR_TIMING]: PinRotatorTimingModal,
  [GAME_TYPE_TIC_TAC_TOE]: TicTacToeModal,
  [GAME_TYPE_SHEEP_HERD]: SheepHerdModal,
  [GAME_TYPE_NEURO_MATCH]: NeuroMatchModal,
};

export function getMiniGameModal(
  missionId: string | null | undefined
): ComponentType<ShellGameProps> | null {
  if (missionId == null || missionId === '') return null;
  return MINI_GAME_BY_MISSION_ID[missionId] ?? null;
}

/** Prefer server `game_type` when present; else legacy mission_id map. */
export function resolveMiniGameModal(
  missionId: string | null | undefined,
  gameType: string | null | undefined
): ComponentType<ShellGameProps> | null {
  if (gameType && MINI_GAME_BY_GAME_TYPE[gameType]) {
    return MINI_GAME_BY_GAME_TYPE[gameType];
  }
  return getMiniGameModal(missionId);
}

export function isMiniGameSupported(missionId: string | null | undefined): boolean {
  if (missionId == null || missionId === '') return false;
  return Object.prototype.hasOwnProperty.call(MINI_GAME_BY_MISSION_ID, missionId);
}

export function isShellMiniGameSupported(
  missionId: string | null | undefined,
  gameType: string | null | undefined
): boolean {
  return resolveMiniGameModal(missionId, gameType) != null;
}
