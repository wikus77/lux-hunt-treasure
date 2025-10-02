// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// NORAH Sentiment Detection v5 - Lightweight emotion/urgency detection

export type SentimentLabel = 
  | 'frustrated'  // Negative, about to churn
  | 'confused'    // Lost, needs clarity
  | 'rushed'      // Time-constrained, needs quick win
  | 'neutral'     // Normal engagement
  | 'excited';    // Positive, engaged

/**
 * Detect user sentiment from input text (Italian-focused)
 */
export function detectSentiment(input: string): SentimentLabel {
  if (!input || typeof input !== 'string') {
    return 'neutral';
  }

  const lower = input.toLowerCase().trim();

  // Frustrated signals (priority 1 - retention risk)
  const frustratedPatterns = [
    'non mi piace',
    'me ne vado',
    'abbandono',
    'inutile',
    'troppo difficile',
    'troppo complicato',
    'basta',
    'che palle',
    'non serve',
    'non funziona',
    'non va',
    'problema',
    'errore',
    'fa schifo'
  ];

  for (const pattern of frustratedPatterns) {
    if (lower.includes(pattern)) {
      console.log('[Sentiment] Detected: frustrated');
      return 'frustrated';
    }
  }

  // v6.2: Sarcasm baseline detection (priority 1.5)
  const sarcasmPatterns = [
    /ah\s+sì\s+certo/i,
    /figurati/i,
    /come\s+no/i,
    /ma\s+dai/i,
    /certo\s+certo/i
  ];
  
  // If sarcasm + question mark → frustrated
  if (sarcasmPatterns.some(p => p.test(lower)) && lower.includes('?')) {
    console.log('[Sentiment] Detected: frustrated (sarcasm)');
    return 'frustrated';
  }

  // Confused signals (priority 2 - needs hand-holding)
  const confusedPatterns = [
    'non ho capito',
    'nn capito',
    'non capisco',
    'boh',
    '?',
    'non so',
    'cosa vuol dire',
    'cosa significa',
    'come funziona',
    'non riesco',
    'perso',
    'confuso',
    'help',
    'aiuto'
  ];

  // Check for multiple question marks or "boh"
  if (lower.includes('boh') || (lower.match(/\?/g) || []).length >= 2) {
    console.log('[Sentiment] Detected: confused');
    return 'confused';
  }

  for (const pattern of confusedPatterns) {
    if (lower.includes(pattern)) {
      console.log('[Sentiment] Detected: confused');
      return 'confused';
    }
  }

  // Rushed signals (priority 3 - needs micro-action)
  const rushedPatterns = [
    'non ho tempo',
    'ho poco tempo',
    'di corsa',
    'veloce',
    'rapido',
    'ho 30',
    'ho 1 minuto',
    'più tardi',
    'domani',
    'adesso no',
    'ora no',
    'fretta'
  ];

  for (const pattern of rushedPatterns) {
    if (lower.includes(pattern)) {
      console.log('[Sentiment] Detected: rushed');
      return 'rushed';
    }
  }

  // Excited signals (positive engagement)
  const excitedPatterns = [
    'ottimo',
    'fantastico',
    'bene',
    'perfetto',
    'wow',
    'grande',
    'incredibile',
    'fico',
    'top',
    'si!',
    'sì!',
    'andiamo',
    'avanti',
    'ok!',
    '!!'
  ];

  // Check for exclamation marks
  if ((lower.match(/!/g) || []).length >= 2) {
    console.log('[Sentiment] Detected: excited');
    return 'excited';
  }

  for (const pattern of excitedPatterns) {
    if (lower.includes(pattern)) {
      console.log('[Sentiment] Detected: excited');
      return 'excited';
    }
  }

  // Default
  console.log('[Sentiment] Detected: neutral');
  return 'neutral';
}

/**
 * Get tone modifier for reply based on sentiment
 */
export function getToneModifier(sentiment: SentimentLabel): {
  prefix: string;
  style: 'calm' | 'energetic' | 'supportive' | 'neutral';
} {
  switch (sentiment) {
    case 'frustrated':
      return {
        prefix: 'Capisco che possa sembrare complesso. ',
        style: 'calm'
      };

    case 'confused':
      return {
        prefix: 'Tranquillo, ti spiego in modo semplice. ',
        style: 'supportive'
      };

    case 'rushed':
      return {
        prefix: 'Ok, veloce: ',
        style: 'energetic'
      };

    case 'excited':
      return {
        prefix: 'Ottimo! ',
        style: 'energetic'
      };

    case 'neutral':
    default:
      return {
        prefix: '',
        style: 'neutral'
      };
  }
}
