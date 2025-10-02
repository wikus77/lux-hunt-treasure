// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// NORAH v6.8 - Mini Quiz Module (Alternative to BUZZ)

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  tip: string;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
const QUIZ_POOL: QuizQuestion[] = [
  {
    question: 'Un indizio dice: "Vicino a 3 farmacie in area residenziale". Cosa restringe di più?',
    options: [
      'Area residenziale',
      'Il numero 3 di farmacie',
      'La parola "vicino"'
    ],
    correctIndex: 1,
    explanation: '"3 farmacie" è il dettaglio più raro. Cerchi zone dove convergono esattamente 3 farmacie in 500m.',
    tip: 'Numeri precisi > aggettivi generici. Sempre.'
  },
  {
    question: 'Due indizi: "Via con alberi secolari" e "Zona universitaria storica". Cosa fai?',
    options: [
      'Cerco tutte le università',
      'Cerco vie alberate vicino a università vecchie',
      'Ignoro gli alberi, troppo vago'
    ],
    correctIndex: 1,
    explanation: 'Incrocia i due criteri: zone universitarie storiche (poche) CON vie alberate.',
    tip: 'Interseziona gli indizi: il luogo deve soddisfare ENTRAMBI.'
  },
  {
    question: 'Indizio: "Zona ad alto traffico pedonale, vicino metropolitana". Priorità?',
    options: [
      'Traffico pedonale',
      'Vicinanza metro',
      'Entrambi ugualmente'
    ],
    correctIndex: 1,
    explanation: 'Le fermate metro sono punti fissi e verificabili. Il traffico pedonale è soggettivo.',
    tip: 'Punti di riferimento fisici > aggettivi vaghi.'
  }
];

/**
 * Get random quiz question
 */
export function getRandomQuiz(): QuizQuestion {
  return QUIZ_POOL[Math.floor(Math.random() * QUIZ_POOL.length)];
}

/**
 * Validate user answer and return feedback
 */
export function validateAnswer(quiz: QuizQuestion, userChoice: number): {
  correct: boolean;
  feedback: string;
} {
  const correct = userChoice === quiz.correctIndex;
  
  const feedback = correct
    ? `✅ Esatto! ${quiz.explanation}\n\n💡 ${quiz.tip}`
    : `❌ Non proprio. ${quiz.explanation}\n\n💡 ${quiz.tip}`;
  
  return { correct, feedback };
}

/**
 * Generate quiz challenge message
 */
export function generateQuizChallenge(): string {
  const quiz = getRandomQuiz();
  
  const optionsText = quiz.options
    .map((opt, i) => `${i + 1}. ${opt}`)
    .join('\n');
  
  return `🎯 **Mini-Quiz da 30s** (ti allena senza spoiler)\n\n${quiz.question}\n\n${optionsText}\n\nRispondi con 1, 2 o 3.`;
}
