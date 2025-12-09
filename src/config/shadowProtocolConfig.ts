// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ SHADOW PROTOCOL™ v5 - Configuration
// Sistema narrativo overlay per eventi MCP / SHADOW / ECHO
// v4: Shadow War AI Level Upgrade - Threat Level system
// v5: Glitch Effects + Interactive CTA System

// ============================================================================
// FEATURE FLAGS
// ============================================================================

/**
 * FULL_WAR_ENABLED - Quando true, tutte le entità (MCP/SHADOW/ECHO) sono attive
 * da subito. Quando false, solo MCP è attivo nelle prime settimane.
 * Per disabilitare rapidamente il FULL WAR mode, impostare a false.
 */
export const FULL_WAR_ENABLED = true;

/**
 * SHADOW_INTRO_ACTIVE - Quando true, disabilita temporaneamente gli overlay
 * durante la Mission Intro per non sovrapporre elementi narrativi.
 */
export const SHADOW_INTRO_ACTIVE_KEY = 'shadow_intro_active';

// ============================================================================
// 🆕 v5: GLITCH EFFECTS FEATURE FLAGS
// ============================================================================

/**
 * SHADOW_VISUAL_GLITCH_ENABLED - Abilita effetti glitch visivi globali
 * Quando appare un overlay SHADOW intensity 2-3, applica glitch al page root
 */
export const SHADOW_VISUAL_GLITCH_ENABLED = true;

/**
 * SHADOW_MAP_GLITCH_ENABLED - Abilita effetti glitch sulla mappa
 * Glitch periodici sulla mappa (distorsione breve, non blocca input)
 */
export const SHADOW_MAP_GLITCH_ENABLED = true;

/**
 * CTA_COOLDOWN_MS - Cooldown tra CTA "forti" (evita spam navigazione)
 */
export const CTA_COOLDOWN_MS = 5 * 60 * 1000; // 5 minuti

// ============================================================================
// 🆕 v4: MISSION START DATE - Data di lancio missione per calcolo fase reale
// ============================================================================

/**
 * MISSION_START_DATE - Data di inizio della missione attuale
 * Usata per calcolare la fase (0-4) in modo reale
 * Cambia questa data per ogni nuova missione
 */
export const MISSION_START_DATE = new Date('2025-12-19T00:00:00Z');

// ============================================================================
// TYPES
// ============================================================================

export type ShadowEntity = 'MCP' | 'SHADOW' | 'ECHO';

export type ShadowIntensity = 1 | 2 | 3;
// 1 = lieve (cosmetico), 2 = medio, 3 = forte/bloccante

export type ShadowContextTrigger = 'generic' | 'buzz' | 'map' | 'reward' | 'leaderboard';

export type MissionPhase = 0 | 1 | 2 | 3 | 4;
// 0 = Pre-Lancio / Infiltrazione
// 1-4 = Settimane missione standard

// 🆕 v4: Threat Level Categories
export type ThreatLevelCategory = 'LOW' | 'MEDIUM' | 'HIGH';

// 🆕 v5: CTA Types
export type ShadowCtaType = 'primary' | 'secondary';

// 🆕 v6: Advanced CTA Action Types
export type ShadowCtaActionType = 
  | 'redirect'           // Navigate to route
  | 'highlightComponent' // Highlight a UI component
  | 'pulseBuzzButton'    // Pulse the BUZZ button
  | 'flashMapZone'       // Flash a zone on map
  | 'triggerWhisper';    // Show whisper message

export interface ShadowCtaAction {
  type: ShadowCtaActionType;
  path?: string;           // For redirect
  componentId?: string;    // For highlightComponent
  lat?: number;            // For flashMapZone
  lon?: number;            // For flashMapZone
  message?: string;        // For triggerWhisper
}

