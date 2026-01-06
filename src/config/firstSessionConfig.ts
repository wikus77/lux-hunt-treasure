/**
 * FIRST SESSION CONFIGURATION
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * 🎚️ Feature flags per gestire l'esperienza del primo utilizzo
 * Tutti i flag sono disattivabili per rollback immediato
 */

// ═══════════════════════════════════════════════════════════════
// 🎚️ MASTER FLAGS - Toggle per funzionalità
// ═══════════════════════════════════════════════════════════════

/**
 * Se true, i nuovi utenti vengono portati alla MAP dopo il primo login
 * ROLLBACK: Metti a false per tornare alla Home
 */
export const MAP_FIRST_ENABLED = true;

/**
 * Se true, mostra l'HUD con la frase sulla mappa
 * ROLLBACK: Metti a false per nascondere
 */
export const MAP_HUD_ENABLED = true;

/**
 * Se true, attiva il sistema di micro-missioni
 * ROLLBACK: Metti a false per disattivare
 */
export const MICRO_MISSIONS_ENABLED = true;

/**
 * Se true, mostra il popup di aiuto Buzz dopo inattività
 * ROLLBACK: Metti a false per disattivare
 */
export const BUZZ_HELP_POPUP_ENABLED = true;

// ═══════════════════════════════════════════════════════════════
// ⏱️ TIMING CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export const TIMING = {
  /** Tempo dopo cui l'HUD sparisce automaticamente (ms) */
  HUD_AUTO_HIDE_MS: 15000, // 15 secondi
  
  /** Tempo di inattività prima di mostrare BuzzHelpPopup (ms) */
  BUZZ_HELP_INACTIVITY_MS: 25000, // 25 secondi
  
  /** Delay prima di mostrare la prima micro-mission dopo HUD (ms) */
  FIRST_MISSION_DELAY_MS: 500,
  
  /** Durata animazione completamento micro-mission (ms) */
  MISSION_COMPLETE_ANIMATION_MS: 2000,
};

// ═══════════════════════════════════════════════════════════════
// 📝 COPY/TESTI
// ═══════════════════════════════════════════════════════════════

export const COPY = {
  HUD: {
    line1: 'One real prize is hidden near you.',
    line2: 'Explore the map to get closer.',
    line3: 'Start exploring.',
  },
  BUZZ_HELP: {
    title: 'Need help?',
    body: 'Buzz reveals something nearby.',
    button: 'Open Buzz',
  },
};

// ═══════════════════════════════════════════════════════════════
// 🎯 MICRO-MISSIONS DATA
// ═══════════════════════════════════════════════════════════════

export type MicroMissionTrigger = 'map_pan' | 'map_zoom' | 'map_tap' | 'buzz_open' | 'nav_home' | 'home_tap';

export interface MicroMission {
  id: string;
  trigger: MicroMissionTrigger;
  icon: string;
  title: string;
  instruction: string;
  completeText: string;
  motivationText: string;
  /** CSS selector per evidenziare l'elemento coinvolto */
  highlightSelector?: string;
}

export const MICRO_MISSIONS: MicroMission[] = [
  {
    id: 'move',
    trigger: 'map_pan',
    icon: '🧭',
    title: 'MOVE THE MAP',
    instruction: 'Trascina la mappa per esplorare l\'area circostante. Scopri cosa si nasconde intorno a te.',
    completeText: '✅ Area esplorata',
    motivationText: 'Stai imparando a pensare come un cacciatore.',
  },
  {
    id: 'zoom',
    trigger: 'map_zoom',
    icon: '🔍',
    title: 'ZOOM IN',
    instruction: 'Fai zoom sulla mappa (pinch o rotella). Alcuni dettagli si vedono solo da vicino.',
    completeText: '✅ Focus aumentato',
    motivationText: 'I dettagli rivelano verità nascoste.',
  },
  {
    id: 'tap',
    trigger: 'map_tap',
    icon: '👆',
    title: 'TAP THE MAP',
    instruction: 'Tocca un punto qualsiasi della mappa per interagire con il mondo.',
    completeText: '✅ Connessione stabilita',
    motivationText: 'Ogni interazione conta.',
  },
  {
    id: 'buzz',
    trigger: 'buzz_open',
    icon: '⚡',
    title: 'DISCOVER BUZZ',
    instruction: 'Buzz ti aiuta a scoprire indizi nascosti nelle vicinanze. Premi il pulsante per provare.',
    completeText: '🎉 Hai scoperto Buzz!',
    motivationText: 'La conoscenza è potere.',
    highlightSelector: '[data-buzz-button]',
  },
  {
    id: 'return',
    trigger: 'nav_home',
    icon: '🏠',
    title: 'GO TO HOME',
    instruction: 'Vai alla Home per vedere il tuo centro di comando e tutte le informazioni sulla missione.',
    completeText: '✅ Base raggiunta',
    motivationText: 'La caccia continua.',
  },
  // === HOME PAGE DISCOVERY ===
  {
    id: 'home_cashback',
    trigger: 'home_tap',
    icon: '💰',
    title: 'DISCOVER CASHBACK',
    instruction: 'Qui trovi il tuo saldo M1U e i premi guadagnati. Tocca per continuare.',
    completeText: '✅ Cashback scoperto',
    motivationText: 'Ogni azione ti fa guadagnare.',
    highlightSelector: '[data-section="cashback"]',
  },
  {
    id: 'home_agent',
    trigger: 'home_tap',
    icon: '🕵️',
    title: 'M1SSION AGENT',
    instruction: 'Il tuo profilo agente con statistiche e progressi. Tocca per continuare.',
    completeText: '✅ Profilo agente trovato',
    motivationText: 'Conosci te stesso, conosci la missione.',
    highlightSelector: '[data-section="agent"]',
  },
  {
    id: 'home_clues',
    trigger: 'home_tap',
    icon: '🔍',
    title: 'CLUES FOUND',
    instruction: 'Qui trovi tutti gli indizi che hai scoperto finora. Tocca per continuare.',
    completeText: '✅ Tracker indizi trovato',
    motivationText: 'Ogni indizio ti avvicina al premio.',
    highlightSelector: '[data-section="clues"]',
  },
  {
    id: 'home_time',
    trigger: 'home_tap',
    icon: '⏱️',
    title: 'TIME REMAINING',
    instruction: 'Il conto alla rovescia della missione. Il tempo stringe! Tocca per continuare.',
    completeText: '✅ Timer trovato',
    motivationText: 'Il tempo è prezioso.',
    highlightSelector: '[data-section="time"]',
  },
  {
    id: 'home_status',
    trigger: 'home_tap',
    icon: '📊',
    title: 'MISSION STATUS',
    instruction: 'Lo stato attuale della tua missione e i progressi. Tocca per continuare.',
    completeText: '✅ Stato verificato',
    motivationText: 'Resta informato, resta avanti.',
    highlightSelector: '[data-section="status"]',
  },
  {
    id: 'home_battle',
    trigger: 'home_tap',
    icon: '⚔️',
    title: 'M1SSION BATTLE',
    instruction: 'Sfida altri agenti e scala la classifica! Tocca per completare la scoperta.',
    completeText: '🎉 SCOPERTA COMPLETATA!',
    motivationText: 'Sei pronto per la caccia!',
    highlightSelector: '[data-section="battle"]',
  },
];

