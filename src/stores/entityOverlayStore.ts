// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ SHADOW PROTOCOL™ v7 - Zustand Store
// Gestisce lo stato dell'overlay entità (MCP / SHADOW / ECHO)
// v4: Shadow War AI Level Upgrade - Threat Level system + localStorage persistence
// v5: Global Glitch Effects + CTA Navigation
// v7: Unified heat ↔ threat sync, onNarrativeEvent bridge

import { create } from 'zustand';
import type { 
  ShadowMessageTemplate, 
  ShadowEntity, 
  ShadowIntensity,
  ShadowContextTrigger 
} from '@/config/shadowProtocolConfig';
import { SHADOW_PROTOCOL_TIMING, CTA_COOLDOWN_MS } from '@/config/shadowProtocolConfig';

// ============================================================================
// DEBUG FLAG
// ============================================================================

export const SHADOW_DEBUG = true;

// ============================================================================
// 🆕 v4: LOCALSTORAGE KEYS
// ============================================================================

const STORAGE_KEY_THREAT_LEVEL = 'm1ssion_shadow_threat_level';
const STORAGE_KEY_THREAT_UPDATED = 'm1ssion_shadow_threat_updated';
const STORAGE_KEY_LAST_EVENT_TIME = 'm1ssion_shadow_last_event';
const STORAGE_KEY_SESSION_ENTITY_COUNTS = 'm1ssion_shadow_entity_counts';
// 🆕 v5: Last CTA navigation time (for cooldown)
const STORAGE_KEY_LAST_CTA_TIME = 'm1ssion_shadow_last_cta';

// ============================================================================
// 🆕 v4: LOCALSTORAGE HELPERS (SSR-safe)
// ============================================================================

function safeGetStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
}

function safeSetStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently fail if localStorage is full or unavailable
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface ActiveShadowEvent {
  id: string;
  entity: ShadowEntity;
  intensity: ShadowIntensity;
  text: string;
  blocking: boolean;
  createdAt: number;
  trigger?: ShadowContextTrigger;
  // 🆕 v5: CTA data
  ctaLabel?: string;
  ctaRoute?: string;
  ctaType?: 'primary' | 'secondary';
}

export interface ShadowEventHistoryItem {
  id: string;
  entity: ShadowEntity;
  text: string;
  timestamp: number;
}

// 🆕 v4: Entity counts for statistics
export interface EntityEventCounts {
  MCP: number;
  SHADOW: number;
  ECHO: number;
}

interface EntityOverlayState {
  // Stato corrente
  currentEvent: ActiveShadowEvent | null;
  isVisible: boolean;
  eventsShownThisSession: number;
  lastEventTime: number;
  
  // Cronologia per Intelligence panel (max 10 eventi)
  recentEvents: ShadowEventHistoryItem[];
  
  // Coda per trigger contestuali
  pendingContextTrigger: ShadowContextTrigger | null;
  
  // Flag per disabilitare durante intro
  isIntroActive: boolean;
  introStartTime: number | null;
  
  // Mission Start Sequence (fullscreen, fuori dal portal)
  showMissionIntro: boolean;
  missionIntroMissionId: string | null;
  
  // Chain tracking
  pendingChainTriggerId: string | null;
  
  // v3: Timer persistente
  nextEventTimestamp: number | null;
  isFirstEventTriggered: boolean;
  hasEnteredPreferredRoute: boolean;
  
  // 🆕 v4: Shadow Threat Level System
  shadowThreatLevel: number; // 0-5, default 1
  shadowThreatLevelLastUpdated: number | null;
  lastLeaderboardContextTime: number | null; // Per tracking leaderboard frequente
  entityEventCounts: EntityEventCounts; // Contatori per statistiche
  
  // 🆕 v5: Glitch Effects System
  isGlobalGlitchActive: boolean; // True when page-wide glitch is running
  globalGlitchIntensity: number; // 0-1, used for CSS intensity
  isMapGlitchActive: boolean; // True when map glitch is running
  lastCtaNavigationTime: number | null; // Per CTA cooldown
  
