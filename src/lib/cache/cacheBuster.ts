// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// 🔄 Cache Buster - Forza il refresh delle cache quando necessario

/**
 * VERSIONE CACHE GLOBALE
 * 🔴 BUMP QUESTO NUMERO per forzare il clear di tutte le cache su tutti i client
 */
export const CACHE_VERSION = '2025-01-14-v2'; // 🔧 v2: Fix marker agenti + clear tutte le cache agent

const CACHE_VERSION_KEY = 'm1ssion_cache_version';

/**
 * Chiavi localStorage da pulire quando la versione cambia
 * 🔧 AGGIORNATO: Include TUTTE le chiavi relative agli agenti
 */
const CACHE_KEYS_TO_CLEAR = [
  // Cache agente principale
  'm1ssion_agent_code',
  'm1ssion_live_agents_cache',
  'm1ssion_user_profile',
  'm1ssion_rank_data',
  'm1ssion_pe_cache',
  
  // 🔧 Chiavi agente aggiuntive trovate nel codice
  'agentCode',                    // useGlobalProfileSync, useProfileBasicInfo
  'agentName',                    // useGlobalProfileSync
  'm1-agent-id',                  // useAgentIdFetcher
  'last_seen_rank_level',
  
  // UI state
  'reward_zone_popup_dismissed',
  'reward_zone_popup_last_shown',
  
  // 🔧 Prefix match: pulisce TUTTE le chiavi che iniziano con questi pattern
  // Queste verranno gestite separatamente
];

/**
 * Prefissi da pulire (tutte le chiavi che iniziano con questi)
 */
const CACHE_KEY_PREFIXES_TO_CLEAR = [
  'agent_customization_',    // PrizeVision, ActiveAgentBadge
  'agent_notes_',            // AgentDiary
  'agent_diary_',            // AgentDiary
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
          console.log(`🔄 [CacheBuster] Removed: ${key}`);
        } catch (e) {
          // Ignora errori
        }
      });
      
      // 🔧 Clear chiavi con prefisso (agent_customization_*, agent_notes_*, etc.)
      const allKeys = Object.keys(localStorage);
      let prefixCleared = 0;
      allKeys.forEach(key => {
        if (CACHE_KEY_PREFIXES_TO_CLEAR.some(prefix => key.startsWith(prefix))) {
          try {
            localStorage.removeItem(key);
            prefixCleared++;
          } catch (e) {
            // Ignora errori
          }
        }
      });
      if (prefixCleared > 0) {
        console.log(`🔄 [CacheBuster] Cleared ${prefixCleared} prefixed keys`);
      }
      
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

