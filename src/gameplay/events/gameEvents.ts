/**
 * M1SSION™ Game Events System
 * Central event types and emit function for progress feedback
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

// ═══════════════════════════════════════════════════════════════════════════
// EVENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type GameEventType =
  // BUZZ Events
  | 'BUZZ_SUCCESS'
  | 'BUZZ_FAIL'
  | 'BUZZ_INSUFFICIENT_M1U'
  // BUZZ MAP Events
  | 'BUZZ_MAP_AREA_CREATED'
  | 'BUZZ_MAP_CLUE_FOUND'
  // AION Events
  | 'AION_ANALYSIS_COMPLETE'
  // Battle Events
  | 'BATTLE_WIN'
  | 'BATTLE_LOSE'
  // Pulse Breaker Events
  | 'PULSE_BREAKER_CASHOUT'
  | 'PULSE_BREAKER_CRASH'
  // Milestone Events
  | 'MILESTONE_REACHED'
  | 'LEVEL_UP'
  | 'RANK_UP'
  // Reward Events
  | 'M1U_CREDITED'
  | 'PE_GAINED'
  | 'CASHBACK_ACCRUED'
  | 'MARKER_REWARD_CLAIMED'
  // Leaderboard Events
  | 'LEADERBOARD_POSITION_UP'
  | 'LEADERBOARD_POSITION_DOWN';

export type EventPriority = 'major' | 'minor';

export interface GameEvent {
  id: string;
  type: GameEventType;
  payload: Record<string, any>;
  priority: EventPriority;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT PRIORITY MAPPING
// ═══════════════════════════════════════════════════════════════════════════

const EVENT_PRIORITY_MAP: Record<GameEventType, EventPriority> = {
  // Minor events (toast)
  BUZZ_SUCCESS: 'minor',
  BUZZ_FAIL: 'minor',
  BUZZ_INSUFFICIENT_M1U: 'minor',
  BUZZ_MAP_AREA_CREATED: 'minor',
  M1U_CREDITED: 'minor',
  PE_GAINED: 'minor',
  CASHBACK_ACCRUED: 'minor',
  LEADERBOARD_POSITION_UP: 'minor',
  LEADERBOARD_POSITION_DOWN: 'minor',
  
  // Major events (modal)
  BUZZ_MAP_CLUE_FOUND: 'major',
  AION_ANALYSIS_COMPLETE: 'major',
  BATTLE_WIN: 'major',
  BATTLE_LOSE: 'major',
  PULSE_BREAKER_CASHOUT: 'major',
  PULSE_BREAKER_CRASH: 'major',
  MILESTONE_REACHED: 'major',
  LEVEL_UP: 'major',
  RANK_UP: 'major',
  MARKER_REWARD_CLAIMED: 'major',
};

// ═══════════════════════════════════════════════════════════════════════════
// EVENT COPY TEMPLATES (AAA Clarity)
// ═══════════════════════════════════════════════════════════════════════════

export interface EventCopy {
  title: string;
  effect: string;
  nextStep: string;
  cta?: { label: string; path: string };
  icon: string;
}

export const getEventCopy = (event: GameEvent): EventCopy => {
  const { type, payload } = event;
  
  switch (type) {
    case 'BUZZ_SUCCESS':
      return {
        title: '✅ BUZZ COMPLETATO!',
        effect: `Hai ottenuto un nuovo indizio`,
        nextStep: 'Continua a esplorare per trovarne altri',
        icon: '🎰',
      };
    
    case 'BUZZ_INSUFFICIENT_M1U':
      return {
        title: '⚠️ M1U INSUFFICIENTI',
        effect: `Servono ${payload.required || 0} M1U per il BUZZ`,
        nextStep: 'Ottieni M1U dalla mappa o acquistali',
        cta: { label: 'OTTIENI M1U', path: '/map-3d-tiler' },
        icon: '💰',
      };
    
    case 'BUZZ_MAP_AREA_CREATED':
      return {
        title: '🗺️ AREA SBLOCCATA!',
        effect: `Nuova area di ${payload.radius || 0}km esplorata`,
        nextStep: 'Cerca i marker per trovare indizi',
        cta: { label: 'ESPLORA', path: '/map-3d-tiler' },
        icon: '🗺️',
      };
    
    case 'BUZZ_MAP_CLUE_FOUND':
      return {
        title: '🔍 INDIZIO TROVATO!',
        effect: payload.clueText || 'Nuovo indizio aggiunto alla tua collezione',
        nextStep: 'Analizza gli indizi per avvicinarti al premio',
        cta: { label: 'VEDI INDIZI', path: '/intelligence' },
        icon: '🔍',
      };
    
    case 'AION_ANALYSIS_COMPLETE':
      return {
        title: '🤖 ANALISI COMPLETATA',
        effect: 'AION ha elaborato i tuoi dati',
        nextStep: 'Leggi l\'analisi per nuovi suggerimenti',
        icon: '🤖',
      };
    
    case 'BATTLE_WIN':
      return {
        title: '🏆 VITTORIA!',
        effect: `Hai guadagnato ${payload.reward || '+5%'} ${payload.rewardType || 'M1U'}`,
        nextStep: 'Sfida altri agenti per salire in classifica',
        cta: { label: 'NUOVA SFIDA', path: '/home' },
        icon: '🏆',
      };
    
    case 'BATTLE_LOSE':
      return {
        title: '💪 SCONFITTO',
        effect: 'Non arrenderti! Ogni battaglia ti rende più forte',
        nextStep: 'Riprova con una nuova strategia',
        cta: { label: 'RITENTA', path: '/home' },
        icon: '💪',
      };
    
    case 'PULSE_BREAKER_CASHOUT':
      return {
        title: '💎 CASHOUT PERFETTO!',
        effect: `Hai vinto ${payload.payout || 0} ${payload.currency || 'M1U'} a ${payload.multiplier || '1.00'}x`,
        nextStep: 'Usa le tue vincite per più BUZZ',
        cta: { label: 'FAI BUZZ', path: '/buzz' },
        icon: '💎',
      };
    
    case 'PULSE_BREAKER_CRASH':
      return {
        title: '💥 CRASH!',
        effect: `Il moltiplicatore è esploso a ${payload.crashPoint || '0.00'}x`,
        nextStep: 'Riprova con una nuova strategia',
        icon: '💥',
      };
    
    case 'MILESTONE_REACHED':
      return {
        title: `🎖️ ${payload.title || 'MILESTONE'}`,
        effect: `Hai raggiunto ${payload.threshold || 0} indizi! +${payload.m1u || 0} M1U +${payload.pe || 0} PE`,
        nextStep: `Prossimo obiettivo: ${payload.nextThreshold || 'MAX'} indizi`,
        cta: { label: 'CONTINUA', path: '/map-3d-tiler' },
        icon: '🎖️',
      };
    
    case 'LEVEL_UP':
      return {
        title: '⬆️ LEVEL UP!',
        effect: `Sei salito al Livello ${payload.newLevel || 1}: ${payload.title || 'AGENT'}`,
        nextStep: 'Continua a raccogliere indizi',
        cta: { label: 'VAI ALLA MAPPA', path: '/map-3d-tiler' },
        icon: '⬆️',
      };
    
    case 'RANK_UP':
      return {
        title: '🌟 RANK UP!',
        effect: `Nuovo grado: ${payload.rankName || 'ELITE'}`,
        nextStep: 'Mostra il tuo nuovo grado in classifica',
        cta: { label: 'CLASSIFICA', path: '/leaderboard' },
        icon: '🌟',
      };
    
    case 'M1U_CREDITED':
      return {
        title: '💰 M1U RICEVUTI',
        effect: `+${payload.amount || 0} M1U aggiunti al tuo saldo`,
        nextStep: 'Usa i M1U per fare BUZZ',
        icon: '💰',
      };
    
    case 'PE_GAINED':
      return {
        title: '⚡ ENERGIA GUADAGNATA',
        effect: `+${payload.amount || 0} Pulse Energy`,
        nextStep: 'Più PE = rank più alto',
        icon: '⚡',
      };
    
    case 'CASHBACK_ACCRUED':
      return {
        title: '🏦 CASHBACK ACCUMULATO',
        effect: `+€${(payload.amount || 0).toFixed(2)} nel tuo Vault`,
        nextStep: 'Sblocca il cashback con più indizi',
        icon: '🏦',
      };
    
    case 'MARKER_REWARD_CLAIMED':
      return {
        title: '🎁 PREMIO RISCATTATO!',
        effect: payload.rewardText || 'Hai ottenuto una ricompensa speciale',
        nextStep: 'Cerca altri marker sulla mappa',
        cta: { label: 'CERCA ALTRI', path: '/map-3d-tiler' },
        icon: '🎁',
      };
    
    case 'LEADERBOARD_POSITION_UP':
      return {
        title: '📈 SEI SALITO!',
        effect: `+${payload.positions || 1} posizioni in classifica`,
        nextStep: 'Continua così per entrare nella TOP 10',
        icon: '📈',
      };
    
    case 'LEADERBOARD_POSITION_DOWN':
      return {
        title: '📉 POSIZIONE PERSA',
        effect: `${payload.positions || 1} posizioni perse`,
        nextStep: 'Fai più BUZZ per recuperare',
        cta: { label: 'FAI BUZZ', path: '/buzz' },
        icon: '📉',
      };
    
    default:
      return {
        title: '✅ AZIONE COMPLETATA',
        effect: 'Hai fatto progressi!',
        nextStep: 'Continua a esplorare',
        icon: '✅',
      };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// EMIT FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

let eventCounter = 0;

/**
 * Emit a game event to the Progress Feedback System
 * This is the ONLY entry point for triggering celebrations
 */
export function emitGameEvent(
  type: GameEventType,
  payload: Record<string, any> = {}
): void {
  const event: GameEvent = {
    id: `evt_${Date.now()}_${++eventCounter}`,
    type,
    payload,
    priority: EVENT_PRIORITY_MAP[type] || 'minor',
    timestamp: Date.now(),
  };
  
  // Dispatch custom event for the queue to catch
  if (typeof window !== 'undefined') {
    console.log(`[GameEvents] 📤 Emitting: ${type}`, payload);
    window.dispatchEvent(new CustomEvent('m1ssion:game-event', { detail: event }));
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