  // Azioni
  showOverlay: (template: ShadowMessageTemplate) => void;
  hideOverlay: () => void;
  resetSession: () => void;
  setContextTrigger: (trigger: ShadowContextTrigger) => void;
  clearContextTrigger: () => void;
  setIntroActive: (active: boolean) => void;
  setPendingChain: (triggerId: string | null) => void;
  
  // Mission Start Sequence actions
  triggerMissionIntro: (missionId: string) => void;
  closeMissionIntro: () => void;
  
  // v3: Timer actions
  setNextEventTimestamp: (timestamp: number | null) => void;
  markFirstEventTriggered: () => void;
  markPreferredRouteEntered: () => void;
  
  // 🆕 v4: Threat Level actions
  setShadowThreatLevel: (level: number) => void;
  increaseThreat: (delta: number) => void;
  decreaseThreat: (delta: number) => void;
  checkInactivityDecay: () => void;
  updateLeaderboardContext: () => void;
  
  // 🆕 v5: Glitch & CTA actions
  triggerGlobalGlitch: (intensity?: number) => void;
  endGlobalGlitch: () => void;
  triggerMapGlitch: () => void;
  endMapGlitch: () => void;
  canNavigateCta: () => boolean;
  recordCtaNavigation: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_RECENT_EVENTS = 10;
const DEFAULT_THREAT_LEVEL = 1;

// ============================================================================
// 🆕 v4: LOAD INITIAL STATE FROM LOCALSTORAGE
// ============================================================================

function loadInitialThreatLevel(): number {
  const stored = safeGetStorage<number>(STORAGE_KEY_THREAT_LEVEL, DEFAULT_THREAT_LEVEL);
  // Validate and clamp to 0-5
  if (typeof stored !== 'number' || isNaN(stored)) return DEFAULT_THREAT_LEVEL;
  return Math.max(0, Math.min(5, stored));
}

function loadInitialThreatUpdated(): number | null {
  return safeGetStorage<number | null>(STORAGE_KEY_THREAT_UPDATED, null);
}

function loadInitialLastEventTime(): number {
  return safeGetStorage<number>(STORAGE_KEY_LAST_EVENT_TIME, 0);
}

function loadInitialEntityCounts(): EntityEventCounts {
  return safeGetStorage<EntityEventCounts>(STORAGE_KEY_SESSION_ENTITY_COUNTS, {
    MCP: 0,
    SHADOW: 0,
    ECHO: 0,
  });
}

// ============================================================================
// STORE
// ============================================================================

// 🆕 v5: Load last CTA time
function loadInitialLastCtaTime(): number | null {
  return safeGetStorage<number | null>(STORAGE_KEY_LAST_CTA_TIME, null);
}

export const useEntityOverlayStore = create<EntityOverlayState>((set, get) => ({
  // Stato iniziale
  currentEvent: null,
  isVisible: false,
  eventsShownThisSession: 0,
  lastEventTime: loadInitialLastEventTime(),
  recentEvents: [],
  pendingContextTrigger: null,
  isIntroActive: false,
  introStartTime: null,
  showMissionIntro: false,
  missionIntroMissionId: null,
  pendingChainTriggerId: null,
  // v3: Timer persistente
  nextEventTimestamp: null,
  isFirstEventTriggered: false,
  hasEnteredPreferredRoute: false,
  // 🆕 v4: Threat Level System (caricato da localStorage)
  shadowThreatLevel: loadInitialThreatLevel(),
  shadowThreatLevelLastUpdated: loadInitialThreatUpdated(),
  lastLeaderboardContextTime: null,
  entityEventCounts: loadInitialEntityCounts(),
  // 🆕 v5: Glitch Effects System
  isGlobalGlitchActive: false,
  globalGlitchIntensity: 0,
  isMapGlitchActive: false,
  lastCtaNavigationTime: loadInitialLastCtaTime(),

  // Mostra overlay con un template
  showOverlay: (template: ShadowMessageTemplate) => {
    const now = Date.now();
    
    // Log per debug
    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v5] 🌑 Showing overlay:', {
        id: template.id,
        entity: template.entity,
        intensity: template.intensity,
        trigger: template.trigger || 'generic',
        chainId: template.chainId,
        hasCta: !!(template.ctaLabel && template.ctaRoute),
      });
    }

