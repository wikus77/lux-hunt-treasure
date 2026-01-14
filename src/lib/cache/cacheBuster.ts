// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// 🔄 Cache Buster - Forza il refresh delle cache quando necessario

/**
 * VERSIONE CACHE GLOBALE
 * 🔴 BUMP QUESTO NUMERO per forzare il clear di tutte le cache su tutti i client
 */
export const CACHE_VERSION = '2025-01-14-v1';

const CACHE_VERSION_KEY = 'm1ssion_cache_version';

/**
 * Chiavi localStorage da pulire quando la versione cambia
 */
const CACHE_KEYS_TO_CLEAR = [
  'm1ssion_agent_code',
  'm1ssion_live_agents_cache',
  'm1ssion_user_profile',
  'm1ssion_rank_data',
  'last_seen_rank_level',
  'm1ssion_pe_cache',
  'reward_zone_popup_dismissed',
  'reward_zone_popup_last_shown',
  // Aggiungi altre chiavi se necessario
];

/**
 * Verifica se la cache è aggiornata, altrimenti pulisce tutto
 * Chiamare all'avvio dell'app
 */
export function checkAndClearCache(): boolean {
  try {
    const storedVersion = localStorage.getItem(CACHE_VERSION_KEY);
    
    if (storedVersion !== CACHE_VERSION) {
      console.log(`🔄 [CacheBuster] Version mismatch: ${storedVersion} → ${CACHE_VERSION}`);
      console.log('🔄 [CacheBuster] Clearing all M1SSION caches...');
      
      // Clear tutte le chiavi conosciute
      CACHE_KEYS_TO_CLEAR.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Ignora errori
        }
      });
      
      // Salva nuova versione
      localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
      
      console.log('✅ [CacheBuster] Cache cleared successfully');
      return true; // Cache was cleared
    }
    
    return false; // Cache was already up to date
  } catch (e) {
    console.warn('[CacheBuster] Error checking cache:', e);
    return false;
  }
}

/**
 * Forza il clear di tutte le cache (chiamare manualmente se necessario)
 */
export function forceClearAllCaches(): void {
  console.log('🔴 [CacheBuster] Force clearing ALL caches...');
  
  CACHE_KEYS_TO_CLEAR.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Ignora errori
    }
  });
  
  // Reset versione per forzare reload al prossimo avvio
  localStorage.removeItem(CACHE_VERSION_KEY);
  
  console.log('✅ [CacheBuster] All caches cleared');
}

