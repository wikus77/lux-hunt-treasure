/**
 * MISSION STATE MANAGEMENT
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * localStorage-based state machine for daily missions.
 */

import type { MissionPhase } from './missionsRegistry';

// ═══════════════════════════════════════════════════════════════
// 📦 STORAGE KEYS
// ═══════════════════════════════════════════════════════════════

const STORAGE_PREFIX = 'm1_daily_missions_';

const KEYS = {
  ACTIVE_MISSION_ID: `${STORAGE_PREFIX}active_id`,
  PHASE: `${STORAGE_PREFIX}phase`,
  PHASE1_COMPLETED_AT: `${STORAGE_PREFIX}phase1_completed_at`,
  DAY_KEY: `${STORAGE_PREFIX}day_key`,
  CREDITED_PHASE1: `${STORAGE_PREFIX}credited_phase1`,
  CREDITED_PHASE2: `${STORAGE_PREFIX}credited_phase2`,
  PROGRESS_DATA: `${STORAGE_PREFIX}progress_data`,
  PENDING_REWARDS: `${STORAGE_PREFIX}pending_rewards`,
  BRIEFING_SHOWN_TODAY: `${STORAGE_PREFIX}briefing_shown`,
};

// ═══════════════════════════════════════════════════════════════
// 📊 STATE INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface MissionState {
  activeMissionId: string | null;
  phase: MissionPhase;
  phase1CompletedAt: number | null;
  dayKey: string;
  creditedPhase1: boolean;
  creditedPhase2: boolean;
  progressData: Record<string, string | number | boolean>;
  pendingRewards: number;
}

// ═══════════════════════════════════════════════════════════════
// 🔧 HELPERS
// ═══════════════════════════════════════════════════════════════

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn('[Missions] Failed to save to localStorage');
  }
}

// ═══════════════════════════════════════════════════════════════
// 📖 STATE READERS
// ═══════════════════════════════════════════════════════════════

export function getMissionState(): MissionState {
  const storedDayKey = safeGet<string>(KEYS.DAY_KEY, '');
  const phase = safeGet<MissionPhase>(KEYS.PHASE, 0);
  
  return {
    activeMissionId: safeGet<string | null>(KEYS.ACTIVE_MISSION_ID, null),
    phase,
    phase1CompletedAt: safeGet<number | null>(KEYS.PHASE1_COMPLETED_AT, null),
    dayKey: storedDayKey,
    creditedPhase1: safeGet<boolean>(KEYS.CREDITED_PHASE1, false),
    creditedPhase2: safeGet<boolean>(KEYS.CREDITED_PHASE2, false),
    progressData: safeGet<Record<string, string | number | boolean>>(KEYS.PROGRESS_DATA, {}),
    pendingRewards: safeGet<number>(KEYS.PENDING_REWARDS, 0),
  };
}

export function isBriefingShownToday(): boolean {
  const storedDay = safeGet<string>(KEYS.BRIEFING_SHOWN_TODAY, '');
  return storedDay === getTodayKey();
}

export function isNewDay(): boolean {
  const storedDayKey = safeGet<string>(KEYS.DAY_KEY, '');
  return storedDayKey !== getTodayKey();
}

// ═══════════════════════════════════════════════════════════════
// ✏️ STATE WRITERS
// ═══════════════════════════════════════════════════════════════

export function startMission(missionId: string): void {
  safeSet(KEYS.ACTIVE_MISSION_ID, missionId);
  safeSet(KEYS.PHASE, 1);
  safeSet(KEYS.DAY_KEY, getTodayKey());
  safeSet(KEYS.PHASE1_COMPLETED_AT, null);
  safeSet(KEYS.CREDITED_PHASE1, false);
  safeSet(KEYS.CREDITED_PHASE2, false);
  safeSet(KEYS.PROGRESS_DATA, {});
  console.log('[Missions] 🚀 Mission started:', missionId);
}

export function completePhase1(progressData?: Record<string, string | number | boolean>): void {
  safeSet(KEYS.PHASE, 2);
  safeSet(KEYS.PHASE1_COMPLETED_AT, Date.now());
  if (progressData) {
    safeSet(KEYS.PROGRESS_DATA, progressData);
  }
  console.log('[Missions] ✅ Phase 1 completed');
}

export function completePhase2(): void {
  safeSet(KEYS.PHASE, 3);
  console.log('[Missions] 🎉 Phase 2 completed - Mission finished!');
}

export function markPhase1Credited(): void {
  safeSet(KEYS.CREDITED_PHASE1, true);
}

export function markPhase2Credited(): void {
  safeSet(KEYS.CREDITED_PHASE2, true);
}

export function markBriefingShown(): void {
  safeSet(KEYS.BRIEFING_SHOWN_TODAY, getTodayKey());
}

export function addPendingReward(amount: number): void {
  const current = safeGet<number>(KEYS.PENDING_REWARDS, 0);
  safeSet(KEYS.PENDING_REWARDS, current + amount);
}

export function resetMissionState(): void {
  Object.values(KEYS).forEach(key => {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  });
  console.log('[Missions] 🔄 State reset');
}

/** Check if phase2 is available (it's a new day after phase1) */
export function isPhase2Available(): boolean {
  const state = getMissionState();
  return state.phase === 2 && isNewDay() && state.phase1CompletedAt !== null;
}