    // Crea evento attivo (🆕 v5: include CTA data)
    const activeEvent: ActiveShadowEvent = {
      id: template.id,
      entity: template.entity,
      intensity: template.intensity,
      text: template.text,
      blocking: template.blocking,
      createdAt: now,
      trigger: template.trigger,
      // 🆕 v5: CTA fields
      ctaLabel: template.ctaLabel,
      ctaRoute: template.ctaRoute,
      ctaType: template.ctaType,
    };

    // Crea item per cronologia
    const historyItem: ShadowEventHistoryItem = {
      id: template.id,
      entity: template.entity,
      text: template.text.split('\n')[0], // Solo prima riga per compattezza
      timestamp: now,
    };

    set((state) => {
      // 🆕 v4: Aggiorna contatori entità
      const newEntityCounts = { ...state.entityEventCounts };
      newEntityCounts[template.entity] += 1;
      
      // Persisti contatori
      safeSetStorage(STORAGE_KEY_SESSION_ENTITY_COUNTS, newEntityCounts);
      
      // Persisti lastEventTime
      safeSetStorage(STORAGE_KEY_LAST_EVENT_TIME, now);

      return {
        currentEvent: activeEvent,
        isVisible: true,
        eventsShownThisSession: state.eventsShownThisSession + 1,
        lastEventTime: now,
        // Aggiungi a cronologia, mantieni max 10
        recentEvents: [historyItem, ...state.recentEvents].slice(0, MAX_RECENT_EVENTS),
        // Se ha chainId, imposta per trigger catena
        pendingChainTriggerId: template.chainId || null,
        // 🆕 v4: Aggiorna contatori
        entityEventCounts: newEntityCounts,
      };
    });

    // 🆕 v4: Se è un evento SHADOW, aumenta threat level (+0.5)
    if (template.entity === 'SHADOW') {
      get().increaseThreat(0.5);
    }