export interface ShadowMessageTemplate {
  id: string;
  entity: ShadowEntity;
  intensity: ShadowIntensity;
  weekRange: [number, number]; // [minWeek, maxWeek] 0-4 (ora include 0)
  blocking: boolean; // true = blocca input fino a dismiss
  allowOnAllProtectedRoutes: boolean;
  weight: number; // probabilità relativa per scelta pesata
  text: string; // stringa con \n per newline, typing effect
  trigger?: ShadowContextTrigger; // trigger contestuale opzionale
  chainId?: string; // ID per catene MCP ↔ SHADOW
  followsAfterId?: string; // Se presente, questo messaggio segue quello con questo ID
  // 🆕 v5: CTA interattive (legacy)
  ctaLabel?: string; // Es. "OPEN MAP", "CHECK INTELLIGENCE"
  ctaRoute?: string; // Es. "/map-3d-tiler", "/intelligence"
  ctaType?: ShadowCtaType; // 'primary' | 'secondary'
  // 🆕 v6: Advanced CTA actions
  ctaAction?: ShadowCtaAction; // Advanced action type
}

export interface ShadowMissionConfig {
  getMissionPhase: () => MissionPhase;
}

// ============================================================================
// TIMING CONFIGURATION
// ============================================================================

export const SHADOW_PROTOCOL_TIMING = {
  // Minimo tempo in ms tra un evento e il successivo
  MIN_INTERVAL_MS: 90_000,   // 1.5 minuti
  MAX_INTERVAL_MS: 300_000,  // 5 minuti
  // Limite massimo eventi per sessione (anti-spam)
  MAX_EVENTS_PER_SESSION: 8,
  // 🆕 v7: Reduced min display time for faster UX (was 2000)
  MIN_DISPLAY_MS: 1500,
  // Delay tra eventi concatenati (catene MCP ↔ SHADOW)
  CHAIN_DELAY_MS: 3000, // 3 secondi tra messaggio SHADOW e risposta MCP
  // Delay per trigger contestuali (after BUZZ, map open, etc.)
  CONTEXT_TRIGGER_DELAY_MS: 2000, // 2 secondi dopo evento contestuale
  // v3: First Event Booster - primo evento rapido
  FIRST_EVENT_DELAY_MS: 30_000, // 30 secondi per primo evento
  // v3: Timeout fallback per intro bloccato
  INTRO_MAX_DURATION_MS: 12_000, // 12 secondi max per intro
  // 🆕 v4: Inactivity threshold per diminuire threat
  INACTIVITY_THRESHOLD_MS: 2 * 60 * 60 * 1000, // 2 ore
  // 🆕 v4: Finestra per leaderboard frequente (aumenta threat)
  LEADERBOARD_FREQUENT_WINDOW_MS: 10 * 60 * 1000, // 10 minuti
  // 🆕 v7: Whisper display duration (ms)
  WHISPER_DURATION_MS: 4000, // 4 seconds for whispers to be visible
} as const;

// ============================================================================
// 🆕 v5: GLITCH EFFECTS TIMING
// ============================================================================

export const SHADOW_GLITCH_TIMING = {
  // Durata glitch mappa (ms)
  MAP_GLITCH_DURATION_MS: 500, // 400-800ms, uso 500 come base
  // Intervallo minimo tra glitch mappa (ms)
  MAP_GLITCH_MIN_INTERVAL_MS: 60_000, // 1 minuto
  // Intervallo massimo tra glitch mappa (ms)
  MAP_GLITCH_MAX_INTERVAL_MS: 180_000, // 3 minuti
  // Durata glitch globale (ms)
  GLOBAL_GLITCH_DURATION_MS: 300, // 200-500ms
  // Moltiplicatore per threat level (glitch più frequenti a threat alto)
  THREAT_GLITCH_MULTIPLIER: {
    LOW: 1.5,    // 50% più lento (meno frequente)
    MEDIUM: 1.0, // normale
    HIGH: 0.6,   // 40% più veloce (più frequente)
  },
  // Intensità glitch per threat level
  THREAT_GLITCH_INTENSITY: {
    LOW: 0.3,    // Soft
    MEDIUM: 0.6, // Medio
    HIGH: 1.0,   // Full
  },
} as const;

// ============================================================================
// ROUTE CONFIGURATION
// ============================================================================

// Route dove NON deve MAI attivarsi (auth, pagamenti, legal, intro)
export const SHADOW_EXCLUDED_PATHS: string[] = [
  '/login',
  '/register',
  '/subscriptions',
  '/subscriptions/checkout',
  '/kyc',
  '/verification',
  '/terms',
  '/privacy',
  '/cookies',
  '/policies',
  '/mission-intro', // Esclusa per non sovrapporre elementi narrativi
];

