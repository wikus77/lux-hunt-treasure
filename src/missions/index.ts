/**
 * DAILY MISSIONS MODULE
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

// Main controller
export { default as DailyMissionsController } from './DailyMissionsController';

// Registry & Config
export {
  MISSIONS_ENABLED,
  MISSIONS_REWARD_SAFE_MODE,
  MISSIONS_REGISTRY,
  getMissionOfTheDay,
  calculatePhaseRewards,
  type MissionDefinition,
  type MissionDifficulty,
  type MissionPhase,
} from './missionsRegistry';

// State management
export {
  getMissionState,
  startMission,
  completePhase1,
  completePhase2,
  isPhase2Available,
  resetMissionState,
  type MissionState,
} from './missionState';

// Engine
export {
  getEngineState,
  handlePhase1Complete,
  handlePhase2Complete,
} from './missionEngine';

