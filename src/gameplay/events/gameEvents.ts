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

type TranslateFn = (key: string, params?: Record<string, unknown>) => string;

export const getEventCopy = (event: GameEvent, t?: TranslateFn): EventCopy => {
  const { type, payload } = event;
  const tr = (key: string, params?: Record<string, unknown>, fallback?: string) =>
    (t ? t(key, params) : (fallback ?? key));

  switch (type) {
    case 'BUZZ_SUCCESS':
      return {
        title: tr('game_buzz_success_title'),
        effect: tr('game_buzz_success_effect'),
        nextStep: tr('game_buzz_success_next'),
        icon: '🎰',
      };
    
    case 'BUZZ_INSUFFICIENT_M1U':
      return {
        title: tr('game_buzz_insufficient_title', undefined, '⚠️ M1U INSUFFICIENTI'),
        effect: tr('game_buzz_insufficient_effect', { required: payload.required || 0 }, `Servono ${payload.required || 0} M1U per il BUZZ`),
        nextStep: tr('game_buzz_insufficient_next', undefined, 'Ottieni M1U dalla mappa o acquistali'),
        cta: { label: tr('game_buzz_insufficient_cta', undefined, 'OTTIENI M1U'), path: '/map-3d-tiler' },
        icon: '💰',
      };
    
    case 'BUZZ_MAP_AREA_CREATED':
      return {
        title: tr('game_buzz_map_area_title', undefined, '🗺️ AREA SBLOCCATA!'),
        effect: tr('game_buzz_map_area_effect', { radius: payload.radius || 0 }, `Nuova area di ${payload.radius || 0}km esplorata`),
        nextStep: tr('game_buzz_map_area_next', undefined, 'Cerca i marker per trovare indizi'),
        cta: { label: tr('game_cta_explore', undefined, 'ESPLORA'), path: '/map-3d-tiler' },
        icon: '🗺️',
      };
    case 'BUZZ_MAP_CLUE_FOUND':
      return {
        title: tr('game_buzz_map_clue_title', undefined, '🔍 INDIZIO TROVATO!'),
        effect: payload.clueText || tr('game_buzz_map_clue_effect_default', undefined, 'Nuovo indizio aggiunto alla tua collezione'),
        nextStep: tr('game_buzz_map_clue_next', undefined, 'Analizza gli indizi per avvicinarti al premio'),
        cta: { label: tr('game_cta_see_clues', undefined, 'VEDI INDIZI'), path: '/intelligence' },
        icon: '🔍',
      };
    
    case 'AION_ANALYSIS_COMPLETE':
      return {
        title: tr('game_aion_title', undefined, '🤖 ANALISI COMPLETATA'),
        effect: tr('game_aion_effect', undefined, 'AION ha elaborato i tuoi dati'),
        nextStep: tr('game_aion_next', undefined, 'Leggi l\'analisi per nuovi suggerimenti'),
        icon: '🤖',
      };
    
    case 'BATTLE_WIN':
      return {
        title: tr('game_battle_win_title', undefined, '🏆 VITTORIA!'),
        effect: tr('game_battle_win_effect', { reward: payload.reward || '+5%', rewardType: payload.rewardType || 'M1U' }, `Hai guadagnato ${payload.reward || '+5%'} ${payload.rewardType || 'M1U'}`),
        nextStep: tr('game_battle_win_next', undefined, 'Sfida altri agenti per salire in classifica'),
        cta: { label: tr('game_cta_new_challenge', undefined, 'NUOVA SFIDA'), path: '/home' },
        icon: '🏆',
      };
    case 'BATTLE_LOSE':
      return {
        title: tr('game_battle_lose_title', undefined, '💪 SCONFITTO'),
        effect: tr('game_battle_lose_effect', undefined, 'Non arrenderti! Ogni battaglia ti rende più forte'),
        nextStep: tr('game_battle_lose_next', undefined, 'Riprova con una nuova strategia'),
        cta: { label: tr('game_cta_retry', undefined, 'RITENTA'), path: '/home' },
        icon: '💪',
      };
    
    case 'PULSE_BREAKER_CASHOUT':
      return {
        title: tr('game_pulse_cashout_title', undefined, '💎 CASHOUT PERFETTO!'),
        effect: tr('game_pulse_cashout_effect', { payout: payload.payout || 0, currency: payload.currency || 'M1U', multiplier: payload.multiplier || '1.00' }, `Hai ottenuto ${payload.payout || 0} ${payload.currency || 'M1U'} a ${payload.multiplier || '1.00'}x`),
        nextStep: tr('game_pulse_cashout_next', undefined, 'Usa i tuoi crediti per più BUZZ'),
        cta: { label: tr('game_cta_do_buzz', undefined, 'FAI BUZZ'), path: '/buzz' },
        icon: '💎',
      };
    case 'PULSE_BREAKER_CRASH':
      return {
        title: tr('game_pulse_crash_title', undefined, '💥 CRASH!'),
        effect: tr('game_pulse_crash_effect', { crashPoint: payload.crashPoint || '0.00' }, `Il moltiplicatore è esploso a ${payload.crashPoint || '0.00'}x`),
        nextStep: tr('game_battle_lose_next', undefined, 'Riprova con una nuova strategia'),
        icon: '💥',
      };
    
    case 'MILESTONE_REACHED':
      return {
        title: tr('game_milestone_title', { title: payload.title || 'MILESTONE' }, `🎖️ ${payload.title || 'MILESTONE'}`),
        effect: tr('game_milestone_effect', { threshold: payload.threshold || 0, m1u: payload.m1u || 0, pe: payload.pe || 0 }, `Hai raggiunto ${payload.threshold || 0} indizi! +${payload.m1u || 0} M1U +${payload.pe || 0} PE`),
        nextStep: tr('game_milestone_next', { nextThreshold: payload.nextThreshold || 'MAX' }, `Prossimo obiettivo: ${payload.nextThreshold || 'MAX'} indizi`),
        cta: { label: tr('game_cta_continue', undefined, 'CONTINUA'), path: '/map-3d-tiler' },
        icon: '🎖️',
      };
    case 'LEVEL_UP':
      return {
        title: tr('game_level_up_title', undefined, '⬆️ LEVEL UP!'),
        effect: tr('game_level_up_effect', { level: payload.newLevel || 1, title: payload.title || 'AGENT' }, `Sei salito al Livello ${payload.newLevel || 1}: ${payload.title || 'AGENT'}`),
        nextStep: tr('game_level_up_next', undefined, 'Continua a raccogliere indizi'),
        cta: { label: tr('game_cta_go_map', undefined, 'VAI ALLA MAPPA'), path: '/map-3d-tiler' },
        icon: '⬆️',
      };
    case 'RANK_UP':
      return {
        title: tr('game_rank_up_title', undefined, '🌟 RANK UP!'),
        effect: tr('game_rank_up_effect', { rank: payload.rankName || 'ELITE' }, `Nuovo grado: ${payload.rankName || 'ELITE'}`),
        nextStep: tr('game_rank_up_next', undefined, 'Mostra il tuo nuovo grado in classifica'),
        cta: { label: tr('game_cta_leaderboard', undefined, 'CLASSIFICA'), path: '/leaderboard' },
        icon: '🌟',
      };
    case 'M1U_CREDITED':
      return {
        title: tr('game_m1u_title', undefined, '💰 M1U RICEVUTI'),
        effect: tr('game_m1u_effect', { amount: payload.amount || 0 }, `+${payload.amount || 0} M1U aggiunti al tuo saldo`),
        nextStep: tr('game_m1u_next', undefined, 'Usa i M1U per fare BUZZ'),
        icon: '💰',
      };
    case 'PE_GAINED':
      return {
        title: tr('game_pe_title', undefined, '⚡ ENERGIA GUADAGNATA'),
        effect: tr('game_pe_effect', { amount: payload.amount || 0 }, `+${payload.amount || 0} Pulse Energy`),
        nextStep: tr('game_pe_next', undefined, 'Più PE = rank più alto'),
        icon: '⚡',
      };
    
    case 'CASHBACK_ACCRUED':
      return {
        title: tr('game_cashback_title', undefined, '🏦 CASHBACK ACCUMULATO'),
        effect: tr('game_cashback_effect', { amount: (payload.amount || 0).toFixed(2) }, `+€${(payload.amount || 0).toFixed(2)} nel tuo Vault`),
        nextStep: tr('game_cashback_next', undefined, 'Sblocca il cashback con più indizi'),
        icon: '🏦',
      };
    
    case 'MARKER_REWARD_CLAIMED':
      return {
        title: tr('game_marker_title', undefined, '🎁 PREMIO RISCATTATO!'),
        effect: payload.rewardText || tr('game_marker_effect_default', undefined, 'Hai ottenuto una ricompensa speciale'),
        nextStep: tr('game_marker_next', undefined, 'Cerca altri marker sulla mappa'),
        cta: { label: tr('game_cta_search_more', undefined, 'CERCA ALTRI'), path: '/map-3d-tiler' },
        icon: '🎁',
      };
    case 'LEADERBOARD_POSITION_UP':
      return {
        title: tr('game_leaderboard_up_title', undefined, '📈 SEI SALITO!'),
        effect: tr('game_leaderboard_up_effect', { positions: payload.positions || 1 }, `+${payload.positions || 1} posizioni in classifica`),
        nextStep: tr('game_leaderboard_up_next', undefined, 'Continua così per entrare nella TOP 10'),
        icon: '📈',
      };
    case 'LEADERBOARD_POSITION_DOWN':
      return {
        title: tr('game_leaderboard_down_title', undefined, '📉 POSIZIONE PERSA'),
        effect: tr('game_leaderboard_down_effect', { positions: payload.positions || 1 }, `${payload.positions || 1} posizioni perse`),
        nextStep: tr('game_leaderboard_down_next', undefined, 'Fai più BUZZ per recuperare'),
        cta: { label: tr('game_cta_do_buzz', undefined, 'FAI BUZZ'), path: '/buzz' },
        icon: '📉',
      };
    default:
      return {
        title: tr('game_default_title', undefined, '✅ AZIONE COMPLETATA'),
        effect: tr('game_default_effect', undefined, 'Hai fatto progressi!'),
        nextStep: tr('game_default_next', undefined, 'Continua a esplorare'),
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

