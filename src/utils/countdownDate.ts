
/**
 * Returns the target date for the mission deadline
 * This is used by the countdown timer
 */
export const getMissionDeadline = (): Date => {
  // Set to 30 days from now by default
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 30);
  
  // Set to midnight
  targetDate.setHours(0, 0, 0, 0);
  
  return targetDate;
};

/**
 * Format a date for display
 */
export const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