// Route dove è particolarmente "benvenuto" (peso bonus)
export const SHADOW_PREFERRED_PATHS: string[] = [
  '/home',
  '/buzz',
  '/map-3d-tiler',
  '/intelligence',
  '/leaderboard',
];

// ============================================================================
// 🆕 v4: REAL MISSION PHASE CALCULATION
// ============================================================================

/**
 * getMissionPhase - Calcola la fase della missione basata sulla data corrente
 * 
 * @param now - Data corrente (default: new Date())
 * @returns MissionPhase (0-4)
 * 
 * Phase 0: Before launch (Infiltration)
 * Phase 1: Week 1 after launch
 * Phase 2: Week 2 after launch
 * Phase 3: Week 3 after launch
 * Phase 4: Week 4+ after launch
 */
export function getMissionPhase(now: Date = new Date()): MissionPhase {
  const diffMs = now.getTime() - MISSION_START_DATE.getTime();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  // Before launch → Infiltration phase
  if (diffMs < 0) return 0;

  const weeks = Math.floor(diffMs / weekMs);

  if (weeks === 0) return 1; // First week
  if (weeks === 1) return 2; // Second week
  if (weeks === 2) return 3; // Third week

  return 4; // 3+ weeks after launch
}

// Legacy config object per retrocompatibilità
export const SHADOW_MISSION_CONFIG: ShadowMissionConfig = {
  getMissionPhase: () => getMissionPhase(),
};

// Alias per retrocompatibilità con v1
export const getMissionWeek = (): 1 | 2 | 3 | 4 => {
  const phase = getMissionPhase();
  return phase === 0 ? 1 : phase as 1 | 2 | 3 | 4;
};

// ============================================================================
// 🆕 v4: THREAT LEVEL SYSTEM
// ============================================================================

/**
 * getThreatLevelCategory - Converte il livello numerico in categoria
 * 
 * @param level - Threat level (0-5)
 * @returns ThreatLevelCategory
 */
export function getThreatLevelCategory(level: number): ThreatLevelCategory {
  if (level <= 1) return 'LOW';
  if (level <= 3) return 'MEDIUM';
  return 'HIGH';
}

/**
 * getWeightMultiplierForThreat - Calcola moltiplicatore peso per template
 * basato su threat level e caratteristiche del template
 * 
 * Logica:
 * - LOW threat (0-1): Preferisce MCP/ECHO, intensity 1, non-blocking
 *   - SHADOW weight × 0.3
 *   - intensity 3 weight × 0.1
 *   - blocking weight × 0.5
 * 
 * - MEDIUM threat (2-3): Mix bilanciato
 *   - SHADOW weight × 0.8
 *   - intensity 3 weight × 0.5
 *   - blocking weight × 0.8
 * 
 * - HIGH threat (4-5): Favorisce SHADOW, intensità alta, blocking
 *   - SHADOW weight × 1.5
 *   - MCP/ECHO weight × 0.6
 *   - intensity 1 weight × 0.4
 *   - blocking weight × 1.2
 * 
 * @param template - Template da valutare
 * @param threatLevel - Livello di minaccia corrente (0-5)
 * @returns Moltiplicatore peso (0.1 - 2.0)
 */
export function getWeightMultiplierForThreat(
  template: ShadowMessageTemplate,
  threatLevel: number
): number {
  const category = getThreatLevelCategory(threatLevel);
  const { entity, intensity, blocking } = template;

  let multiplier = 1.0;

  switch (category) {
    case 'LOW':
      // Preferisce MCP/ECHO, bassa intensità, non-blocking
      if (entity === 'SHADOW') multiplier *= 0.3;
      if (intensity === 3) multiplier *= 0.1;
      if (intensity === 2) multiplier *= 0.5;
      if (blocking) multiplier *= 0.5;
      // Boost per MCP e ECHO
      if (entity === 'MCP') multiplier *= 1.3;
      if (entity === 'ECHO') multiplier *= 1.2;
      break;

    case 'MEDIUM':
      // Mix bilanciato, consente più SHADOW e intensità 2
      if (entity === 'SHADOW') multiplier *= 0.8;
      if (intensity === 3) multiplier *= 0.5;
      if (blocking) multiplier *= 0.8;
      break;

    case 'HIGH':
      // Favorisce SHADOW, alta intensità, blocking
      if (entity === 'SHADOW') multiplier *= 1.5;
      if (entity === 'MCP') multiplier *= 0.6;
      if (entity === 'ECHO') multiplier *= 0.6;
      if (intensity === 1) multiplier *= 0.4;
      if (intensity === 3) multiplier *= 1.3;
      if (blocking) multiplier *= 1.2;
      break;
  }

  // Clamp finale tra 0.1 e 2.0
  return Math.max(0.1, Math.min(2.0, multiplier));
}

