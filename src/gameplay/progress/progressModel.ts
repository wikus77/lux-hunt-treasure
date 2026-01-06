/**
 * M1SSION™ Progress Model
 * Derives progress data from existing sources (no new data invented)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { CLUE_MILESTONES, ClueMilestone } from '@/hooks/useClueMilestones';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ProgressModel {
  // Core stats (from existing hooks)
  clueCount: number;
  pulseEnergy: number;
  m1uBalance: number;
  streakDays: number;
  
  // Derived data
  agentLevel: number;
  agentTitle: string;
  currentMilestone: ClueMilestone | null;
  nextMilestone: ClueMilestone | null;
  cluesToNextLevel: number;
  progressPercent: number; // 0-100 within current level
  
  // Rank data
  currentRankCode: string;
  currentRankName: string;
  nextRankName: string | null;
  peToNextRank: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// AGENT LEVEL CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate agent level from clue count
 * Level = number of milestones achieved
 */
export function calculateAgentLevel(clueCount: number): number {
  let level = 0;
  for (const milestone of CLUE_MILESTONES) {
    if (clueCount >= milestone.threshold) {
      level++;
    } else {
      break;
    }
  }
  return level;
}

/**
 * Get current milestone (the one we just reached or are in)
 */
export function getCurrentMilestone(clueCount: number): ClueMilestone | null {
  let current: ClueMilestone | null = null;
  for (const milestone of CLUE_MILESTONES) {
    if (clueCount >= milestone.threshold) {
      current = milestone;
    } else {
      break;
    }
  }
  return current;
}

/**
 * Get next milestone to reach
 */
export function getNextMilestone(clueCount: number): ClueMilestone | null {
  for (const milestone of CLUE_MILESTONES) {
    if (clueCount < milestone.threshold) {
      return milestone;
    }
  }
  return null; // Max level reached
}

/**
 * Get agent title from current milestone
 */
export function getAgentTitle(clueCount: number): string {
  const milestone = getCurrentMilestone(clueCount);
  return milestone?.title || 'RECRUIT';
}

/**
 * Calculate progress percentage to next milestone
 */
export function calculateProgressPercent(clueCount: number): number {
  const current = getCurrentMilestone(clueCount);
  const next = getNextMilestone(clueCount);
  
  if (!next) return 100; // Max level
  
  const start = current?.threshold || 0;
  const end = next.threshold;
  const progress = clueCount - start;
  const range = end - start;
  
  return Math.min(100, Math.max(0, (progress / range) * 100));
}

/**
 * Calculate clues needed for next level
 */
export function getCluesToNextLevel(clueCount: number): number {
  const next = getNextMilestone(clueCount);
  if (!next) return 0;
  return Math.max(0, next.threshold - clueCount);
}

// ═══════════════════════════════════════════════════════════════════════════
// NEXT ACTION LOGIC
// ═══════════════════════════════════════════════════════════════════════════

export type NextActionType = 
  | 'go_to_map' 
  | 'go_to_map_rewards'
  | 'go_to_map_buzz_map'
  | 'do_buzz' 
  | 'check_intelligence' 
  | 'claim_reward' 
  | 'do_battle'
  | 'do_pulse_breaker'
  | 'none';

export interface NextAction {
  type: NextActionType;
  label: string;
  description: string;
  path: string;
  priority: number; // Higher = more important
}

// 🎯 ROTATING SUGGESTIONS - Different actions to keep it fresh
const ROTATING_SUGGESTIONS: NextAction[] = [
  {
    type: 'go_to_map_rewards',
    label: 'CERCA I 99 PREMI',
    description: 'Trova i marker verdi sulla mappa e riscatta premi esclusivi!',
    path: '/map-3d-tiler',
    priority: 75,
  },
  {
    type: 'go_to_map_buzz_map',
    label: 'ATTIVA BUZZ MAP',
    description: 'Premi BUZZ MAP per sbloccare l\'area dove si trova il premio',
    path: '/map-3d-tiler',
    priority: 75,
  },
  {
    type: 'do_pulse_breaker',
    label: 'PULSE BREAKER',
    description: 'Tenta la fortuna e moltiplica i tuoi M1U!',
    path: '/pulse-breaker',
    priority: 70,
  },
  {
    type: 'do_battle',
    label: 'BATTLE ARENA',
    description: 'Sfida il bot e vinci M1U con i tuoi riflessi!',
    path: '/battle',
    priority: 70,
  },
];

// Get a rotating suggestion based on time
function getRotatingSuggestion(): NextAction {
  // Rotate every 30 seconds based on timestamp
  const rotationIndex = Math.floor(Date.now() / 30000) % ROTATING_SUGGESTIONS.length;
  return ROTATING_SUGGESTIONS[rotationIndex];
}

