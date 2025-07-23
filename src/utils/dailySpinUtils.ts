// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

// COSMETIC SEGMENTS - Visual only, no prize assignment
export const SEGMENTS = [
  'Grazie per aver partecipato!',
  'M1SSION™ Experience',
  'Torna domani',
  'Continua la missione',
  'Prosegui l\'avventura',
  'Prossimo step',
  'M1SSION™ Community',
  'Buona fortuna!',
  'Keep exploring',
  'Skill beats chance',
  'Deduzione vincente',
  'Strategic thinking'
];

// REMOVED: All prize/winning logic - wheel is now cosmetic only
// No more WINNING_SEGMENTS or LOSING_SEGMENTS

// REMOVED: All prize redirects - no prizes awarded from spin

/**
 * Get message based on rotation degrees - COSMETIC ONLY
 */
export const getMessageFromRotation = (rotationDeg: number): string => {
  const normalizedDeg = ((rotationDeg % 360) + 360) % 360; // Normalize to 0-360
  const segmentAngle = 360 / 12; // 30 degrees per segment
  const segmentIndex = Math.floor(normalizedDeg / segmentAngle);
  return SEGMENTS[segmentIndex] || SEGMENTS[0];
};

/**
 * Get fixed segment for cosmetic wheel - NO RNG, SKILL-BASED ONLY
 * Always returns the same result to eliminate gambling mechanics
 */
export const getCosmeticSegment = (): number => {
  // Always return segment 0 for consistent, non-random experience
  return 0; // "Grazie per aver partecipato!"
};

/**
 * REMOVED: All prize-related functions
 * M1SSION™ awards prizes based on skill, deduction and coordinate precision only
 */