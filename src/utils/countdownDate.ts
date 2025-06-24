
export const getMissionDeadline = (): Date => {
  console.log("Getting mission deadline");
  // Target date: 19 August 2025, 00:01 (Europe/Rome timezone)
  return new Date(2025, 7, 19, 0, 1, 0); // Month is 0-indexed (7 = August)
};

// Calculate the remaining days consistently throughout the application
export const getRemainingDays = (): number => {
  const targetDate = getMissionDeadline();
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) return 0;
  
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};
