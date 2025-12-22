/**
 * MICRO-MISSIONS CONFIG — M1SSION™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * 🎚️ FEATURE FLAG: Set to false to disable ALL micro-missions instantly
 */

// ==========================================
// 🎚️ MASTER FEATURE FLAG - ROLLBACK SWITCH
// ==========================================
export const MICRO_MISSIONS_ENABLED = true;

// ==========================================
// STORAGE KEYS
// ==========================================
const STORAGE_KEY = 'm1_micro_missions_index';
const COMPLETED_KEY = 'm1_micro_missions_completed';
const IDLE_POPUP_SHOWN_KEY = 'm1_idle_popup_shown_session';

// ==========================================
// MISSION TYPES
// ==========================================
export type MicroMission = {
  id: string;
  trigger: 'map_pan' | 'map_zoom' | 'marker_click' | 'buzz_open' | 'nav_map';
  icon: string;
  title: string;
  instruction: string;
  completeText: string;
  cta?: { text: string; route: string };
};

// ==========================================
// MISSION LIST (5 core missions)
// ==========================================
export const MICRO_MISSIONS: MicroMission[] = [
  {
    id: 'move',
    trigger: 'map_pan',
    icon: '🧭',
    title: 'Move the map',
    instruction: 'Drag the map to explore the area',
    completeText: '✅ Area scanned',
  },
  {
    id: 'zoom',
    trigger: 'map_zoom',
    icon: '🔍',
    title: 'Zoom in',
    instruction: 'Something might be closer than you think',
    completeText: '✅ Focus increased',
  },
  {
    id: 'marker',
    trigger: 'marker_click',
    icon: '🔴',
    title: 'Tap a red marker',
    instruction: 'Other agents hide valuable signals',
    completeText: '✅ Signal detected',
  },
  {
    id: 'buzz',
    trigger: 'buzz_open',
    icon: '⚡',
    title: 'Need help?',
    instruction: 'Buzz reveals something nearby',
    completeText: '✅ Buzz discovered',
    cta: { text: 'OPEN BUZZ', route: '/buzz' },
  },
  {
    id: 'return',
    trigger: 'nav_map',
    icon: '🗺️',
    title: 'Go back to the map',
    instruction: 'Information changes what you see',
    completeText: '✅ New perception unlocked',
  },
];

// ==========================================
// IDLE POPUP CONFIG (5 seconds idle)
// ==========================================
export const IDLE_POPUP_CONFIG = {
  idleTimeMs: 5000, // 5 seconds
  line1: 'One real prize is hidden near you.',
  line2: 'Explore the map to get closer.',
  line3: 'Start exploring.',
};

// ==========================================
// STATE MANAGEMENT FUNCTIONS
// ==========================================
export function getMissionIndex(): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

export function setMissionIndex(index: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, index.toString());
}

export function getCurrentMission(): MicroMission | null {
  const index = getMissionIndex();
  if (index >= MICRO_MISSIONS.length) return null;
  return MICRO_MISSIONS[index];
}

export function advanceToNextMission(): MicroMission | null {
  const currentIndex = getMissionIndex();
  const nextIndex = currentIndex + 1;
  setMissionIndex(nextIndex);
  if (nextIndex >= MICRO_MISSIONS.length) {
    localStorage.setItem(COMPLETED_KEY, 'true');
    return null;
  }
  return MICRO_MISSIONS[nextIndex];
}

export function areAllMissionsCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(COMPLETED_KEY) === 'true';
}

export function resetMissions(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(COMPLETED_KEY);
}

export function hasIdlePopupBeenShown(): boolean {
  if (typeof window === 'undefined') return true;
  return sessionStorage.getItem(IDLE_POPUP_SHOWN_KEY) === 'true';
}

export function markIdlePopupShown(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(IDLE_POPUP_SHOWN_KEY, 'true');
}

