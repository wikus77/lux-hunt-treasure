
/**
 * Utility function that returns the fixed countdown target date
 * (June 19, 2025 00:00 UTC)
 */
export const getMissionDeadline = (): Date => {
  // Define a fixed date - June 19, 2025 at 00:00 UTC
  return new Date('2025-06-19T00:00:00Z');
};

/**
 * Get the number of days until the mission deadline
 */
export const getDaysUntilDeadline = (): number => {
  const now = new Date();
  const deadline = getMissionDeadline();
  const diffTime = Math.abs(deadline.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Check if we're within a certain number of days from the deadline
 */
export const isWithinDaysFromDeadline = (days: number): boolean => {
  return getDaysUntilDeadline() <= days;
};
