// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ PRIZE INTRO CINEMATIC SYSTEM - Store
// Manages the state for the Prize Intro Overlay

import { create } from 'zustand';

// ============================================================================
// CONSTANTS
// ============================================================================

// 🔐 Chiavi localStorage con supporto per user-id
const getStorageKey = (base: string, userId?: string) => 
  userId ? `${base}_${userId}` : base;

const STORAGE_KEY_BASE_HAS_SEEN = 'm1ssion_hasSeenPrizeIntro';
const STORAGE_KEY_BASE_LAST_MISSION_ID = 'm1ssion_lastPrizeIntroMissionId';
const STORAGE_KEY_BASE_SEEN_AT = 'm1ssion_prizeIntroSeenAt';

// Current user ID (set when user logs in)
let currentUserId: string | undefined;

// Debug flag
export const PRIZE_INTRO_DEBUG = true;

// 🔐 Set current user ID (called from auth context)
export const setPrizeIntroUserId = (userId: string | undefined) => {
  currentUserId = userId;
  // Reload state from localStorage with new user ID
  if (userId) {
    usePrizeIntroStore.getState().reloadForUser(userId);
  }
};

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
// INITIAL STATE LOADERS (user-specific with legacy fallback)
// ============================================================================

function loadHasSeenPrizeIntro(userId?: string): boolean {
  // 🔐 Prima controlla chiave user-specific
  if (userId) {
    const userKey = getStorageKey(STORAGE_KEY_BASE_HAS_SEEN, userId);
    const userValue = safeGetStorage<boolean>(userKey, false);
    if (userValue) return true;
  }
  
  // 🔄 Fallback: controlla chiave legacy (senza userId)
  const legacyValue = safeGetStorage<boolean>(STORAGE_KEY_BASE_HAS_SEEN, false);
  
  // Se trovato in legacy E abbiamo userId, migra alla nuova chiave
  if (legacyValue && userId) {
    const newKey = getStorageKey(STORAGE_KEY_BASE_HAS_SEEN, userId);
    safeSetStorage(newKey, true);
    if (PRIZE_INTRO_DEBUG) {
      console.log('[PRIZE INTRO] 🔄 Migrated hasSeenPrizeIntro to user-specific key');
    }
  }
  
  return legacyValue;
}

function loadLastSeenMissionId(userId?: string): string | null {
  if (userId) {
    const userKey = getStorageKey(STORAGE_KEY_BASE_LAST_MISSION_ID, userId);
    const userValue = safeGetStorage<string | null>(userKey, null);
    if (userValue) return userValue;
  }
  return safeGetStorage<string | null>(STORAGE_KEY_BASE_LAST_MISSION_ID, null);
}

function loadLastSeenAt(userId?: string): number | null {
  if (userId) {
    const userKey = getStorageKey(STORAGE_KEY_BASE_SEEN_AT, userId);
    const userValue = safeGetStorage<number | null>(userKey, null);
    if (userValue) return userValue;
  }
  return safeGetStorage<number | null>(STORAGE_KEY_BASE_SEEN_AT, null);
}

// ============================================================================
// STORE
// ============================================================================

interface PrizeIntroStateWithReload extends PrizeIntroState {
  reloadForUser: (userId: string) => void;
}

export const usePrizeIntroStore = create<PrizeIntroStateWithReload>((set, get) => ({
  // Initial state (loaded from localStorage - will be reloaded when user logs in)
  hasSeenPrizeIntro: loadHasSeenPrizeIntro(currentUserId),
  lastSeenMissionId: loadLastSeenMissionId(currentUserId),
  lastSeenAt: loadLastSeenAt(currentUserId),
  isOverlayVisible: false,
  currentPrizeIndex: 0,
  isSequenceComplete: false,

  /**
   * reloadForUser - Reload state for a specific user
   * Called when user logs in
   */
  reloadForUser: (userId: string) => {
    if (PRIZE_INTRO_DEBUG) {
      console.log('[PRIZE INTRO] 🔄 Reloading for user:', userId);
    }
    set({
      hasSeenPrizeIntro: loadHasSeenPrizeIntro(userId),
      lastSeenMissionId: loadLastSeenMissionId(userId),
      lastSeenAt: loadLastSeenAt(userId),
    });
  },

  /**
   * markPrizeIntroSeen - Mark the prize intro as seen
   * Optionally pass a missionId to track per-mission
   */
  markPrizeIntroSeen: (missionId?: string) => {
    const now = Date.now();
    
    // 🔐 Usa chiavi user-specific
    const keyHasSeen = getStorageKey(STORAGE_KEY_BASE_HAS_SEEN, currentUserId);
    const keySeenAt = getStorageKey(STORAGE_KEY_BASE_SEEN_AT, currentUserId);
    const keyLastMissionId = getStorageKey(STORAGE_KEY_BASE_LAST_MISSION_ID, currentUserId);
    
    safeSetStorage(keyHasSeen, true);
    safeSetStorage(keySeenAt, now);
    if (missionId) {
      safeSetStorage(keyLastMissionId, missionId);
    }

    if (PRIZE_INTRO_DEBUG) {
      console.log('[PRIZE INTRO] ✅ Marked as seen', { missionId, timestamp: now, userId: currentUserId });
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
    // 🔐 Usa chiavi user-specific
    const keyHasSeen = getStorageKey(STORAGE_KEY_BASE_HAS_SEEN, currentUserId);
    const keySeenAt = getStorageKey(STORAGE_KEY_BASE_SEEN_AT, currentUserId);
    const keyLastMissionId = getStorageKey(STORAGE_KEY_BASE_LAST_MISSION_ID, currentUserId);
    
    safeRemoveStorage(keyHasSeen);
    safeRemoveStorage(keyLastMissionId);
    safeRemoveStorage(keySeenAt);

    if (PRIZE_INTRO_DEBUG) {
      console.log('[PRIZE INTRO] 🔄 Reset for user:', currentUserId);
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





