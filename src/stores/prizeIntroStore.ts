// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ PRIZE INTRO CINEMATIC SYSTEM - Store
// Manages the state for the Prize Intro Overlay

import { create } from 'zustand';

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY_HAS_SEEN = 'm1ssion_hasSeenPrizeIntro';
const STORAGE_KEY_LAST_MISSION_ID = 'm1ssion_lastPrizeIntroMissionId';
const STORAGE_KEY_SEEN_AT = 'm1ssion_prizeIntroSeenAt';

// Debug flag
export const PRIZE_INTRO_DEBUG = true;

// ============================================================================
// TYPES
// ============================================================================

interface PrizeIntroState {
  /** Whether the user has seen the prize intro for the current mission */
  hasSeenPrizeIntro: boolean;
  
  /** The mission ID for which the intro was last seen */
  lastSeenMissionId: string | null;
  
  /** Timestamp when the intro was last seen */
  lastSeenAt: number | null;
  
  /** Whether the overlay is currently visible */
  isOverlayVisible: boolean;
  
  /** Current prize index in cinematic mode */
  currentPrizeIndex: number;
  
  /** Whether the cinematic sequence is complete */
  isSequenceComplete: boolean;
  
  // Actions
  markPrizeIntroSeen: (missionId?: string) => void;
  resetPrizeIntro: () => void;
  showOverlay: () => void;
  hideOverlay: () => void;
  setCurrentPrizeIndex: (index: number) => void;
  nextPrize: () => void;
  previousPrize: () => void;
  markSequenceComplete: () => void;
  shouldShowPrizeIntro: (currentMissionId?: string) => boolean;
}

// ============================================================================
// LOCALSTORAGE HELPERS (SSR-safe)
// ============================================================================

function safeGetStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
}

function safeSetStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently fail if localStorage is full or unavailable
  }
}

function safeRemoveStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}

// ============================================================================
// INITIAL STATE LOADERS
// ============================================================================

function loadHasSeenPrizeIntro(): boolean {
  return safeGetStorage<boolean>(STORAGE_KEY_HAS_SEEN, false);
}

function loadLastSeenMissionId(): string | null {
  return safeGetStorage<string | null>(STORAGE_KEY_LAST_MISSION_ID, null);
}

function loadLastSeenAt(): number | null {
  return safeGetStorage<number | null>(STORAGE_KEY_SEEN_AT, null);
}

// ============================================================================
// STORE
// ============================================================================

export const usePrizeIntroStore = create<PrizeIntroState>((set, get) => ({
  // Initial state (loaded from localStorage)
  hasSeenPrizeIntro: loadHasSeenPrizeIntro(),
  lastSeenMissionId: loadLastSeenMissionId(),
  lastSeenAt: loadLastSeenAt(),
  isOverlayVisible: false,
  currentPrizeIndex: 0,
  isSequenceComplete: false,

  /**
   * markPrizeIntroSeen - Mark the prize intro as seen
   * Optionally pass a missionId to track per-mission
   */
  markPrizeIntroSeen: (missionId?: string) => {
    const now = Date.now();
    
    safeSetStorage(STORAGE_KEY_HAS_SEEN, true);
    safeSetStorage(STORAGE_KEY_SEEN_AT, now);
    if (missionId) {
      safeSetStorage(STORAGE_KEY_LAST_MISSION_ID, missionId);
    }

    if (PRIZE_INTRO_DEBUG) {
      console.log('[PRIZE INTRO] ✅ Marked as seen', { missionId, timestamp: now });
    }

    set({
      hasSeenPrizeIntro: true,
      lastSeenMissionId: missionId || get().lastSeenMissionId,
      lastSeenAt: now,
      isOverlayVisible: false,
      isSequenceComplete: true,
    });

    // 🌑 Dispatch event for Shadow Protocol integration
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shadow:prizeIntroEnd'));
    }
  },

  /**
   * resetPrizeIntro - Reset the prize intro state
   * Useful for testing or when a new mission starts
   */
  resetPrizeIntro: () => {
    safeRemoveStorage(STORAGE_KEY_HAS_SEEN);
    safeRemoveStorage(STORAGE_KEY_LAST_MISSION_ID);
    safeRemoveStorage(STORAGE_KEY_SEEN_AT);

    if (PRIZE_INTRO_DEBUG) {
      console.log('[PRIZE INTRO] 🔄 Reset');
    }

    set({
      hasSeenPrizeIntro: false,
      lastSeenMissionId: null,
      lastSeenAt: null,
      isOverlayVisible: false,
      currentPrizeIndex: 0,
      isSequenceComplete: false,
    });
  },

  /**
   * showOverlay - Show the prize intro overlay
   */
  showOverlay: () => {
    if (PRIZE_INTRO_DEBUG) {
      console.log('[PRIZE INTRO] 🎬 Showing overlay');
    }

    // 🌑 Dispatch event for Shadow Protocol integration
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shadow:prizeIntroStart'));
    }

    set({
      isOverlayVisible: true,
      currentPrizeIndex: 0,
      isSequenceComplete: false,
    });
  },

  /**
   * hideOverlay - Hide the prize intro overlay
   */
  hideOverlay: () => {
    if (PRIZE_INTRO_DEBUG) {
      console.log('[PRIZE INTRO] 🎬 Hiding overlay');
    }

    set({
      isOverlayVisible: false,
    });
  },

  /**
   * setCurrentPrizeIndex - Set the current prize index
   */
  setCurrentPrizeIndex: (index: number) => {
    set({ currentPrizeIndex: index });
  },

  /**
   * nextPrize - Go to the next prize
   */
  nextPrize: () => {
    const state = get();
    set({ currentPrizeIndex: state.currentPrizeIndex + 1 });
  },

  /**
   * previousPrize - Go to the previous prize
   */
  previousPrize: () => {
    const state = get();
    if (state.currentPrizeIndex > 0) {
      set({ currentPrizeIndex: state.currentPrizeIndex - 1 });
    }
  },

  /**
   * markSequenceComplete - Mark the cinematic sequence as complete
   */
  markSequenceComplete: () => {
    if (PRIZE_INTRO_DEBUG) {
      console.log('[PRIZE INTRO] ✅ Sequence complete');
    }
    set({ isSequenceComplete: true });
  },

  /**
   * shouldShowPrizeIntro - Check if the prize intro should be shown
   * 
   * Logic:
   * 1. If never seen, show it
   * 2. If seen for a different mission, show it again
   * 3. If seen for the same mission, don't show
   */
  shouldShowPrizeIntro: (currentMissionId?: string) => {
    const state = get();
    
    // Never seen - show it
    if (!state.hasSeenPrizeIntro) {
      return true;
    }

    // If we have a mission ID, check if it's different from the last seen
    if (currentMissionId && state.lastSeenMissionId !== currentMissionId) {
      return true;
    }

    return false;
  },
}));

// ============================================================================
// SELECTORS
// ============================================================================

export const selectHasSeenPrizeIntro = (state: PrizeIntroState) => state.hasSeenPrizeIntro;
export const selectIsOverlayVisible = (state: PrizeIntroState) => state.isOverlayVisible;
export const selectCurrentPrizeIndex = (state: PrizeIntroState) => state.currentPrizeIndex;
export const selectIsSequenceComplete = (state: PrizeIntroState) => state.isSequenceComplete;

// ============================================================================
// HELPER: Check if intro should show (for use outside React)
// ============================================================================

export function checkShouldShowPrizeIntro(currentMissionId?: string): boolean {
  return usePrizeIntroStore.getState().shouldShowPrizeIntro(currentMissionId);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™





