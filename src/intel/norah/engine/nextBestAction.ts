// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Next Best Action Engine - Time-aware, streak-aware coaching

import type { NorahContext } from './contextBuilder';
import type { NorahPhase } from './dialogueManager';
import type { SentimentLabel } from './sentiment';
import type { NBASuggestion } from '@/components/intel/ai-analyst/NBAPills';

export interface NextBestActionResult {
  title: string;
  steps: string[];
  cta?: string;
}

/**
 * Compute NBA based on context, phase, sentiment, time, streak
 */
export function computeNBA(
  ctx: NorahContext,
  phase: NorahPhase,
  sentiment: SentimentLabel,
  serverUtc?: Date,
  userOffsetMin?: number
): NextBestActionResult {
  const clues = ctx?.stats?.clues || 0;
  const buzzToday = ctx?.stats?.buzz_today || 0;
  const streakDays = (ctx as any)?.agent?.streak_days || 0;

  // Time-aware: compute local hour
  const now = serverUtc || new Date();
  const offsetMs = (userOffsetMin || 0) * 60 * 1000;
  const localTime = new Date(now.getTime() + offsetMs);
  const localHour = localTime.getHours();

  // Morning (6-12): quick BUZZ
  if (localHour >= 6 && localHour < 12 && buzzToday === 0) {
    return {
      title: 'Azione Mattutina',
      steps: [
        'Apri BUZZ ora per il tuo indizio del giorno',
        'Ci vuole solo 1 minuto'
      ],
      cta: 'Vai su BUZZ'
    };
  }

  // Evening (18-23) with clues: pattern analysis
  if (localHour >= 18 && localHour < 23 && clues >= 5) {
    return {
      title: 'Analisi Serale',
      steps: [
        'Hai abbastanza indizi per cercare pattern',
        'Incrocia date, luoghi e orari ricorrenti'
      ],
      cta: 'Analizza pattern'
    };
  }

  // Streak maintenance: >= 3 days
  if (streakDays >= 3 && buzzToday === 0) {
    return {
      title: 'Mantieni la Striscia',
      steps: [
        `Sei a ${streakDays} giorni consecutivi!`,
        'Fai 1 BUZZ oggi per continuare lo streak'
      ],
      cta: 'Continua streak'
    };
  }

  // Phase-based NBA
  if (phase === 'collecting' && clues < 3) {
    return {
      title: 'Fase Raccolta',
      steps: [
        'Raccogli almeno 3 indizi per iniziare',
        'Usa BUZZ (gratuito) per ottenere segnali'
      ],
      cta: 'Apri BUZZ'
    };
  }

  if (phase === 'analyzing' && clues >= 3 && clues < 8) {
    return {
      title: 'Fase Analisi',
      steps: [
        'Hai abbastanza dati per pattern preliminari',
        'Cerca convergenze geografiche o temporali'
      ],
      cta: 'Analizza indizi'
    };
  }

  if ((phase === 'hypothesis' || phase === 'final_prep') && clues >= 8) {
    return {
      title: 'Fase Finale',
      steps: [
        'Sei pronto per Final Shot (max 2/giorno)',
        'Usa BUZZ Map per confermare l\'area'
      ],
      cta: 'Vai a Final Shot'
    };
  }

  // Sentiment-based fallback
  if (sentiment === 'rushed') {
    return {
      title: 'Azione Rapida',
      steps: [
        '30 secondi: 1 BUZZ, 1 indizio, fatto',
        'Domani continui con calma'
      ],
      cta: 'BUZZ rapido'
    };
  }

  if (sentiment === 'frustrated') {
    return {
      title: 'Ripartiamo',
      steps: [
        'Un passo alla volta: inizia con 1 indizio',
        'Poi torna qui e lo leggiamo insieme'
      ],
      cta: 'Reset & riparti'
    };
  }

  // Default
  return {
    title: 'Prossimo Passo',
    steps: [
      'Continua a raccogliere indizi con BUZZ',
      'Ogni segnale ti avvicina alla soluzione'
    ],
    cta: 'Vai su BUZZ'
  };
}

/**
 * Convert NBA to Pills suggestions (v6.8: alternative paths)
 */
export function nextBestActionToPills(ctx: NorahContext): NBASuggestion[] {
  const clues = ctx?.stats?.clues || 0;
  const buzzToday = ctx?.stats?.buzz_today || 0;

  if (buzzToday === 0) {
    return [
      { label: 'Apri BUZZ', payload: 'Voglio fare BUZZ' },
      { label: 'Mini-Quiz 30s', payload: 'Fammi un mini-quiz' },
      { label: 'Panoramica M1SSION', payload: 'Cos\'è M1SSION?' }
    ];
  }

  if (clues < 3) {
    return [
      { label: 'Fai altro BUZZ', payload: 'Voglio fare BUZZ' },
      { label: 'Pattern Drill', payload: 'Fammi un pattern drill' },
      { label: 'FAQ 60s', payload: 'FAQ rapida' }
    ];
  }

  if (clues >= 3 && clues < 8) {
    return [
      { label: 'Analizza pattern', payload: 'Cerca pattern negli indizi' },
      { label: 'BUZZ Map', payload: 'Come funziona BUZZ Map?' },
      { label: 'Mini-allenamento', payload: 'Fammi un mini-quiz' }
    ];
  }

  if (clues >= 8) {
    return [
      { label: 'Final Shot?', payload: 'Come funziona Final Shot?' },
      { label: 'BUZZ Map', payload: 'Apri BUZZ Map' },
      { label: 'Verifica indizi', payload: 'Riassumi i miei indizi' }
    ];
  }

  // Default
  return [
    { label: 'Come inizio?', payload: 'Come inizio?' },
    { label: 'Alternative BUZZ', payload: 'Se non voglio usare BUZZ?' },
    { label: 'FAQ rapida', payload: 'FAQ 60s' }
  ];
}

/**
 * v6.8: Get alternative actions to BUZZ
 */
export function getAlternativesToBuzz(): NBASuggestion[] {
  return [
    { label: 'Mini-Quiz 30s', payload: 'Fammi un mini-quiz' },
    { label: 'Pattern Drill', payload: 'Fammi un pattern drill' },
    { label: 'FAQ 60s', payload: 'FAQ rapida' }
  ];
}

/**
 * Predictive action (deprecated v6.2 - now using computeNBA)
 */
export function getPredictiveAction(ctx: NorahContext): NextBestActionResult | null {
  return computeNBA(ctx, 'collecting', 'neutral');
}
