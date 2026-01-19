
// © 2026 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - Countdown Date Utilities - MISSION GENNAIO 2026

export const getMissionDeadline = (): Date => {
  // MISSION END: 30 Gennaio 2026 alle 23:59:59 UTC
  // Questa è la data di fine della missione corrente
  return new Date('2026-01-30T23:59:59.000Z');
};

export const getMissionStartDate = (): Date => {
  // MISSION START: 1 Gennaio 2026
  return new Date('2026-01-01T00:00:00.000Z');
};

export const calculateRemainingDays = (): number => {
  const deadline = getMissionDeadline();
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// Legacy support - redirect to correct function
export const getRemainingDays = calculateRemainingDays;
