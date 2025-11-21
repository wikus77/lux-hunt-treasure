// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// NORAH Dialogue Manager v5 - State machine for conversational flow

import type { NorahContext } from './contextBuilder';
import type { NorahIntent } from './intentRouter';

export type NorahPhase = 
  | 'onboarding'      // 0 clues, new user, needs intro
  | 'collecting'      // 1-3 clues, active collection phase
  | 'analyzing'       // 4-7 clues, enough data for pattern analysis
  | 'hypothesis'      // 8+ clues, ready for hypothesis formation
  | 'final_prep';     // Preparing Final Shot, 2 max per day

export interface DMState {
  phase: NorahPhase;
  reason: string;
  suggested_action: string;
}

/**
 * Derive current dialogue phase from context and user input
 */
export function getPhase(
  ctx: NorahContext,
  lastUserMsg: string,
  intents: NorahIntent[]
): NorahPhase {
  const clues = ctx?.stats?.clues || 0;
  const finalshotToday = ctx?.stats?.finalshot_today || 0;
  const lowerMsg = (lastUserMsg || '').toLowerCase();

  // Priority 1: If user explicitly asks about Final Shot and has enough clues
  if (clues >= 8 && intents.includes('about_finalshot')) {
    console.log('[DM] Phase: final_prep (explicit finalshot query, clues >= 8)');
    return 'final_prep';
  }

  // Priority 2: If user reached Final Shot limit today
  if (finalshotToday >= 2) {
    console.log('[DM] Phase: final_prep (max finalshot reached)');
    return 'final_prep';
  }

  // Standard progression based on clues
  if (clues === 0) {
    console.log('[DM] Phase: onboarding (no clues)');
    return 'onboarding';
  }

  if (clues >= 1 && clues <= 3) {
    console.log('[DM] Phase: collecting (1-3 clues)');
    return 'collecting';
  }

  if (clues >= 4 && clues <= 7) {
    console.log('[DM] Phase: analyzing (4-7 clues)');
    return 'analyzing';
  }

  if (clues >= 8) {
    // Check if user mentions pattern/decode/hypothesis keywords
    const analysisKeywords = ['pattern', 'analiz', 'correla', 'ipotesi', 'convergenza'];
    const hasAnalysisIntent = analysisKeywords.some(kw => lowerMsg.includes(kw));
    
    if (hasAnalysisIntent) {
      console.log('[DM] Phase: hypothesis (analysis keywords detected)');
      return 'hypothesis';
    }

    // Default to hypothesis for 8+ clues
    console.log('[DM] Phase: hypothesis (8+ clues, hypothesis formation)');
    return 'hypothesis';
  }

  // Fallback
  console.log('[DM] Phase: collecting (fallback)');
  return 'collecting';
}

/**
 * Determine next best action based on phase and context
 */
export function nextBestAction(
  ctx: NorahContext,
  phase: NorahPhase,
  sentimentLabel?: string
): { title: string; steps: string[] } {
  const clues = ctx?.stats?.clues || 0;
  const buzzToday = ctx?.stats?.buzz_today || 0;
  const finalshotToday = ctx?.stats?.finalshot_today || 0;

  // If user is frustrated or rushed, simplify action
  if (sentimentLabel === 'frustrated' || sentimentLabel === 'rushed') {
    return {
      title: 'Azione rapida (30 secondi)',
      steps: [
        'Apri BUZZ',
        'Prendi 1 solo indizio',
        'Chiudi e torna più tardi'
      ]
    };
  }

  // If user is confused, provide clarity
  if (sentimentLabel === 'confused') {
    return {
      title: 'Passo base di orientamento',
      steps: [
        'BUZZ ti dà 1 indizio alla volta',
        'Raccogli almeno 3-4 indizi prima',
        'Poi torna qui per analizzarli insieme'
      ]
    };
  }

  // Phase-specific NBA
  switch (phase) {
    case 'onboarding':
      return {
        title: 'Primo passo: Inizia con BUZZ',
        steps: [
          'Apri BUZZ dalla tab in basso',
          'Raccogli 2-3 indizi oggi',
          'Ogni indizio è un pezzo del puzzle',
          'Poi torna qui per analisi iniziale'
        ]
      };

    case 'collecting':
      return {
        title: 'Continua la raccolta',
        steps: [
          `Hai ${clues} indizi, ne servono 4-5 per pattern`,
          'Fai altri 2-3 BUZZ oggi',
          'Target: 5-6 indizi totali',
          'Poi analizziamo pattern insieme'
        ]
      };

    case 'analyzing':
      return {
        title: 'Analisi pattern',
        steps: [
          `Con ${clues} indizi possiamo cercare pattern`,
          'Apri BUZZ Map per vedere l\'area',
          'Cerca sovrapposizioni e ripetizioni',
          'Confronta toponimi e coordinate',
          'Fai ancora 1-2 BUZZ se serve più chiarezza'
        ]
      };

    case 'hypothesis':
      return {
        title: 'Formazione ipotesi',
        steps: [
          `${clues} indizi sono una buona base`,
          'Incrocia tutti i dati: luoghi, nomi, riferimenti',
          'Verifica convergenze geografiche con BUZZ Map',
          'Cerca pattern semantici e temporali',
          'Quando sei sicuro, considera Final Shot (max 2/giorno)'
        ]
      };

    case 'final_prep':
      if (finalshotToday >= 2) {
        return {
          title: 'Limite Final Shot raggiunto',
          steps: [
            'Hai già usato i 2 Final Shot di oggi',
            'Rivedi i dati raccolti',
            'Raffina l\'ipotesi per domani',
            'Continua con BUZZ per più sicurezza'
          ]
        };
      }
      return {
        title: 'Preparazione Final Shot',
        steps: [
          'Ricapitola tutti gli indizi',
          'Verifica coerenza interna',
          'Controlla convergenze su BUZZ Map',
          'Quando sei sicuro al 90%, prova Final Shot',
          `Hai ${2 - finalshotToday} tentativi rimasti oggi`
        ]
      };

    default:
      return {
        title: 'Prossimo passo',
        steps: ['Fai BUZZ per raccogliere indizi', 'Poi torna per analisi']
      };
  }
}

/**
 * Render coach-friendly contextual prefix for the phase
 */
export function getPhaseContext(phase: NorahPhase, ctx: NorahContext): string {
  const agentName = ctx?.agent?.username || ctx?.agent?.code || 'Agente';
  const clues = ctx?.stats?.clues || 0;

  switch (phase) {
    case 'onboarding':
      return `${agentName}, sei all'inizio. Nessun indizio ancora.`;
    
    case 'collecting':
      return `${agentName}, stai raccogliendo dati. Continua così!`;
    
    case 'analyzing':
      return `${agentName}, hai ${clues} indizi. Fase di analisi.`;
    
    case 'hypothesis':
      return `${agentName}, ${clues} indizi. Fase ipotesi avanzata.`;
    
    case 'final_prep':
      return `${agentName}, sei nella fase finale. Preparati per il colpo decisivo.`;
    
    default:
      return `${agentName}, continua la missione.`;
  }
}
