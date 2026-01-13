/**
 * M1SSION™ MediaSession Blocker
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * PROBLEMA:
 * Su iOS, la Dynamic Island si attiva automaticamente quando:
 * - Un video con audio viene riprodotto
 * - Un audio viene riprodotto
 * - Il MediaSession ha metadata attivo
 * 
 * SOLUZIONE:
 * Blocca COMPLETAMENTE il MediaSession per tutta l'app.
 * Lo attiva SOLO quando AION parla (gestito da useAionDynamicIsland).
 */

let isBlocked = true; // Di default BLOCCATO
let originalMediaSession: MediaSession | null = null;

/**
 * Inizializza il blocker del MediaSession
 * Deve essere chiamato all'avvio dell'app
 */
export function initMediaSessionBlocker(): void {
  if (typeof window === 'undefined' || !('mediaSession' in navigator)) {
    return;
  }

  // Salva il MediaSession originale
  originalMediaSession = navigator.mediaSession;

  // Resetta immediatamente
  resetMediaSession();

  // Intercetta tutti i tentativi di impostare metadata
  const originalMetadataSetter = Object.getOwnPropertyDescriptor(
    MediaSession.prototype,
    'metadata'
  )?.set;

  if (originalMetadataSetter) {
    Object.defineProperty(navigator.mediaSession, 'metadata', {
      set: function(value) {
        // Se bloccato, ignora tutti i tentativi di impostare metadata
        if (isBlocked) {
          console.debug('[MediaSessionBlocker] 🚫 Blocked metadata set attempt');
          return;
        }
        // Se sbloccato (AION sta parlando), permetti
        originalMetadataSetter.call(this, value);
      },
      get: function() {
        return originalMetadataSetter ? null : null;
      },
      configurable: true
    });
  }

  // Intercetta playbackState
  const originalPlaybackStateSetter = Object.getOwnPropertyDescriptor(
    MediaSession.prototype,
    'playbackState'
  )?.set;

  if (originalPlaybackStateSetter) {
    Object.defineProperty(navigator.mediaSession, 'playbackState', {
      set: function(value) {
        if (isBlocked) {
          // Forza sempre 'none' quando bloccato
          originalPlaybackStateSetter.call(this, 'none');
          return;
        }
        originalPlaybackStateSetter.call(this, value);
      },
      get: function() {
        return isBlocked ? 'none' : 'playing';
      },
      configurable: true
    });
  }

  console.log('[MediaSessionBlocker] ✅ Initialized - Dynamic Island BLOCKED by default');
}

/**
 * Resetta completamente il MediaSession
 */
export function resetMediaSession(): void {
  if (typeof window === 'undefined' || !('mediaSession' in navigator)) {
    return;
  }

  try {
    // Rimuovi metadata
    navigator.mediaSession.metadata = null;
    
    // Imposta playbackState a 'none'
    navigator.mediaSession.playbackState = 'none';
    
    // Rimuovi tutti gli action handlers
    const actions: MediaSessionAction[] = [
      'play', 'pause', 'stop', 'seekbackward', 'seekforward',
      'seekto', 'previoustrack', 'nexttrack'
    ];
    
    actions.forEach(action => {
      try {
        navigator.mediaSession.setActionHandler(action, null);
      } catch (e) {
        // Ignora errori per azioni non supportate
      }
    });
    
  } catch (e) {
    console.warn('[MediaSessionBlocker] Reset failed:', e);
  }
}

/**
 * Sblocca il MediaSession (SOLO per AION)
 * Chiamato quando AION inizia a parlare
 */
export function unblockMediaSessionForAion(): void {
  isBlocked = false;
  console.log('[MediaSessionBlocker] 🎙️ UNBLOCKED for AION');
}

/**
 * Blocca nuovamente il MediaSession
 * Chiamato quando AION smette di parlare
 */
export function blockMediaSession(): void {
  isBlocked = true;
  resetMediaSession();
  console.log('[MediaSessionBlocker] 🔒 BLOCKED');
}

/**
 * Verifica se il MediaSession è bloccato
 */
export function isMediaSessionBlocked(): boolean {
  return isBlocked;
}

// Auto-init se in browser
if (typeof window !== 'undefined') {
  // Inizializza dopo che il DOM è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMediaSessionBlocker);
  } else {
    initMediaSessionBlocker();
  }
}