// ═══════════════════════════════════════════════════════════════
// 🔧 UTILITIES - Helper functions
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  FIRST_SESSION_ACTIVE: 'm1_first_session_active',
  HUD_DISMISSED: 'm1_map_hud_dismissed',
  MISSION_INDEX: 'm1_micro_mission_index',
  MISSIONS_COMPLETED: 'm1_micro_missions_completed',
  BUZZ_HELP_SHOWN: 'm1_buzz_help_shown',
};

/** Controlla se questa è la prima sessione dell'utente */
export function isFirstSession(): boolean {
  try {
    return localStorage.getItem('m1_first_session_completed') !== 'true';
  } catch {
    return true;
  }
}

/** ✅ FIX 05/01/2026: Controlla se l'onboarding tutorial è completato (supporta chiavi user-specific) */
export function isOnboardingCompleted(): boolean {
  try {
    // Controlla chiave legacy (vecchio sistema)
    if (localStorage.getItem('m1ssion_onboarding_completed') === 'true' ||
        localStorage.getItem('m1ssion_onboarding_skipped') === 'true') {
      return true;
    }
    
    // Controlla chiavi user-specific (nuovo sistema)
    const keys = Object.keys(localStorage);
    const completedKeys = keys.filter(k => 
      k.startsWith('m1ssion_onboarding_completed_') || 
      k.startsWith('m1ssion_onboarding_skipped_')
    );
    
    return completedKeys.some(k => localStorage.getItem(k) === 'true');
  } catch {
    return false;
  }
}

/** Controlla se l'HUD è stato già dismissato */
export function isHudDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.HUD_DISMISSED) === 'true';
  } catch {
    return false;
  }
}

/** Segna l'HUD come dismissato */
export function dismissHud(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HUD_DISMISSED, 'true');
  } catch {}
}

/** Ottiene l'indice della micro-mission corrente */
export function getMissionIndex(): number {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEYS.MISSION_INDEX) || '0', 10);
  } catch {
    return 0;
  }
}

/** Avanza alla prossima micro-mission */
export function advanceMission(): number {
  try {
    const current = getMissionIndex();
    const next = current + 1;
    localStorage.setItem(STORAGE_KEYS.MISSION_INDEX, next.toString());
    
    // Se completate tutte, segna come fatto
    if (next >= MICRO_MISSIONS.length) {
      localStorage.setItem(STORAGE_KEYS.MISSIONS_COMPLETED, 'true');
    }
    
    return next;
  } catch {
    return 0;
  }
}

/** Controlla se tutte le micro-missions sono completate */
export function areMissionsCompleted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.MISSIONS_COMPLETED) === 'true';
  } catch {
    return false;
  }
}

/** Ottiene la micro-mission corrente (null se completate tutte) */
export function getCurrentMission(): MicroMission | null {
  if (areMissionsCompleted()) return null;
  const index = getMissionIndex();
  return MICRO_MISSIONS[index] || null;
}

/** Controlla se il BuzzHelp è già stato mostrato */
export function isBuzzHelpShown(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.BUZZ_HELP_SHOWN) === 'true';
  } catch {
    return false;
  }
}

/** Segna BuzzHelp come mostrato */
export function markBuzzHelpShown(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BUZZ_HELP_SHOWN, 'true');
  } catch {}
}

/** Reset completo (per testing) */
export function resetFirstSession(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('m1_first_session_completed');
    console.log('[FirstSession] 🔄 Reset completo');
  } catch {}
}

