
// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ - Countdown Date Utilities

export const getMissionDeadline = (): Date => {
  // MISSION START: 17 July 2025 (TODAY) - 30 days duration
  const missionStart = new Date('2025-07-17T00:00:00.000Z');
  const missionEnd = new Date(missionStart);
  missionEnd.setDate(missionStart.getDate() + 30); // 30 days total
  
  return missionEnd;
};

export const getMissionStartDate = (): Date => {
  return new Date('2025-07-17T00:00:00.000Z');
};

export const calculateRemainingDays = (): number => {
  const deadline = getMissionDeadline();
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};