// ============================================================================
// MESSAGE TEMPLATES — VERSIONE 4 (FULL WAR + Threat Level)
// ============================================================================

export const SHADOW_MESSAGE_TEMPLATES: ShadowMessageTemplate[] = [
  // =========================================================================
  // WEEK 0 — INFILTRAZIONE (Pre-Lancio, attiva da SUBITO)
  // Shadow è già presente, MCP monitora, Echo osserva
  // =========================================================================
  {
    id: 'shadow_infiltration_1',
    entity: 'SHADOW',
    intensity: 1,
    weekRange: [0, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 3,
    text: '[SHADOW//INFILTRATE]\nWe found you before the others, Echo.\nThat is… inconvenient.',
  },
  {
    id: 'shadow_infiltration_2',
    entity: 'SHADOW',
    intensity: 1,
    weekRange: [0, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    text: '[SHADOW//BREACH]\nYour presence was logged.\nBefore you even started.',
  },
  {
    id: 'mcp_prelaunch_1',
    entity: 'MCP',
    intensity: 1,
    weekRange: [0, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 3,
    text: '[MCP//OVERRIDE: ACTIVE]\nShadow presence detected before launch.\nInitiating countermeasures.',
  },
  {
    id: 'mcp_prelaunch_2',
    entity: 'MCP',
    intensity: 1,
    weekRange: [0, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    text: '[MCP//PREEMPTIVE]\nAgent, you are not alone.\nShadow has infiltrated the network.',
  },
  {
    id: 'echo_prelaunch_1',
    entity: 'ECHO',
    intensity: 1,
    weekRange: [0, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    text: '[ECHO//COLLECTIVE]\nWe are watching.\nThe network is awake.',
  },

  // =========================================================================
  // WEEK 1 — Presenza lieve, solo accenni, quasi tutti MCP
  // =========================================================================
  {
    id: 'mcp_entry_1',
    entity: 'MCP',
    intensity: 1,
    weekRange: [1, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 3,
    text: '[MCP//OVERRIDE: ACTIVE]\nShadow traffic detected.\nStay alert, Agent.',
  },
  {
    id: 'mcp_entry_2',
    entity: 'MCP',
    intensity: 1,
    weekRange: [1, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    text: '[MCP//OVERRIDE: ACTIVE]\nEcho interference detected.\nContainment… uncertain.',
  },
  {
    id: 'mcp_entry_3',
    entity: 'MCP',
    intensity: 1,
    weekRange: [1, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    text: '[MCP//OVERRIDE: ACTIVE]\nGeolocation lock established.\nDo not deviate.',
  },
  {
    id: 'mcp_scan_1',
    entity: 'MCP',
    intensity: 1,
    weekRange: [1, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    text: '[MCP//SCAN]\nPerimeter check complete.\nNo anomalies detected… for now.',
  },

  // =========================================================================
  // WEEK 2 — Compare qualche SHADOW, più aggressivo
  // =========================================================================
  {
    id: 'shadow_probe_1',
    entity: 'SHADOW',
    intensity: 2,
    weekRange: [2, 4],
    blocking: true,
    allowOnAllProtectedRoutes: true,
    weight: 3,
    text: '[SHADOW//PROTOCOL]\nYour route is noisy, Echo.\nWe see your pattern.',
    chainId: 'shadow_probe_chain',
  },
  {
    id: 'mcp_probe_response',
    entity: 'MCP',
    intensity: 2,
    weekRange: [2, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 0, // Non selezionato casualmente, solo via chain
    text: '[MCP//COUNTER]\nShadow signal intercepted.\nYour pattern is protected.',
    followsAfterId: 'shadow_probe_1',
  },
  {
    id: 'shadow_trace_1',
    entity: 'SHADOW',
    intensity: 2,
    weekRange: [2, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    text: '[SHADOW//TRACE]\nSignal acquired.\nYou cannot hide from the protocol.',
  },

  // =========================================================================
  // WEEK 3 — SHADOW disturba, MCP interviene (CATENE)
  // =========================================================================
  {
    id: 'shadow_cut_1',
    entity: 'SHADOW',
    intensity: 2,
    weekRange: [3, 4],
    blocking: true,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    text: '[SHADOW//CUT]\nConnection compromised.\nYour advantage is… temporary.',
    chainId: 'shadow_cut_chain',
  },
  {
    id: 'mcp_cut_response',
    entity: 'MCP',
    intensity: 2,
    weekRange: [3, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 0,
    text: '[MCP//RESTORE]\nConnection restored.\nShadow interference neutralized.',
    followsAfterId: 'shadow_cut_1',
  },
  {
    id: 'mcp_counter_1',
    entity: 'MCP',
    intensity: 2,
    weekRange: [3, 4],
    blocking: true,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    text: '[MCP//OVERRIDE: ACTIVE]\nShadow signal disrupted.\nYou have a few seconds. Move.',
  },
  {
    id: 'mcp_defense_1',
    entity: 'MCP',
    intensity: 2,
    weekRange: [3, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    text: '[MCP//DEFENSE]\nFirewall holding.\nShadow breach contained.',
  },

  // =========================================================================
  // WEEK 4 — Scontri veri, overlay più forti
  // =========================================================================
  {
    id: 'shadow_hunt_1',
    entity: 'SHADOW',
    intensity: 3,
    weekRange: [4, 4],
    blocking: true,
    allowOnAllProtectedRoutes: true,
    weight: 3,
    text: '[SHADOW//HUNT]\nYou are not hunting prizes.\nYou are being profiled.',
    chainId: 'shadow_hunt_chain',
  },
  {
    id: 'mcp_hunt_response',
    entity: 'MCP',
    intensity: 3,
    weekRange: [4, 4],
    blocking: true,
    allowOnAllProtectedRoutes: true,
    weight: 0,
    text: '[MCP//DIRECTIVE]\nProfile compromised.\nInitiating emergency extraction protocol.',
    followsAfterId: 'shadow_hunt_1',
  },
  {
    id: 'mcp_directive_1',
    entity: 'MCP',
    intensity: 3,
    weekRange: [4, 4],
    blocking: true,
    allowOnAllProtectedRoutes: true,
    weight: 3,
    text: '[MCP//PRIMARY DIRECTIVE]\nShadow Protocol escalation confirmed.\nTrust your coordinates. Distrust everything else.',
  },
  {
    id: 'shadow_final_1',
    entity: 'SHADOW',
    intensity: 3,
    weekRange: [4, 4],
    blocking: true,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    text: '[SHADOW//ENDGAME]\nThe prize was never yours.\nIt was bait.',
  },

  // =========================================================================
  // ECHO — Entità collettiva (tutte le settimane)
  // =========================================================================
  {
    id: 'echo_whisper_1',
    entity: 'ECHO',
    intensity: 1,
    weekRange: [0, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 1,
    text: '[ECHO//NETWORK]\nOthers are moving.\nYour silence is a signal too.',
  },
  {
    id: 'echo_sync_1',
    entity: 'ECHO',
    intensity: 1,
    weekRange: [2, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 1,
    text: '[ECHO//SYNC]\nCollective signal rising.\nThe network remembers.',
  },
  {
    id: 'echo_pulse_1',
    entity: 'ECHO',
    intensity: 2,
    weekRange: [3, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 1,
    text: '[ECHO//PULSE]\nWe are many. We are one.\nYour frequency has been logged.',
  },

  // =========================================================================
  // TRIGGER CONTESTUALI — BUZZ
  // =========================================================================
  {
    id: 'shadow_buzz_1',
    entity: 'SHADOW',
    intensity: 2,
    weekRange: [0, 4],
    blocking: true,
    allowOnAllProtectedRoutes: true,
    weight: 3,
    trigger: 'buzz',
    text: '[SHADOW//INTERCEPT]\nYou weren\'t supposed to find this.\nNow we know your method.',
  },
  {
    id: 'mcp_buzz_1',
    entity: 'MCP',
    intensity: 1,
    weekRange: [0, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    trigger: 'buzz',
    text: '[MCP//CONFIRMATION]\nClue verified.\nShadow interference minimal.',
  },

  // =========================================================================
  // TRIGGER CONTESTUALI — MAP
  // =========================================================================
  {
    id: 'shadow_map_1',
    entity: 'SHADOW',
    intensity: 2,
    weekRange: [0, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 3,
    trigger: 'map',
    text: '[SHADOW//TRACE]\nYour route is compromised.\nWe mapped it before you did.',
  },
  {
    id: 'mcp_map_1',
    entity: 'MCP',
    intensity: 1,
    weekRange: [0, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    trigger: 'map',
    text: '[MCP//SCAN]\nMap sector analyzed.\nProceed with caution.',
  },

  // =========================================================================
  // TRIGGER CONTESTUALI — REWARD
  // =========================================================================
  {
    id: 'shadow_reward_1',
    entity: 'SHADOW',
    intensity: 2,
    weekRange: [0, 4],
    blocking: true,
    allowOnAllProtectedRoutes: true,
    weight: 3,
    trigger: 'reward',
    text: '[SHADOW//DISPUTE]\nSTOP.\nThat reward is under protocol dispute.',
  },
  {
    id: 'mcp_reward_1',
    entity: 'MCP',
    intensity: 1,
    weekRange: [0, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    trigger: 'reward',
    text: '[MCP//VERIFIED]\nReward authenticated.\nShadow claim rejected.',
  },

  // =========================================================================
  // TRIGGER CONTESTUALI — LEADERBOARD
  // =========================================================================
  {
    id: 'shadow_leaderboard_1',
    entity: 'SHADOW',
    intensity: 2,
    weekRange: [0, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 3,
    trigger: 'leaderboard',
    text: '[SHADOW//SUSPICION]\nClimbing so fast?\nSuspicious.',
  },
  {
    id: 'echo_leaderboard_1',
    entity: 'ECHO',
    intensity: 1,
    weekRange: [0, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    trigger: 'leaderboard',
    text: '[ECHO//RANK]\nYour position is noted.\nThe collective watches.',
  },

  // =========================================================================
  // 🆕 v5: TEMPLATES WITH CTA (Interactive Call-to-Action)
  // =========================================================================
  
  // CTA → Intelligence (from Map)
  {
    id: 'shadow_cta_intelligence_1',
    entity: 'SHADOW',
    intensity: 2,
    weekRange: [0, 4],
    blocking: true,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    trigger: 'map',
    text: '[SHADOW//INTERCEPT]\nYour route is compromised.\nWe tracked your movements.',
    ctaLabel: 'CHECK INTELLIGENCE',
    ctaRoute: '/intelligence',
    ctaType: 'primary',
  },
  {
    id: 'mcp_cta_intelligence_1',
    entity: 'MCP',
    intensity: 1,
    weekRange: [0, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    trigger: 'buzz',
    text: '[MCP//ALERT]\nAnomaly logged near your last BUZZ.\nReview recommended.',
    ctaLabel: 'OPEN INTELLIGENCE',
    ctaRoute: '/intelligence',
    ctaType: 'secondary',
  },

  // CTA → Map (from Leaderboard/Home)
  {
    id: 'shadow_cta_map_1',
    entity: 'SHADOW',
    intensity: 2,
    weekRange: [0, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    trigger: 'leaderboard',
    text: '[SHADOW//TRACE]\nTheir numbers are rising.\nYour position is vulnerable.',
    ctaLabel: 'OPEN MAP',
    ctaRoute: '/map-3d-tiler',
    ctaType: 'primary',
  },
  {
    id: 'mcp_cta_map_1',
    entity: 'MCP',
    intensity: 1,
    weekRange: [0, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    text: '[MCP//DIRECTIVE]\nNew sector available.\nCoordinates updated.',
    ctaLabel: 'CHECK MAP',
    ctaRoute: '/map-3d-tiler',
    ctaType: 'secondary',
  },

  // CTA → Leaderboard (from Map/Home)
  {
    id: 'echo_cta_leaderboard_1',
    entity: 'ECHO',
    intensity: 1,
    weekRange: [0, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    text: '[ECHO//COLLECTIVE]\nThe network is shifting.\nRankings have changed.',
    ctaLabel: 'VIEW RANKINGS',
    ctaRoute: '/leaderboard',
    ctaType: 'secondary',
  },
  {
    id: 'shadow_cta_leaderboard_1',
    entity: 'SHADOW',
    intensity: 2,
    weekRange: [1, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 1,
    trigger: 'reward',
    text: '[SHADOW//MONITOR]\nYou claimed a prize.\nNow everyone knows your position.',
    ctaLabel: 'CHECK STANDINGS',
    ctaRoute: '/leaderboard',
    ctaType: 'primary',
  },

  // CTA → BUZZ (from Intelligence/Home)
  {
    id: 'mcp_cta_buzz_1',
    entity: 'MCP',
    intensity: 1,
    weekRange: [0, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    text: '[MCP//OPPORTUNITY]\nClue signal detected nearby.\nAct before Shadow intercepts.',
    ctaLabel: 'START BUZZ',
    ctaRoute: '/buzz',
    ctaType: 'primary',
  },

  // =========================================================================
  // 🆕 v6: TEMPLATES WITH ADVANCED CTA ACTIONS
  // =========================================================================
  
  // Highlight BUZZ button
  {
    id: 'mcp_highlight_buzz',
    entity: 'MCP',
    intensity: 1,
    weekRange: [0, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 1,
    text: '[MCP//DIRECTIVE]\nYour next move awaits.\nThe BUZZ button pulses with opportunity.',
    ctaAction: { type: 'pulseBuzzButton' },
  },
  
  // Shadow interrupt for map spam
  {
    id: 'shadow_map_interrupt',
    entity: 'SHADOW',
    intensity: 2,
    weekRange: [0, 4],
    blocking: true,
    allowOnAllProtectedRoutes: true,
    weight: 0, // Not random, triggered programmatically
    trigger: 'map',
    text: '[SHADOW//INTERCEPT]\nStop scanning.\nWe already scanned you.',
  },
  
  // Shadow ambition warning (leaderboard spam)
  {
    id: 'shadow_ambition_warning',
    entity: 'SHADOW',
    intensity: 2,
    weekRange: [0, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 2,
    trigger: 'leaderboard',
    text: '[SHADOW//OBSERVATION]\nAmbition makes you visible, Echo.\nWe see every rank you climb.',
  },
  
  // Whisper after reward
  {
    id: 'shadow_reward_whisper',
    entity: 'SHADOW',
    intensity: 1,
    weekRange: [0, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 1,
    trigger: 'reward',
    text: '[SHADOW//WHISPER]\nEnjoy it while it lasts.\nNothing is truly yours.',
    ctaAction: { type: 'triggerWhisper', message: 'We are watching...' },
  },
  
  // MCP guidance to intelligence
  {
    id: 'mcp_intelligence_guidance',
    entity: 'MCP',
    intensity: 1,
    weekRange: [1, 4],
    blocking: false,
    allowOnAllProtectedRoutes: true,
    weight: 1,
    text: '[MCP//INTEL]\nNew intercepts available.\nThe Intelligence panel awaits your review.',
    ctaLabel: 'REVIEW INTEL',
    ctaRoute: '/intelligence',
    ctaType: 'primary',
    ctaAction: { type: 'redirect', path: '/intelligence' },
  },
];

// ============================================================================
// HELPER: Get templates filtered by context trigger
// ============================================================================

export const getTemplatesForContext = (
  context: ShadowContextTrigger,
  phase: MissionPhase
): ShadowMessageTemplate[] => {
  if (!FULL_WAR_ENABLED && phase === 0) {
    // In soft mode, Week 0 solo MCP
    return SHADOW_MESSAGE_TEMPLATES.filter(
      (t) =>
        t.trigger === context &&
        t.entity === 'MCP' &&
        t.weekRange[0] <= phase &&
        t.weekRange[1] >= phase
    );
  }

  return SHADOW_MESSAGE_TEMPLATES.filter(
    (t) =>
      t.trigger === context &&
      t.weekRange[0] <= phase &&
      t.weekRange[1] >= phase &&
      t.weight > 0 // Escludi template con weight 0 (usati solo per catene)
  );
};

// ============================================================================
// HELPER: Get chain response template
// ============================================================================

export const getChainResponseTemplate = (
  triggerId: string
): ShadowMessageTemplate | null => {
  return SHADOW_MESSAGE_TEMPLATES.find((t) => t.followsAfterId === triggerId) || null;
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