    // 🆕 v7: Bridge to ShadowGlitchEngine
    try {
      import('@/engine/shadowGlitchEngine').then(({ ShadowGlitchEngine }) => {
        ShadowGlitchEngine.onNarrativeEvent({
          entity: template.entity,
          intensity: template.intensity,
          context: template.trigger,
          templateId: template.id,
        });
      });
    } catch {
      // Ignore import errors
    }
  },

  // Nascondi overlay
  hideOverlay: () => {
    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v4] 🌑 Hiding overlay');
    }

    set({
      isVisible: false,
      currentEvent: null,
    });
  },

  // Reset sessione (es. al logout)
  resetSession: () => {
    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v4] 🌑 Session reset');
    }

    // 🆕 v4: Verifica se sessione terminata senza eventi SHADOW → diminuisci threat
    const state = get();
    const hadOnlyMcpEcho = state.entityEventCounts.SHADOW === 0 && 
      (state.entityEventCounts.MCP > 0 || state.entityEventCounts.ECHO > 0);
    
    if (hadOnlyMcpEcho) {
      // Diminuisci threat di 0.5 se sessione senza SHADOW
      const newLevel = Math.max(0, state.shadowThreatLevel - 0.5);
      safeSetStorage(STORAGE_KEY_THREAT_LEVEL, newLevel);
      safeSetStorage(STORAGE_KEY_THREAT_UPDATED, Date.now());
    }

    // Reset contatori sessione
    const resetCounts: EntityEventCounts = { MCP: 0, SHADOW: 0, ECHO: 0 };
    safeSetStorage(STORAGE_KEY_SESSION_ENTITY_COUNTS, resetCounts);

    set({
      isVisible: false,
      currentEvent: null,
      eventsShownThisSession: 0,
      // NON resettare lastEventTime - mantieni per decay
      recentEvents: [],
      pendingContextTrigger: null,
      pendingChainTriggerId: null,
      // v3: Reset timer
      nextEventTimestamp: null,
      isFirstEventTriggered: false,
      hasEnteredPreferredRoute: false,
      isIntroActive: false,
      introStartTime: null,
      // 🆕 v4: Reset contatori sessione ma mantieni threat level
      entityEventCounts: resetCounts,
      // Aggiorna threat se sessione senza SHADOW
      shadowThreatLevel: hadOnlyMcpEcho 
        ? Math.max(0, state.shadowThreatLevel - 0.5) 
        : state.shadowThreatLevel,
    });
  },

  // Imposta trigger contestuale
  setContextTrigger: (trigger: ShadowContextTrigger) => {
    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v4] 🌑 Context trigger set:', trigger);
    }
    set({ pendingContextTrigger: trigger });
    
    // 🆕 v4: Se trigger è 'leaderboard', aggiorna timestamp e verifica frequenza
    if (trigger === 'leaderboard') {
      get().updateLeaderboardContext();
    }
  },

  // Cancella trigger contestuale
  clearContextTrigger: () => {
    set({ pendingContextTrigger: null });
  },

  // Imposta stato intro (disabilita overlay durante intro)
  setIntroActive: (active: boolean) => {
    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v4] 🌑 Intro active:', active);
    }
    set({ 
      isIntroActive: active,
      introStartTime: active ? Date.now() : null,
    });
  },

  // Imposta pending chain
  setPendingChain: (triggerId: string | null) => {
    set({ pendingChainTriggerId: triggerId });
  },
  
  // Mission Start Sequence - TRIGGER (fullscreen overlay)
  triggerMissionIntro: (missionId: string) => {
    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v4] 🎬 Mission Intro triggered for:', missionId);
    }
    set({ 
      showMissionIntro: true, 
      missionIntroMissionId: missionId,
      isIntroActive: true,
      introStartTime: Date.now(),
    });
  },
  
  // Mission Start Sequence - CLOSE
  closeMissionIntro: () => {
    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v4] 🎬 Mission Intro closed');
    }
    set({ 
      showMissionIntro: false, 
      missionIntroMissionId: null,
      isIntroActive: false,
      introStartTime: null,
    });
  },
  
  // v3: Timer actions
  setNextEventTimestamp: (timestamp: number | null) => {
    if (SHADOW_DEBUG && timestamp) {
      const delayMs = timestamp - Date.now();
      console.log('[SHADOW PROTOCOL v4] 🌑 Next event scheduled in', Math.round(delayMs / 1000), 'seconds');
    }
    set({ nextEventTimestamp: timestamp });
  },
  
  markFirstEventTriggered: () => {
    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v4] 🌑 First event triggered - switching to normal timing');
    }
    set({ isFirstEventTriggered: true });
  },
  
  markPreferredRouteEntered: () => {
    const state = get();
    if (!state.hasEnteredPreferredRoute) {
      if (SHADOW_DEBUG) {
        console.log('[SHADOW PROTOCOL v4] 🌑 First preferred route entered - enabling first event booster');
      }
      set({ hasEnteredPreferredRoute: true });
    }
  },

  // =========================================================================
  // 🆕 v4: THREAT LEVEL ACTIONS
  // =========================================================================

  /**
   * setShadowThreatLevel - Imposta il livello di minaccia (clamped 0-5)
   */
  setShadowThreatLevel: (level: number) => {
    // Clamp 0-5, arrotonda a 1 decimale
    const clampedLevel = Math.round(Math.max(0, Math.min(5, level)) * 10) / 10;
    const now = Date.now();
    
    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v4] ⚠️ Threat level SET to:', clampedLevel);
    }
    
    // Persisti in localStorage
    safeSetStorage(STORAGE_KEY_THREAT_LEVEL, clampedLevel);
    safeSetStorage(STORAGE_KEY_THREAT_UPDATED, now);
    
    set({
      shadowThreatLevel: clampedLevel,
      shadowThreatLevelLastUpdated: now,
    });
  },

  /**
   * increaseThreat - Aumenta il livello di minaccia
   * @param delta - Quantità da aggiungere (es. 0.5, 1)
   */
  increaseThreat: (delta: number) => {
    const state = get();
    const newLevel = Math.round(Math.max(0, Math.min(5, state.shadowThreatLevel + delta)) * 10) / 10;
    const now = Date.now();
    
    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v7] ⚠️ Threat level INCREASED:', state.shadowThreatLevel, '→', newLevel, `(+${delta})`);
    }
    
    // Persisti in localStorage
    safeSetStorage(STORAGE_KEY_THREAT_LEVEL, newLevel);
    safeSetStorage(STORAGE_KEY_THREAT_UPDATED, now);
    
    set({
      shadowThreatLevel: newLevel,
      shadowThreatLevelLastUpdated: now,
    });

    // 🆕 v7: Sync to ShadowGlitchEngine
    try {
      import('@/engine/shadowGlitchEngine').then(({ ShadowGlitchEngine }) => {
        ShadowGlitchEngine.syncFromThreatLevel(newLevel);
      });
    } catch {
      // Ignore
    }
  },

  /**
   * decreaseThreat - Diminuisce il livello di minaccia
   * @param delta - Quantità da sottrarre (es. 0.5, 1)
   */
  decreaseThreat: (delta: number) => {
    const state = get();
    const newLevel = Math.round(Math.max(0, Math.min(5, state.shadowThreatLevel - delta)) * 10) / 10;
    const now = Date.now();
    
    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v4] ⚠️ Threat level DECREASED:', state.shadowThreatLevel, '→', newLevel, `(-${delta})`);
    }
    
    // Persisti in localStorage
    safeSetStorage(STORAGE_KEY_THREAT_LEVEL, newLevel);
    safeSetStorage(STORAGE_KEY_THREAT_UPDATED, now);
    
    set({
      shadowThreatLevel: newLevel,
      shadowThreatLevelLastUpdated: now,
    });
  },

  /**
   * checkInactivityDecay - Verifica se applicare decay per inattività
   * Chiamato all'avvio dell'engine, applica -1 se inattivo > 2 ore
   */
  checkInactivityDecay: () => {
    const state = get();
    const now = Date.now();
    const lastEvent = state.lastEventTime;
    
    // Se nessun evento precedente, non applicare decay
    if (!lastEvent || lastEvent === 0) return;
    
    const timeSinceLastEvent = now - lastEvent;
    
    // Se inattivo per più di 2 ore, applica decay di -1
    if (timeSinceLastEvent >= SHADOW_PROTOCOL_TIMING.INACTIVITY_THRESHOLD_MS) {
      const newLevel = Math.round(Math.max(0, state.shadowThreatLevel - 1) * 10) / 10;
      
      if (SHADOW_DEBUG) {
        const hoursAgo = Math.round(timeSinceLastEvent / (60 * 60 * 1000) * 10) / 10;
        console.log('[SHADOW PROTOCOL v4] ⚠️ Inactivity decay applied:', state.shadowThreatLevel, '→', newLevel, `(${hoursAgo}h since last event)`);
      }
      
      // Persisti e aggiorna
      safeSetStorage(STORAGE_KEY_THREAT_LEVEL, newLevel);
      safeSetStorage(STORAGE_KEY_THREAT_UPDATED, now);
      // Reset lastEventTime per evitare decay multipli
      safeSetStorage(STORAGE_KEY_LAST_EVENT_TIME, now);
      
      set({
        shadowThreatLevel: newLevel,
        shadowThreatLevelLastUpdated: now,
        lastEventTime: now,
      });
    }
  },

  /**
   * updateLeaderboardContext - Traccia accesso leaderboard per aumentare threat
   * Se accesso ripetuto entro 10 minuti, +0.5 threat
   */
  updateLeaderboardContext: () => {
    const state = get();
    const now = Date.now();
    const lastLeaderboard = state.lastLeaderboardContextTime;
    
    // Se accesso frequente (entro 10 min dall'ultimo), aumenta threat
    if (lastLeaderboard && (now - lastLeaderboard) < SHADOW_PROTOCOL_TIMING.LEADERBOARD_FREQUENT_WINDOW_MS) {
      if (SHADOW_DEBUG) {
        console.log('[SHADOW PROTOCOL v4] ⚠️ Frequent leaderboard access detected - increasing threat');
      }
      get().increaseThreat(0.5);
    }
    
    set({ lastLeaderboardContextTime: now });
  },

  // =========================================================================
  // 🆕 v5: GLITCH EFFECTS ACTIONS
  // =========================================================================

  /**
   * triggerGlobalGlitch - Attiva effetto glitch globale sulla pagina
   * @param intensity - Intensità 0-1 (default: basata su threat level)
   */
  triggerGlobalGlitch: (intensity?: number) => {
    const state = get();
    // Default intensity based on threat level
    const defaultIntensity = state.shadowThreatLevel <= 1 ? 0.3 
      : state.shadowThreatLevel <= 3 ? 0.6 
      : 1.0;
    const finalIntensity = intensity ?? defaultIntensity;
    
    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v5] ⚡ Global glitch triggered, intensity:', finalIntensity);
    }
    
    set({ 
      isGlobalGlitchActive: true,
      globalGlitchIntensity: finalIntensity,
    });
  },

  /**
   * endGlobalGlitch - Termina effetto glitch globale
   */
  endGlobalGlitch: () => {
    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v5] ⚡ Global glitch ended');
    }
    set({ 
      isGlobalGlitchActive: false,
      globalGlitchIntensity: 0,
    });
  },

  /**
   * triggerMapGlitch - Attiva effetto glitch sulla mappa
   */
  triggerMapGlitch: () => {
    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v5] 🗺️ Map glitch triggered');
    }
    set({ isMapGlitchActive: true });
  },

  /**
   * endMapGlitch - Termina effetto glitch mappa
   */
  endMapGlitch: () => {
    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v5] 🗺️ Map glitch ended');
    }
    set({ isMapGlitchActive: false });
  },

  /**
   * canNavigateCta - Verifica se è possibile navigare via CTA (cooldown check)
   */
  canNavigateCta: () => {
    const state = get();
    const now = Date.now();
    if (!state.lastCtaNavigationTime) return true;
    return (now - state.lastCtaNavigationTime) >= CTA_COOLDOWN_MS;
  },

  /**
   * recordCtaNavigation - Registra navigazione CTA per cooldown
   */
  recordCtaNavigation: () => {
    const now = Date.now();
    safeSetStorage(STORAGE_KEY_LAST_CTA_TIME, now);
    set({ lastCtaNavigationTime: now });
    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v5] 🔗 CTA navigation recorded');
    }
  },
}));

