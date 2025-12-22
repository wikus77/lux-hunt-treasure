/**
 * FIRST SESSION FLAGS
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Feature flags per gestire l'esperienza del primo utilizzo
 * Permette rollback immediato cambiando i flag
 */

// ═══════════════════════════════════════════════════════════════
// 🎚️ MASTER FLAGS - Toggle per funzionalità
// ═══════════════════════════════════════════════════════════════

/**
 * Se true, i nuovi utenti saltano /choose-plan e vanno direttamente a /home
 * ROLLBACK: Metti a false per tornare al comportamento precedente
 */
export const SKIP_CHOOSE_PLAN_FOR_NEW_USERS = true;

/**
 * Se true, i nuovi utenti vengono portati alla MAP dopo il primo login
 * invece della Home dashboard
 * ROLLBACK: Metti a false per tornare alla Home
 */
export const MAP_FIRST_FOR_NEW_USERS = true;

/**
 * Se true, disabilita i popup a timer (RewardZone, PulseBreaker) 
 * durante la prima sessione
 * ROLLBACK: Metti a false per riattivare i popup
 */
export const DISABLE_TIMED_POPUPS_FIRST_SESSION = true;

/**
 * Se true, usa onboarding ridotto (3 step invece di 12)
 * ROLLBACK: Metti a false per onboarding completo
 */
export const ONBOARDING_LITE_MODE = true;

/**
 * Durata splash screen in millisecondi
 * ROLLBACK: Cambia a 5000 per tornare ai 5 secondi
 */
export const SPLASH_DURATION_MS = 3000;

// ═══════════════════════════════════════════════════════════════
// 🔧 UTILITIES - Helper functions per gestire lo stato
// ═══════════════════════════════════════════════════════════════

const FIRST_SESSION_KEY = 'm1_first_session_active';
const FIRST_SESSION_COMPLETED_KEY = 'm1_first_session_completed';

/**
 * Controlla se questa è la prima sessione dell'utente
 */
export function isFirstSession(): boolean {
  try {
    // Se già completata, non è prima sessione
    if (localStorage.getItem(FIRST_SESSION_COMPLETED_KEY) === 'true') {
      return false;
    }
    // Se non c'è il flag attivo, è prima sessione
    if (!localStorage.getItem(FIRST_SESSION_KEY)) {
      return true;
    }
    return localStorage.getItem(FIRST_SESSION_KEY) === 'true';
  } catch {
    return true; // Fail-safe: assume first session
  }
}

/**
 * Segna l'inizio della prima sessione
 */
export function startFirstSession(): void {
  try {
    localStorage.setItem(FIRST_SESSION_KEY, 'true');
    console.log('[FirstSession] 🚀 Prima sessione iniziata');
  } catch (e) {
    console.warn('[FirstSession] Impossibile salvare stato:', e);
  }
}

/**
 * Segna la fine della prima sessione (dopo azione significativa)
 * Es: dopo aver visitato la mappa, dopo primo BUZZ, etc.
 */
export function completeFirstSession(): void {
  try {
    localStorage.setItem(FIRST_SESSION_COMPLETED_KEY, 'true');
    localStorage.removeItem(FIRST_SESSION_KEY);
    console.log('[FirstSession] ✅ Prima sessione completata');
  } catch (e) {
    console.warn('[FirstSession] Impossibile salvare completamento:', e);
  }
}

/**
 * Reset dello stato prima sessione (per testing)
 */
export function resetFirstSession(): void {
  try {
    localStorage.removeItem(FIRST_SESSION_KEY);
    localStorage.removeItem(FIRST_SESSION_COMPLETED_KEY);
    console.log('[FirstSession] 🔄 Stato resettato');
  } catch (e) {
    console.warn('[FirstSession] Impossibile resettare:', e);
  }
}

/**
 * Controlla se i popup a timer devono essere mostrati
 */
export function shouldShowTimedPopups(): boolean {
  if (DISABLE_TIMED_POPUPS_FIRST_SESSION && isFirstSession()) {
    console.log('[FirstSession] ⏸️ Popup a timer disabilitati per prima sessione');
    return false;
  }
  return true;
}

