// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Shared utility for quiz daily guard logic (USER-SPECIFIC)

/**
 * Generate today's date key in YYYY-MM-DD format (local timezone)
 */
const getTodayKey = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Check if quiz should be shown (per-user, per-day logic)
 * @param userId - User ID (or 'anon' for non-authenticated)
 * @returns true if quiz should be shown, false otherwise
 */
export const shouldShowQuizAfterSkip = (userId: string): boolean => {
  try {
    const todayKey = getTodayKey();
    const kDone = `agentQuiz:completed:${userId}`;
    const kLast = `agentQuiz:lastShown:${userId}`;
    
    const done = localStorage.getItem(kDone) === '1';
    const last = localStorage.getItem(kLast);
    
    const shouldOpen = !done && last !== todayKey;
    
    console.info('[AgentQuiz] shouldShowQuizAfterSkip', {
      userId,
      done,
      lastShown: last || 'never',
      today: todayKey,
      shouldOpen
    });
    
    return shouldOpen;
  } catch (error) {
    console.warn('[AgentQuiz] localStorage not available:', error);
    return true;
  }
};

/**
 * Record that the user was shown the quiz today
 * @param userId - User ID
 */
export const recordQuizShown = (userId: string): void => {
  try {
    const todayKey = getTodayKey();
    const kLast = `agentQuiz:lastShown:${userId}`;
    localStorage.setItem(kLast, todayKey);
    console.info('[AgentQuiz] action=shown', { userId, date: todayKey });
  } catch (error) {
    console.warn('[AgentQuiz] Failed to record quiz shown:', error);
  }
};

/**
 * Record that the user skipped the quiz
 * @param userId - User ID
 */
export const recordQuizSkip = (userId: string): void => {
  try {
    const todayKey = getTodayKey();
    const kLast = `agentQuiz:lastShown:${userId}`;
    // Update last shown to today (already set when shown, but ensure it's current)
    localStorage.setItem(kLast, todayKey);
    console.info('[AgentQuiz] action=skip', { userId, date: todayKey });
  } catch (error) {
    console.warn('[AgentQuiz] Failed to record quiz skip:', error);
  }
};

/**
 * Record that the user completed the quiz (permanent block)
 * @param userId - User ID
 */
export const recordQuizCompleted = (userId: string): void => {
  try {
    const kDone = `agentQuiz:completed:${userId}`;
    localStorage.setItem(kDone, '1');
    console.info('[AgentQuiz] action=complete', { userId });
  } catch (error) {
    console.warn('[AgentQuiz] Failed to record quiz completion:', error);
  }
};