// ============================================================================
// SELECTORS (per performance)
// ============================================================================

export const selectIsOverlayVisible = (state: EntityOverlayState) => state.isVisible;
export const selectCurrentEvent = (state: EntityOverlayState) => state.currentEvent;
export const selectEventsCount = (state: EntityOverlayState) => state.eventsShownThisSession;
export const selectRecentEvents = (state: EntityOverlayState) => state.recentEvents;
export const selectPendingContextTrigger = (state: EntityOverlayState) => state.pendingContextTrigger;
export const selectIsIntroActive = (state: EntityOverlayState) => state.isIntroActive;
export const selectPendingChainTriggerId = (state: EntityOverlayState) => state.pendingChainTriggerId;
// v3 selectors
export const selectNextEventTimestamp = (state: EntityOverlayState) => state.nextEventTimestamp;
export const selectIsFirstEventTriggered = (state: EntityOverlayState) => state.isFirstEventTriggered;
export const selectHasEnteredPreferredRoute = (state: EntityOverlayState) => state.hasEnteredPreferredRoute;
export const selectIntroStartTime = (state: EntityOverlayState) => state.introStartTime;
// 🆕 v4 selectors
export const selectShadowThreatLevel = (state: EntityOverlayState) => state.shadowThreatLevel;
export const selectShadowThreatLevelLastUpdated = (state: EntityOverlayState) => state.shadowThreatLevelLastUpdated;
export const selectEntityEventCounts = (state: EntityOverlayState) => state.entityEventCounts;
// 🆕 v5 selectors
export const selectIsGlobalGlitchActive = (state: EntityOverlayState) => state.isGlobalGlitchActive;
export const selectGlobalGlitchIntensity = (state: EntityOverlayState) => state.globalGlitchIntensity;
export const selectIsMapGlitchActive = (state: EntityOverlayState) => state.isMapGlitchActive;

