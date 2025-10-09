// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Shared utility for quiz daily guard logic

const QUIZ_SKIP_KEY = 'm1_quiz_last_skip';

/**
 * Check if a day has passed since the last quiz skip
 * @returns true if quiz should be shown (new day or never skipped), false if still same day
 */
export const shouldShowQuizAfterSkip = (): boolean => {
  try {
    const lastSkipDate = localStorage.getItem(QUIZ_SKIP_KEY);
    if (!lastSkipDate) return true; // Never skipped before
    
    const lastSkip = new Date(lastSkipDate);
    const now = new Date();
    
    // Compare dates (ignoring time)
    return lastSkip.toDateString() !== now.toDateString();
  } catch (error) {
    console.warn('localStorage not available:', error);
    return true;
  }
};

/**
 * Record that the user skipped the quiz today
 */
export const recordQuizSkip = (): void => {
  try {
    const now = new Date();
    localStorage.setItem(QUIZ_SKIP_KEY, now.toISOString());
    console.log('📅 Quiz skip recorded for today');
  } catch (error) {
    console.warn('Failed to record quiz skip:', error);
  }
};
