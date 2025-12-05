
// Constants for buzz clues functionality
export const BUZZ_STORAGE_KEYS = {
  UNLOCKED_CLUES_COUNT: 'unlockedCluesCount',
  USED_VAGUE_CLUES: 'usedVagueBuzzClues'
};

// Totale indizi sbloccabili per utente durante una missione (30 giorni)
export const MAX_BUZZ_CLUES = 250;

// Progressione settimanale: quanti indizi può sbloccare l'utente ogni settimana
export const WEEKLY_CLUE_LIMITS = {
  week1: 45,   // ~6-7 BUZZ/giorno
  week2: 55,   // ~8 BUZZ/giorno
  week3: 70,   // ~10 BUZZ/giorno
  week4: 80,   // ~9 BUZZ/giorno (ultimi giorni intensi)
};

// Indizi cumulativi per settimana
export const CUMULATIVE_CLUE_LIMITS = {
  week1: 45,
  week2: 100,  // 45 + 55
  week3: 170,  // 100 + 70
  week4: 250,  // 170 + 80 = MAX
};
