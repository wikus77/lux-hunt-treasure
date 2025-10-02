// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// NORAH v6.8 - Pattern Drill Module (Alternative to BUZZ)

export interface PatternExample {
  title: string;
  patterns: string[];
  question: string;
  answer: string;
  reasoning: string;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
const PATTERN_DRILLS: PatternExample[] = [
  {
    title: 'Drill Geografico',
    patterns: [
      'Indizio A: "Zona nord, vicino parco"',
      'Indizio B: "Area verde estesa, pista ciclabile"'
    ],
    question: 'Quale restringe di più la zona finale?',
    answer: 'Indizio B',
    reasoning: 'B è più specifico: "area verde estesa + pista ciclabile" sono 2 criteri verificabili. A dice solo "vicino parco" (generico).'
  },
  {
    title: 'Drill Temporale',
    patterns: [
      'Indizio A: "Aperto dalle 8:00"',
      'Indizio B: "Chiuso il martedì"'
    ],
    question: 'Quale esclude più luoghi?',
    answer: 'Indizio B',
    reasoning: 'B esclude tutti i posti aperti 7/7. A dice solo l\'orario di apertura (molto comune).'
  },
  {
    title: 'Drill Architettonico',
    patterns: [
      'Indizio A: "Edificio storico"',
      'Indizio B: "Facciata liberty con 3 archi"'
    ],
    question: 'Quale permette di identificare il punto esatto?',
    answer: 'Indizio B',
    reasoning: 'B dà dettagli architettonici specifici: "liberty + 3 archi" è rarissimo. A è troppo vago.'
  }
];

/**
 * Get random pattern drill
 */
export function getRandomDrill(): PatternExample {
  return PATTERN_DRILLS[Math.floor(Math.random() * PATTERN_DRILLS.length)];
}

/**
 * Generate pattern drill challenge
 */
export function generateDrillChallenge(): string {
  const drill = getRandomDrill();
  
  const patternsText = drill.patterns.join('\n');
  
  return `🔍 **Pattern Drill** (riconosci cosa conta)\n\n${drill.title}\n\n${patternsText}\n\n❓ ${drill.question}\n\nRispondi "A" o "B".`;
}

/**
 * Validate drill answer
 */
export function validateDrillAnswer(drill: PatternExample, userChoice: string): {
  correct: boolean;
  feedback: string;
} {
  const normalized = userChoice.trim().toUpperCase();
  const correctLetter = drill.answer.includes('A') ? 'A' : 'B';
  const correct = normalized === correctLetter;
  
  const feedback = correct
    ? `✅ Esatto! ${drill.reasoning}`
    : `❌ Non proprio. ${drill.reasoning}`;
  
  return { correct, feedback };
}
