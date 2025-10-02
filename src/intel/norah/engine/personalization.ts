// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// v7.0: Personalization Engine - Time-Context & Progress-Aware Coaching

export interface TimeContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'weekday' | 'weekend';
  isOptimalTime: boolean;
}

export interface ProgressContext {
  cluesFound: number;
  buzzCount: number;
  lastActivity?: Date;
  hasCompletedTutorial: boolean;
  engagementLevel: 'new' | 'casual' | 'active' | 'expert';
}

/**
 * v7.0: Get current time context for adaptive suggestions
 */
export function getTimeContext(): TimeContext {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  let timeOfDay: TimeContext['timeOfDay'];
  if (hour >= 6 && hour < 12) {
    timeOfDay = 'morning';
  } else if (hour >= 12 && hour < 18) {
    timeOfDay = 'afternoon';
  } else if (hour >= 18 && hour < 23) {
    timeOfDay = 'evening';
  } else {
    timeOfDay = 'night';
  }

  const dayOfWeek = (day === 0 || day === 6) ? 'weekend' : 'weekday';
  
  // Optimal time for missions: weekend or afternoon/evening on weekdays
  const isOptimalTime = dayOfWeek === 'weekend' || 
    (dayOfWeek === 'weekday' && (timeOfDay === 'afternoon' || timeOfDay === 'evening'));

  return { timeOfDay, dayOfWeek, isOptimalTime };
}

/**
 * v7.0: Get time-aware greeting
 */
export function getTimeAwareGreeting(name?: string): string {
  const { timeOfDay } = getTimeContext();
  const userName = name ? ` ${name}` : '';

  const greetings = {
    morning: [
      `Buongiorno${userName}! ☀️`,
      `Hey${userName}, buona giornata!`,
      `Ciao${userName}! Pronto per iniziare?`
    ],
    afternoon: [
      `Ciao${userName}! Come va?`,
      `Hey${userName}, tutto ok?`,
      `Salve${userName}! Come procede?`
    ],
    evening: [
      `Buonasera${userName}! 🌙`,
      `Hey${userName}, bella serata per una missione!`,
      `Ciao${userName}! Momento perfetto per un po' di Intel.`
    ],
    night: [
      `Ciao${userName}, ancora sveglio? 😴`,
      `Hey${userName}, sessione notturna?`,
      `Notte fonda${userName}! Dedizione massima.`
    ]
  };

  const options = greetings[timeOfDay];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * v7.0: Get progress-aware suggestions
 */
export function getProgressAwareSuggestion(progress: ProgressContext): string {
  if (progress.engagementLevel === 'new') {
    return 'Inizia con BUZZ per raccogliere i primi indizi. È il modo più veloce per entrare nel gioco!';
  }

  if (progress.engagementLevel === 'casual' && progress.cluesFound < 3) {
    return 'Hai già qualche indizio. Continua con BUZZ per costruire il quadro completo!';
  }

  if (progress.engagementLevel === 'active' && progress.cluesFound >= 3) {
    return 'Ottima raccolta! Ora puoi analizzare i pattern con PATTERN DRILL per trovare connessioni.';
  }

  if (progress.engagementLevel === 'expert' && progress.cluesFound >= 5) {
    return 'Sei esperto! Considera BUZZ MAP per una visione strategica o vai diretto al FINAL SHOT.';
  }

  return 'Cosa vuoi esplorare oggi?';
}

/**
 * v7.0: Get time-aware NBA suggestions
 */
export function getTimeAwareNBA(timeContext: TimeContext, progress: ProgressContext): string[] {
  const { timeOfDay, isOptimalTime } = timeContext;

  if (timeOfDay === 'morning' && progress.engagementLevel !== 'new') {
    return [
      'Inizia la giornata con BUZZ',
      'Rivedi indizi di ieri',
      'Pianifica strategia giornaliera'
    ];
  }

  if (timeOfDay === 'afternoon' && isOptimalTime) {
    return [
      'BUZZ per nuovi indizi',
      'PATTERN DRILL per analisi',
      'Esplora mappa con BUZZ MAP'
    ];
  }

  if (timeOfDay === 'evening' && progress.cluesFound >= 3) {
    return [
      'Analizza indizi raccolti oggi',
      'PATTERN DRILL per sintesi',
      'Prepara FINAL SHOT'
    ];
  }

  if (timeOfDay === 'night') {
    return [
      'Rivedi progressi di oggi',
      'Studio indizi raccolti',
      'Pianifica per domani'
    ];
  }

  // Default suggestions
  return [
    'Raccogli nuovi indizi',
    'Analizza pattern',
    'Chiedi chiarimenti'
  ];
}

/**
 * v7.0: Determine engagement level based on activity
 */
export function calculateEngagementLevel(progress: ProgressContext): ProgressContext['engagementLevel'] {
  if (!progress.hasCompletedTutorial || progress.cluesFound === 0) {
    return 'new';
  }

  if (progress.cluesFound < 3 || progress.buzzCount < 5) {
    return 'casual';
  }

  if (progress.cluesFound >= 3 && progress.cluesFound < 8) {
    return 'active';
  }

  return 'expert';
}

/**
 * v7.0: Get personalized coaching message
 */
export function getPersonalizedCoaching(
  progress: ProgressContext,
  timeContext: TimeContext
): string {
  const level = calculateEngagementLevel(progress);

  if (level === 'new' && timeContext.isOptimalTime) {
    return 'Momento perfetto per iniziare! Ti guido passo per passo.';
  }

  if (level === 'casual' && progress.lastActivity) {
    const hoursSinceActivity = (Date.now() - progress.lastActivity.getTime()) / (1000 * 60 * 60);
    if (hoursSinceActivity > 24) {
      return 'Bentornato! Hai lasciato alcuni indizi da esplorare.';
    }
  }

  if (level === 'active' && timeContext.timeOfDay === 'evening') {
    return 'Buona serata per fare il punto e preparare la strategia.';
  }

  if (level === 'expert') {
    return 'Esperto a bordo! Dimmi cosa ti serve.';
  }

  return '';
}
