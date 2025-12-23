/**
 * MISSION ENGINE
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Core business logic for daily missions.
 */

import {
  MISSIONS_ENABLED,
  getMissionOfTheDay,
  calculatePhaseRewards,
  type MissionDefinition,
} from './missionsRegistry';
import {
  getMissionState,
  completePhase1,
  completePhase2,
  markPhase1Credited,
  markPhase2Credited,
  isPhase2Available,
  isBriefingShownToday,
  type MissionState,
} from './missionState';
import { creditM1USafe } from './rewards/creditM1U';

// ═══════════════════════════════════════════════════════════════
// 🎯 ENGINE TYPES
// ═══════════════════════════════════════════════════════════════

export interface MissionEngineState {
  enabled: boolean;
  currentMission: MissionDefinition | null;
  missionState: MissionState;
  shouldShowBriefing: boolean;
  shouldShowPhase2Resume: boolean;
}

// ═══════════════════════════════════════════════════════════════
// 🎯 ENGINE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function getEngineState(): MissionEngineState {
  if (!MISSIONS_ENABLED) {
    return {
      enabled: false,
      currentMission: null,
      missionState: getMissionState(),
      shouldShowBriefing: false,
      shouldShowPhase2Resume: false,
    };
  }

  const state = getMissionState();
  const todayMission = getMissionOfTheDay();
  const briefingShown = isBriefingShownToday();

  // Determine what to show
  const shouldShowBriefing = state.phase === 0 && !briefingShown;
  const shouldShowPhase2Resume = isPhase2Available();

  return {
    enabled: true,
    currentMission: todayMission,
    missionState: state,
    shouldShowBriefing,
    shouldShowPhase2Resume,
  };
}

export async function handlePhase1Complete(progressData?: Record<string, string | number | boolean>): Promise<number> {
  const mission = getMissionOfTheDay();
  const { phase1: reward } = calculatePhaseRewards(mission.totalRewardM1U);
  
  completePhase1(progressData);
  await creditM1USafe(reward, `Mission Phase 1: ${mission.id}`);
  markPhase1Credited();
  
  console.log('[MissionEngine] 💰 Phase 1 reward credited:', reward, 'M1U');
  return reward;
}

export async function handlePhase2Complete(progressData?: Record<string, string | number>): Promise<number> {
  const mission = getMissionOfTheDay();
  const { phase2: reward } = calculatePhaseRewards(mission.totalRewardM1U);
  
  // Store progress data if provided (for input/counter missions)
  if (progressData) {
    console.log('[MissionEngine] 📝 Phase 2 progress data:', progressData);
  }
  
  completePhase2();
  await creditM1USafe(reward, `Mission Phase 2: ${mission.id}`);
  markPhase2Credited();
  
  console.log('[MissionEngine] 💰 Phase 2 reward credited:', reward, 'M1U');
  return reward;
}