/**
 * Determine the best next action for the user
 * Based on their current state - NOW WITH VARIETY!
 */
export function determineNextAction(params: {
  clueCount: number;
  hasUnclaimedRewards?: boolean;
  dailyBuzzCount?: number;
  maxDailyBuzz?: number;
  hasUnreadMessages?: boolean;
}): NextAction {
  const { clueCount, hasUnclaimedRewards, dailyBuzzCount = 0, maxDailyBuzz = 50 } = params;
  
  // Priority 1: Claim rewards if available
  if (hasUnclaimedRewards) {
    return {
      type: 'claim_reward',
      label: 'RISCATTA PREMIO',
      description: 'Hai premi da riscattare sulla mappa!',
      path: '/map-3d-tiler',
      priority: 100,
    };
  }
  
  // Priority 2: First clue - go to map
  if (clueCount === 0) {
    return {
      type: 'go_to_map',
      label: 'INIZIA LA CACCIA',
      description: 'Esplora la mappa per trovare il tuo primo indizio',
      path: '/map-3d-tiler',
      priority: 90,
    };
  }
  
  // Priority 3: Low clue count - encourage BUZZ
  if (clueCount < 10) {
    const nextMilestone = getNextMilestone(clueCount);
    const cluesToNext = nextMilestone ? nextMilestone.threshold - clueCount : 0;
    
    return {
      type: 'do_buzz',
      label: 'FAI BUZZ',
      description: `Mancano ${cluesToNext} indizi per Agent Level ${calculateAgentLevel(clueCount) + 1}`,
      path: '/buzz',
      priority: 80,
    };
  }
  
  // Priority 4: ROTATING SUGGESTIONS based on progress
  const nextMilestone = getNextMilestone(clueCount);
  const cluesToNext = nextMilestone ? nextMilestone.threshold - clueCount : 0;
  const currentLevel = calculateAgentLevel(clueCount);
  
  // Use rotation but also consider specific conditions
  const rotationIndex = Math.floor(Date.now() / 30000) % 5; // 5 options
  
  switch (rotationIndex) {
    case 0:
      return {
        type: 'go_to_map_rewards',
        label: 'CERCA I 99 PREMI',
        description: 'Trova i marker verdi e riscatta premi esclusivi!',
        path: '/map-3d-tiler',
        priority: 75,
      };
    case 1:
      return {
        type: 'go_to_map_buzz_map',
        label: 'ATTIVA BUZZ MAP',
        description: 'Sblocca l\'area dove si trova il premio!',
        path: '/map-3d-tiler',
        priority: 75,
      };
    case 2:
      return {
        type: 'do_buzz',
        label: 'VAI IN BUZZ',
        description: cluesToNext > 0 
          ? `Mancano ${cluesToNext} indizi per Agent Level ${currentLevel + 1}`
          : 'Continua a raccogliere indizi!',
        path: '/buzz',
        priority: 75,
      };
    case 3:
      return {
        type: 'do_pulse_breaker',
        label: 'PULSE BREAKER',
        description: 'Tenta la vittoria e moltiplica M1U!',
        path: '/pulse-breaker',
        priority: 70,
      };
    case 4:
      return {
        type: 'do_battle',
        label: 'BATTLE ARENA',
        description: 'Sfida il bot con i tuoi riflessi!',
        path: '/battle',
        priority: 70,
      };
    default:
      return {
        type: 'go_to_map',
        label: 'ESPLORA LA MAPPA',
        description: 'Cerca marker e indizi nascosti',
        path: '/map-3d-tiler',
        priority: 50,
      };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FULL MODEL BUILDER
// ═══════════════════════════════════════════════════════════════════════════

export function buildProgressModel(params: {
  clueCount: number;
  pulseEnergy: number;
  m1uBalance: number;
  streakDays: number;
  currentRankCode?: string;
  currentRankName?: string;
  nextRankName?: string | null;
  peToNextRank?: number;
}): ProgressModel {
  const { clueCount, pulseEnergy, m1uBalance, streakDays } = params;
  
  return {
    clueCount,
    pulseEnergy,
    m1uBalance,
    streakDays,
    agentLevel: calculateAgentLevel(clueCount),
    agentTitle: getAgentTitle(clueCount),
    currentMilestone: getCurrentMilestone(clueCount),
    nextMilestone: getNextMilestone(clueCount),
    cluesToNextLevel: getCluesToNextLevel(clueCount),
    progressPercent: calculateProgressPercent(clueCount),
    currentRankCode: params.currentRankCode || 'RECRUIT',
    currentRankName: params.currentRankName || 'Recluta',
    nextRankName: params.nextRankName || null,
    peToNextRank: params.peToNextRank || 0,
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