// ============================================================================
// HELPER: Notify Shadow Context (per trigger esterni)
// ============================================================================

/**
 * Funzione helper per notificare un trigger contestuale.
 * Chiamare dopo eventi come BUZZ, apertura mappa, claim reward, etc.
 * 
 * 🆕 v4: 'reward' trigger aumenta threat di +1
 * 🆕 v6: Context-aware glitch reactions based on threat level
 * 🆕 v7: Emits unified event for ShadowBehaviorsLayer to add v6 effects
 */
export const notifyShadowContext = async (trigger: ShadowContextTrigger): Promise<void> => {
  const store = useEntityOverlayStore.getState();
  const threatLevel = store.shadowThreatLevel;
  const threatCategory = getThreatLevelCategoryFromLevel(threatLevel);
  
  store.setContextTrigger(trigger);
  
  // 🆕 v7: Emit unified context event for behavior layer
  window.dispatchEvent(new CustomEvent('shadow:contextTrigger', { 
    detail: { context: trigger, threatLevel, threatCategory } 
  }));
  
  // 🆕 v6: Import ShadowGlitchEngine dynamically to avoid circular deps
  const { ShadowGlitchEngine } = await import('@/engine/shadowGlitchEngine');
  
  // 🆕 v7: Unified context-aware reactions
  switch (trigger) {
    case 'buzz':
      // Increase heat on BUZZ
      ShadowGlitchEngine.increaseHeat(10);
      
      // If threat HIGH, trigger page glitch after BUZZ
      if (threatCategory === 'HIGH') {
        setTimeout(() => {
          ShadowGlitchEngine.triggerRandomPageGlitch(0.5);
        }, 500);
      }
      break;
      
    case 'reward':
      // 🆕 v4: Aumenta threat di +1
      store.increaseThreat(1);
      if (SHADOW_DEBUG) {
        console.log('[SHADOW v7] ⚠️ Reward claimed - threat increased by 1');
      }
      
      // 🆕 v7: SHADOW takeover sequence for reward claims at HIGH threat
      if (threatCategory === 'HIGH') {
        setTimeout(async () => {
          await ShadowGlitchEngine.triggerShadowTakeover();
          ShadowGlitchEngine.triggerWhisper('This reward was never yours.');
        }, 1000);
      } else if (threatCategory === 'MEDIUM') {
        setTimeout(() => {
          ShadowGlitchEngine.triggerRandomPageGlitch(0.7);
        }, 500);
      }
      break;
      
    case 'leaderboard':
      // Increase heat for leaderboard access
      ShadowGlitchEngine.increaseHeat(5);
      break;
      
    case 'map':
      // Map trigger - heat increase (periodic glitches handled by useMapGlitchEffect)
      ShadowGlitchEngine.increaseHeat(3);
      break;
  }
};

// Helper to get threat category (avoiding circular import)
function getThreatLevelCategoryFromLevel(level: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (level <= 1) return 'LOW';
  if (level <= 3) return 'MEDIUM';
  return 'HIGH';
}

// ============================================================================
// 🆕 v7: HEAT → THREAT SYNC LISTENER
// Listens for heat threshold events and updates threat level
// ============================================================================

if (typeof window !== 'undefined') {
  window.addEventListener('shadow:heatThreatSync', ((e: CustomEvent<{ delta: number; currentHeat: number }>) => {
    const { delta, currentHeat } = e.detail;
    const store = useEntityOverlayStore.getState();
    
    if (SHADOW_DEBUG) {
      console.log(`[SHADOW v7] 📡 Heat→Threat sync received: +${delta} (heat: ${currentHeat})`);
    }
    
    // Only increase if not at max
    if (store.shadowThreatLevel < 5) {
      store.increaseThreat(delta);
    }
  }) as EventListener);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
