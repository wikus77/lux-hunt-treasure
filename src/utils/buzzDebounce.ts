// M1SSION™ — BUZZ Anti-Double-Tap Debounce System
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

/**
 * BUZZ debounce utility to prevent double-tapping
 * Provides visual feedback and state management
 */

export interface BuzzDebounceState {
  isProcessing: boolean;
  lastClickTime: number;
  clickCount: number;
}

const DEBOUNCE_DURATION = 2000; // 2 seconds
const BUZZ_STATE_KEY = 'm1_buzz_debounce_state';

/**
 * Get current buzz debounce state
 */
export const getBuzzDebounceState = (): BuzzDebounceState => {
  try {
    const saved = sessionStorage.getItem(BUZZ_STATE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      // Reset if too much time has passed
      if (Date.now() - state.lastClickTime > DEBOUNCE_DURATION) {
        return { isProcessing: false, lastClickTime: 0, clickCount: 0 };
      }
      return state;
    }
  } catch (error) {
    console.warn('Failed to get buzz debounce state:', error);
  }
  
  return { isProcessing: false, lastClickTime: 0, clickCount: 0 };
};

/**
 * Update buzz debounce state
 */
export const setBuzzDebounceState = (state: BuzzDebounceState): void => {
  try {
    sessionStorage.setItem(BUZZ_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save buzz debounce state:', error);
  }
};

/**
 * Check if buzz action should be allowed
 */
export const canExecuteBuzz = (): boolean => {
  const state = getBuzzDebounceState();
  const now = Date.now();
  
  // If currently processing, deny
  if (state.isProcessing) {
    console.log('🚫 BUZZ blocked: already processing');
    return false;
  }
  
  // If within debounce window, deny
  if (now - state.lastClickTime < DEBOUNCE_DURATION) {
    console.log('🚫 BUZZ blocked: within debounce window');
    return false;
  }
  
  return true;
};

/**
 * Start buzz processing (sets debounce state)
 */
export const startBuzzProcessing = (): void => {
  const state = getBuzzDebounceState();
  const now = Date.now();
  
  const newState: BuzzDebounceState = {
    isProcessing: true,
    lastClickTime: now,
    clickCount: state.clickCount + 1
  };
  
  setBuzzDebounceState(newState);
  console.log('🚀 BUZZ processing started', newState);
};

/**
 * End buzz processing
 */
export const endBuzzProcessing = (): void => {
  const state = getBuzzDebounceState();
  
  const newState: BuzzDebounceState = {
    ...state,
    isProcessing: false,
    lastClickTime: Date.now()
  };
  
  setBuzzDebounceState(newState);
  console.log('✅ BUZZ processing ended', newState);
};

/**
 * Clear buzz debounce state (for testing)
 */
export const clearBuzzDebounceState = (): void => {
  try {
    sessionStorage.removeItem(BUZZ_STATE_KEY);
    console.log('🔄 BUZZ debounce state cleared');
  } catch (error) {
    console.warn('Failed to clear buzz debounce state:', error);
  }
};

/**
 * Get remaining debounce time in milliseconds
 */
export const getRemainingDebounceTime = (): number => {
  const state = getBuzzDebounceState();
  const elapsed = Date.now() - state.lastClickTime;
  const remaining = Math.max(0, DEBOUNCE_DURATION - elapsed);
  return remaining;
};