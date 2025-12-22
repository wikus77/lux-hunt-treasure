/**
 * MICRO-MISSIONS ENGINE — M1SSION™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Sistema di micro-missioni guidate per il primo utilizzo.
 * Ogni missione = 1 azione + 1 feedback immediato.
 * Zero costi, zero pagamenti, solo engagement.
 */

// ═══════════════════════════════════════════════════════════════
// 🎚️ MASTER FLAG — Set to false to disable all micro-missions
// ═══════════════════════════════════════════════════════════════
export const MICRO_MISSIONS_ENABLED = true;

// ═══════════════════════════════════════════════════════════════
// 📊 DATA MODEL
// ═══════════════════════════════════════════════════════════════
export type MicroMissionTrigger = 
  | 'map_pan'      // User drags/moves the map
  | 'map_zoom'     // User zooms in/out
  | 'marker_click' // User taps a marker
  | 'buzz_open'    // User opens Buzz page (no spend required)
  | 'nav_home'     // User returns to home
  | 'nav_map'      // User goes to map
  | 'any_click'    // Any tap on map area
  | 'scroll'       // User scrolls
  | 'button_tap';  // User taps any button

export interface MicroMission {
  id: string;
  trigger: MicroMissionTrigger;
  icon: string;
  title: string;
  instruction: string;
  completeText: string;
  motivationText?: string; // Shown after completion
}

// ═══════════════════════════════════════════════════════════════
// 🎯 MICRO-MISSIONS LIST (10+ missions)
// ═══════════════════════════════════════════════════════════════
export const MICRO_MISSIONS: MicroMission[] = [
  {
    id: 'move',
    trigger: 'map_pan',
    icon: '🧭',
    title: 'MOVE THE MAP',
    instruction: 'Drag the map to explore the area around you',
    completeText: '✅ Area scanned!',
    motivationText: "You're learning how hunters explore.",
  },
  {
    id: 'zoom',
    trigger: 'map_zoom',
    icon: '🔍',
    title: 'ZOOM IN',
    instruction: 'Pinch or scroll to zoom — something might be closer than you think',
    completeText: '✅ Focus increased!',
    motivationText: 'Details matter in the hunt.',
  },
  {
    id: 'marker',
    trigger: 'marker_click',
    icon: '🔴',
    title: 'TAP A MARKER',
    instruction: 'Look for colored markers on the map and tap one',
    completeText: '✅ Signal detected!',
    motivationText: 'Markers hide valuable information.',
  },
  {
    id: 'buzz',
    trigger: 'buzz_open',
    icon: '⚡',
    title: 'DISCOVER BUZZ',
    instruction: 'Tap the BUZZ button below to see what it does',
    completeText: '✅ Buzz unlocked!',
    motivationText: 'Buzz reveals hidden areas on the map.',
  },
  {
    id: 'return-map',
    trigger: 'nav_map',
    icon: '🗺️',
    title: 'BACK TO THE MAP',
    instruction: 'Return to the map — information changes perception',
    completeText: '✅ New perception unlocked!',
    motivationText: 'The map shows more when you know more.',
  },
  {
    id: 'explore-more',
    trigger: 'map_pan',
    icon: '🌍',
    title: 'EXPLORE FURTHER',
    instruction: 'Move to a different area — prizes are hidden everywhere',
    completeText: '✅ Territory expanded!',
    motivationText: 'The more you explore, the more you find.',
  },
  {
    id: 'zoom-details',
    trigger: 'map_zoom',
    icon: '🎯',
    title: 'FOCUS ON DETAILS',
    instruction: 'Zoom in closer — some markers only appear at high zoom',
    completeText: '✅ Hidden layer revealed!',
    motivationText: 'Patience reveals secrets.',
  },
  {
    id: 'home-check',
    trigger: 'nav_home',
    icon: '🏠',
    title: 'CHECK YOUR BASE',
    instruction: 'Go to Home to see your agent status',
    completeText: '✅ Base secured!',
    motivationText: 'Your command center shows your progress.',
  },
  {
    id: 'find-green',
    trigger: 'marker_click',
    icon: '💚',
    title: 'FIND A GREEN MARKER',
    instruction: 'Green markers = instant prizes. Find one!',
    completeText: '✅ Reward marker found!',
    motivationText: 'Green markers are the key to real prizes.',
  },
  {
    id: 'buzz-again',
    trigger: 'buzz_open',
    icon: '🎰',
    title: 'USE BUZZ AGAIN',
    instruction: 'Open Buzz to generate a new search area',
    completeText: '✅ Area generated!',
    motivationText: 'Each Buzz reveals a new hunting zone.',
  },
];

// ═══════════════════════════════════════════════════════════════
// 🗄️ LOCALSTORAGE MANAGEMENT
// ═══════════════════════════════════════════════════════════════
const MISSION_INDEX_KEY = 'm1_micro_mission_index';
const MISSIONS_COMPLETED_KEY = 'm1_micro_missions_completed';

/**
 * Get current mission index
 */
export function getMissionIndex(): number {
  try {
    const idx = localStorage.getItem(MISSION_INDEX_KEY);
    return idx ? parseInt(idx, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Set current mission index
 */
export function setMissionIndex(index: number): void {
  try {
    localStorage.setItem(MISSION_INDEX_KEY, String(index));
  } catch {}
}

/**
 * Get current mission (or null if all completed)
 */
export function getCurrentMission(): MicroMission | null {
  const index = getMissionIndex();
  if (index >= MICRO_MISSIONS.length) return null;
  return MICRO_MISSIONS[index];
}

/**
 * Advance to next mission
 */
export function advanceToNextMission(): MicroMission | null {
  const currentIndex = getMissionIndex();
  const nextIndex = currentIndex + 1;
  
  if (nextIndex >= MICRO_MISSIONS.length) {
    // All missions completed!
    localStorage.setItem(MISSIONS_COMPLETED_KEY, 'true');
    setMissionIndex(nextIndex);
    console.log('[MicroMissions] 🎉 All missions completed!');
    return null;
  }
  
  setMissionIndex(nextIndex);
  const nextMission = MICRO_MISSIONS[nextIndex];
  console.log(`[MicroMissions] ➡️ Advanced to mission ${nextIndex + 1}/${MICRO_MISSIONS.length}: ${nextMission.id}`);
  return nextMission;
}

/**
 * Check if all missions are completed
 */
export function areAllMissionsCompleted(): boolean {
  try {
    return localStorage.getItem(MISSIONS_COMPLETED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Reset all missions (for testing)
 */
export function resetMicroMissions(): void {
  try {
    localStorage.removeItem(MISSION_INDEX_KEY);
    localStorage.removeItem(MISSIONS_COMPLETED_KEY);
    console.log('[MicroMissions] 🔄 All missions reset');
  } catch {}
}

// Expose reset to window for debugging
if (typeof window !== 'undefined') {
  (window as any).__resetMicroMissions = resetMicroMissions;
}

