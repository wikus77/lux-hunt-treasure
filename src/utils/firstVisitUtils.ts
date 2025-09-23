// M1SSION™ — First Visit Landing Logic Implementation
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

/**
 * Utility functions for managing first visit behavior
 * Landing page should only be shown on first visit to non-authenticated users
 */

const FIRST_VISIT_KEY = 'm1_first_visit_seen';

/**
 * Check if this is the user's first visit
 */
export const isFirstVisit = (): boolean => {
  try {
    return !localStorage.getItem(FIRST_VISIT_KEY);
  } catch (error) {
    console.warn('localStorage not available, treating as first visit');
    return true;
  }
};

/**
 * Mark the first visit as completed
 */
export const markFirstVisitCompleted = (): void => {
  try {
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
    console.log('🏁 First visit marked as completed');
  } catch (error) {
    console.warn('Failed to mark first visit as completed:', error);
  }
};

/**
 * Clear first visit flag (for testing purposes)
 */
export const resetFirstVisitFlag = (): void => {
  try {
    localStorage.removeItem(FIRST_VISIT_KEY);
    console.log('🔄 First visit flag reset');
  } catch (error) {
    console.warn('Failed to reset first visit flag:', error);
  }
};

/**
 * Should show landing page?
 * Only for non-authenticated users on first visit
 */
export const shouldShowLanding = (isAuthenticated: boolean): boolean => {
  if (isAuthenticated) {
    return false; // Never show landing to authenticated users
  }
  
  return isFirstVisit();
};