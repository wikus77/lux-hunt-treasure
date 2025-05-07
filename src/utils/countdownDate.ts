
export const getMissionDeadline = (): Date => {
  console.log("Getting mission deadline");
  // Target date: 19 Luglio 2025
  return new Date(2025, 6, 19, 0, 0, 0);
};

// Calcola i giorni rimanenti in modo coerente per tutta l'applicazione
export const getRemainingDays = (): number => {
  const targetDate = getMissionDeadline();
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) return 0;
  
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};
