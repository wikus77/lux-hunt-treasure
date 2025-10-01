// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// NORAH Next-Best-Action Engine v5 - Dynamic action suggestions

import type { NorahContext } from './contextBuilder';
import type { NorahPhase } from './dialogueManager';
import type { SentimentLabel } from './sentiment';

export interface NBAResult {
  title: string;
  steps: string[];
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Compute Next Best Action based on context, phase, and sentiment
 */
export function computeNBA(
  ctx: NorahContext,
  phase: NorahPhase,
  sentiment: SentimentLabel
): NBAResult {
  const clues = ctx?.stats?.clues || 0;
  const buzzToday = ctx?.stats?.buzz_today || 0;
  const finalshotToday = ctx?.stats?.finalshot_today || 0;

  // High priority: Retention risk (frustrated user)
  if (sentiment === 'frustrated') {
    return {
      title: 'Percorso semplificato',
      steps: [
        'BUZZ → ottieni 1 indizio',
        'BUZZ Map → vedi l\'area',
        'Final Shot → quando sei sicuro (max 2/giorno)'
      ],
      reason: 'User frustrated, need simplification',
      priority: 'high'
    };
  }

  // High priority: Time-constrained user
  if (sentiment === 'rushed') {
    return {
      title: 'Azione rapida (30 secondi)',
      steps: [
        'Apri BUZZ',
        'Prendi 1 indizio',
        'Chiudi, continua domani'
      ],
      reason: 'User rushed, micro-action needed',
      priority: 'high'
    };
  }

  // Medium priority: Confused user
  if (sentiment === 'confused') {
    return {
      title: 'Orientamento base',
      steps: [
        'BUZZ ti dà indizi, uno alla volta',
        'Raccogli 3-4 indizi prima di analizzare',
        'Torna qui per confrontarli insieme'
      ],
      reason: 'User confused, clarity needed',
      priority: 'medium'
    };
  }

  // Phase-based NBA for normal/excited users
  switch (phase) {
    case 'onboarding':
      if (buzzToday === 0) {
        return {
          title: 'Primo BUZZ ora',
          steps: [
            'Vai su BUZZ (tab in basso)',
            'Raccogli il tuo primo indizio',
            'Leggi attentamente cosa dice',
            'Poi torna qui per analizzarlo'
          ],
          reason: 'No buzz today, immediate action needed',
          priority: 'high'
        };
      }
      return {
        title: 'Continua la raccolta iniziale',
        steps: [
          'Fai 2-3 BUZZ oggi',
          'Ogni indizio è importante',
          'Target: 3-4 indizi per iniziare analisi'
        ],
        reason: 'Onboarding phase, build foundation',
        priority: 'medium'
      };

    case 'collecting':
      return {
        title: 'Accumula più dati',
        steps: [
          `Hai ${clues} indizi, servono 4-5 per pattern`,
          'Fai altri 2 BUZZ oggi',
          'Prendi nota dei dettagli comuni',
          'Poi analizziamo insieme'
        ],
        reason: 'Collecting phase, need more data',
        priority: 'medium'
      };

    case 'analyzing':
      return {
        title: 'Analisi pattern avanzata',
        steps: [
          `Con ${clues} indizi puoi cercare correlazioni`,
          'Apri BUZZ Map e confronta le aree',
          'Cerca sovrapposizioni toponimi',
          'Identifica cluster geografici',
          'Se servono più dati, fai 1-2 BUZZ extra'
        ],
        reason: 'Analyzing phase, pattern detection',
        priority: 'medium'
      };

    case 'hypothesis':
      return {
        title: 'Verifica ipotesi',
        steps: [
          `${clues} indizi: base solida`,
          'Incrocia tutti i riferimenti',
          'Verifica convergenze su BUZZ Map',
          'Controlla coerenza interna',
          'Se sicuro al 90%, considera Final Shot'
        ],
        reason: 'Hypothesis phase, verification needed',
        priority: 'medium'
      };

    case 'final_prep':
      if (finalshotToday >= 2) {
        return {
          title: 'Limite Final Shot raggiunto',
          steps: [
            'Hai esaurito i 2 Final Shot di oggi',
            'Raffina l\'ipotesi per domani',
            'Rivedi tutti gli indizi con calma',
            'Cerca eventuali dettagli mancanti'
          ],
          reason: 'Final Shot limit reached',
          priority: 'low'
        };
      }
      return {
        title: 'Preparazione Final Shot',
        steps: [
          'Ricapitola tutti gli indizi',
          'Verifica coerenza geografica',
          'Controlla convergenze semantiche',
          `Tentativi rimasti oggi: ${2 - finalshotToday}`,
          'Quando sei sicuro, prova Final Shot'
        ],
        reason: 'Final prep, ready for shot',
        priority: 'high'
      };

    default:
      return {
        title: 'Prosegui la missione',
        steps: [
          'Continua con BUZZ per indizi',
          'Ogni dato conta per il quadro completo'
        ],
        reason: 'Default action',
        priority: 'low'
      };
  }
}

/**
 * PATCH v6.1: Timezone-aware + Streak-based NBA
 * Get predictive action based on time of day and user progress
 */
export function getPredictiveAction(ctx: NorahContext, userOffset = 0): NBAResult | null {
  // PATCH v6.1: Calculate user's local hour (UTC + offset from client)
  const nowUTC = new Date();
  const userHour = (nowUTC.getUTCHours() + userOffset + 24) % 24;
  const dayOfWeek = nowUTC.getDay(); // 0=Sunday, 6=Saturday

  const clues = ctx?.stats?.clues || 0;
  const buzzToday = ctx?.stats?.buzz_today || 0;
  // PATCH v6.1: streak_days may not exist yet, handle gracefully
  const streakDays = (ctx?.stats as any)?.streak_days || 0;

  // PATCH v6.1: Streak-based NBA (priority 0)
  if (streakDays >= 5 && buzzToday === 0) {
    return {
      title: `🔥 Streak di ${streakDays} giorni: Non romperlo!`,
      steps: [
        `Hai una serie di ${streakDays} giorni consecutivi`,
        'Fai almeno 1 BUZZ oggi per mantenerlo',
        'Ogni giorno conta per il tuo progresso'
      ],
      reason: 'High streak + no buzz today',
      priority: 'high'
    };
  }

  // Morning (8-11) + no BUZZ today
  if (userHour >= 8 && userHour < 11 && buzzToday === 0) {
    return {
      title: 'Mattina perfetta per BUZZ ☀️',
      steps: [
        'Inizia la giornata con un indizio fresco',
        'Apri BUZZ e prendi il primo dato',
        'Hai tutta la giornata per analizzarlo'
      ],
      reason: 'Morning + no buzz today',
      priority: 'high'
    };
  }

  // Evening (19-22) + good clue collection (5+)
  if (userHour >= 19 && userHour < 22 && clues >= 5) {
    return {
      title: 'Serata ideale per analisi 🌙',
      steps: [
        'Hai tempo per studiare gli indizi con calma',
        'Incrocia i dati, cerca pattern',
        'Usa BUZZ Map per visualizzare convergenze'
      ],
      reason: 'Evening + enough clues for analysis',
      priority: 'medium'
    };
  }

  // PATCH v6.1: Weekend competitive variant
  if ((dayOfWeek === 0 || dayOfWeek === 6) && buzzToday === 0 && clues < 8) {
    // Check if user is advanced (clues >= 4) for competitive variant
    if (clues >= 4) {
      return {
        title: 'Weekend: Momento competitivo 🏆',
        steps: [
          'Weekend = altri agenti attivi',
          'Fai 2-3 BUZZ per mantenere vantaggio',
          'Analizza indizi e avanza ipotesi'
        ],
        reason: 'Weekend + competitive mode',
        priority: 'medium'
      };
    }

    return {
      title: 'Weekend: momento perfetto 🎯',
      steps: [
        'Hai più tempo libero per M1SSION',
        'Fai 2-3 BUZZ e accumula dati',
        'Analizza con calma, senza fretta'
      ],
      reason: 'Weekend + low activity',
      priority: 'medium'
    };
  }

  return null;
}

/**
 * Get 3 alternative actions for UI pill suggestions
 */
export function getAlternatives(
  ctx: NorahContext,
  phase: NorahPhase
): Array<{ label: string; query: string }> {
  const clues = ctx?.stats?.clues || 0;

  const alternatives: Array<{ label: string; query: string }> = [];

  // Always include help
  alternatives.push({ label: 'Aiuto', query: 'aiuto' });

  // Phase-specific alternatives
  if (phase === 'onboarding' || phase === 'collecting') {
    alternatives.push({ label: 'Cos\'è BUZZ?', query: 'cos\'è buzz' });
    alternatives.push({ label: 'Come si gioca?', query: 'regole' });
  }

  if (phase === 'analyzing' || phase === 'hypothesis') {
    alternatives.push({ label: 'Cerca pattern', query: 'cerca pattern negli indizi' });
    alternatives.push({ label: 'Cos\'è BUZZ Map?', query: 'buzz map' });
  }

  if (phase === 'final_prep') {
    alternatives.push({ label: 'Final Shot', query: 'spiega final shot' });
    alternatives.push({ label: 'Verifica ipotesi', query: 'verifica convergenze' });
  }

  if (clues >= 4) {
    alternatives.push({ label: 'Analizza indizi', query: 'analizza i miei indizi' });
  }

  // Return max 3
  return alternatives.slice(0, 3);
}
