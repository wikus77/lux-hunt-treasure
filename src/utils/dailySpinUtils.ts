// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

export const SEGMENTS = [
  'BUZZ x1',
  'Missione Fallita',
  'Clue di Settimana 4',
  'Nessun Premio',
  'BUZZ x2',
  'Missione Fallita',
  'Premio Random',
  'BUZZ MAPPA Gratis',
  'Missione Fallita',
  '3h senza blocchi BUZZ',
  'Indizio Extra',
  'Missione Fallita'
];

// Probabilità ridotta: solo 25% di vincita
export const WINNING_SEGMENTS = [0, 2, 4, 6, 7, 9, 10]; // 7 su 12
export const LOSING_SEGMENTS = [1, 3, 5, 8, 11]; // Missione Fallita e Nessun Premio

// Map prize to redirect paths
export const PRIZE_REDIRECTS: Record<string, string> = {
  'BUZZ x1': '/buzz',
  'BUZZ x2': '/buzz', 
  'BUZZ MAPPA gratis': '/map?autoBuzzMapFree=true',
  'Clue di Settimana 4': '/clues?week=4',
  'Premio Random': '/prizes',
  '3h senza blocchi BUZZ': '/home', // Salva timestamp e redirect home
  'Indizio Extra': '/clues'
};

/**
 * Get prize based on rotation degrees
 */
export const getPrizeFromRotation = (rotationDeg: number): string => {
  const normalizedDeg = ((rotationDeg % 360) + 360) % 360; // Normalize to 0-360
  const segmentAngle = 360 / 12; // 30 degrees per segment
  const segmentIndex = Math.floor(normalizedDeg / segmentAngle);
  return SEGMENTS[segmentIndex] || SEGMENTS[0];
};

/**
 * Get random segment based on 25% win probability
 */
export const getRandomSegment = (): number => {
  const random = Math.random();
  
  // Solo 25% di possibilità di vincere
  if (random <= 0.25) {
    // Vince: prende un segmento vincente
    const winningIndex = Math.floor(Math.random() * WINNING_SEGMENTS.length);
    return WINNING_SEGMENTS[winningIndex];
  } else {
    // Perde: prende un segmento perdente
    const losingIndex = Math.floor(Math.random() * LOSING_SEGMENTS.length);
    return LOSING_SEGMENTS[losingIndex];
  }
};

/**
 * Get redirect path for a prize
 */
export const getPrizeRedirectPath = (prize: string): string | null => {
  return PRIZE_REDIRECTS[prize] || null;
};

/**
 * Check if a prize is winning (not "Missione Fallita" or "Nessun premio")
 */
export const isWinningPrize = (prize: string): boolean => {
  return !['Missione Fallita', 'Nessun Premio'].includes(prize);
};

/**
 * Get prize message based on prize type
 */
export const getPrizeMessage = (prize: string): string => {
  if (['Missione Fallita', 'Nessun Premio'].includes(prize)) {
    return `${prize} - Riprova domani!`;
  } else if (prize === '3h senza blocchi BUZZ') {
    return 'Hai vinto 3 ore senza limitazioni BUZZ!';
  } else {
    return `Hai vinto: ${prize}!`;
  }
};