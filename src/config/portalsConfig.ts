// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ PORTALS BEHAVIOR CONFIGURATION v1.2 — FINAL PRE-LAUNCH
// 
// This file defines the behavior logic for each portal on the map.
// Portals are front-end only interactions - no backend changes.

// ============================================================================
// TYPES
// ============================================================================

export type PortalBehaviorType =
  | 'MCP_PROTECTED'           // Nice - requires BUZZ activity
  | 'SHADOW_RED_ZONE'         // Paris - heavy glitch + warning
  | 'GEO_VORTEX'              // Tripoli - camera swirl effect
  | 'PULSE_BREAKER'           // Madrid - Pulse Breaker placeholder
  | 'ECHO_ARCHIVE'            // Reykjavik - cryptic lore
  | 'SHADOW_INTERFERENCE'     // Dubai - brief interference
  | 'GLOBAL_GLITCH_LOCKDOWN'  // Hong Kong - 60s lockdown
  | 'AGENT_MIRROR'            // Bali - stats display
  | 'LOST_FREQUENCY'          // Osaka - radio disturbance
  | 'GATEWAY_ZERO'            // PNG - sealed gateway
  | 'HOLLYWOOD_GATE'          // LA - level 19 required
  | 'SHADOW_NEXUS';           // Tokyo - convergence point

export interface PortalReward {
  type: 'clue' | 'm1u' | 'hint' | 'random' | 'none';
  amount?: number;
  label: string;
  visualOnly: boolean;
}

export interface PortalRequirement {
  type: 'buzz_count' | 'buzz_map_count' | 'none';
  minBuzz?: number;
  minBuzzMap?: number;
  label: string;
}

export interface PortalDialogue {
  entity: 'MCP' | 'SHADOW' | 'ECHO';
  lines: string[];
}

export interface PortalBehaviorConfig {
  id: string;
  cityLabel: string;
  type: PortalBehaviorType;
  dialogueUnlocked: PortalDialogue[];
  dialogueLocked?: PortalDialogue[];
  requirement?: PortalRequirement;
  reward?: PortalReward;
  effects: {
    glitch?: 'light' | 'heavy' | 'global';
    cameraSwirl?: boolean;
    lockdown?: number;
    audio?: 'static' | 'radio' | 'none';
  };
  loreFragments?: string[];
  puzzles?: string[];
}

// ============================================================================
// ECHO ARCHIVE LORE FRAGMENTS
// ============================================================================

const ECHO_LORE_FRAGMENTS = [
  '"The map remembers what you forgot."',
  '"Signal 7.26 was never decoded."',
  '"They built the grid before the city."',
  '"One prize was hidden twice."',
  '"The coordinates shift at midnight."',
];

// ============================================================================
// LOST FREQUENCY PUZZLES
// ============================================================================

const LOST_FREQUENCY_PUZZLES = [
  '"Decode this frequency." — Signal: 7.26.M1',
  '"What has keys but opens no locks?" — An old signal from ECHO.',
  '"I speak without a mouth. I hear without ears." — Interference pattern detected.',
  '"The more you take, the more you leave behind." — Shadow trace incomplete.',
];

// ============================================================================
// PORTAL BEHAVIORS CONFIGURATION — FINAL v1.2
// ============================================================================

export const PORTAL_BEHAVIORS: PortalBehaviorConfig[] = [
  // ━━━━━━━━ 1. NICE — MCP PROTECTED ACCESS ━━━━━━━━
  {
    id: 'p_nice',
    cityLabel: 'Portal – Nice',
    type: 'MCP_PROTECTED',
    requirement: {
      type: 'buzz_count',
      minBuzz: 5,
      minBuzzMap: 1,
      label: 'ACCESS LEVEL 04 REQUIRED',
    },
    dialogueUnlocked: [
      { entity: 'MCP', lines: ['ACCESS LEVEL 04 CONFIRMED.', 'Classified reward unlocked.'] },
    ],
    dialogueLocked: [
      { entity: 'MCP', lines: ['ACCESS LEVEL 04 REQUIRED.', 'Only agents with sufficient activity may enter.'] },
    ],
    reward: {
      type: 'random', // +100 M1U OR 1 free clue
      amount: 100,
      label: '+100 M1U or 1 FREE CLUE',
      visualOnly: true,
    },
    effects: { glitch: 'light' },
  },

  // ━━━━━━━━ 2. MILAN — SHADOW RED ZONE ━━━━━━━━
  {
    id: 'p_milan',
    cityLabel: 'Portal – Milan',
    type: 'SHADOW_RED_ZONE',
    dialogueUnlocked: [
      { entity: 'SHADOW', lines: ['You should not be here, Agent.'] },
    ],
    reward: {
      type: 'hint',
      label: '+1 clue fragment detected...',
      visualOnly: true,
    },
    effects: { glitch: 'heavy' },
  },

  // ━━━━━━━━ 3. TRIPOLI — GEOGRAPHIC VORTEX ━━━━━━━━
  {
    id: 'p_tripoli',
    cityLabel: 'Portal – Tripoli',
    type: 'GEO_VORTEX',
    dialogueUnlocked: [
      { entity: 'MCP', lines: ['Geospatial anomaly detected.', 'Re-aligning coordinates...'] },
    ],
    effects: { cameraSwirl: true, glitch: 'light' },
  },

  // ━━━━━━━━ 4. MADRID — PULSE BREAKER (PLACEHOLDER) ━━━━━━━━
  {
    id: 'p_madrid',
    cityLabel: 'Portal – Madrid',
    type: 'PULSE_BREAKER',
    dialogueUnlocked: [
      { entity: 'MCP', lines: ['Pulse Breaker prototype.', 'Full module coming soon.'] },
    ],
    effects: { glitch: 'light' },
  },

  // ━━━━━━━━ 5. REYKJAVIK — ECHO ARCHIVE ━━━━━━━━
  {
    id: 'p_reyk',
    cityLabel: 'Portal – Reykjavik',
    type: 'ECHO_ARCHIVE',
    dialogueUnlocked: [
      { entity: 'ECHO', lines: ['Accessing discontinued data fragments…'] },
    ],
    loreFragments: ECHO_LORE_FRAGMENTS,
    effects: { glitch: 'light', audio: 'static' },
  },

  // ━━━━━━━━ 6. DUBAI — SHADOW INTERFERENCE FIELD ━━━━━━━━
  {
    id: 'p_dubai',
    cityLabel: 'Portal – Dubai',
    type: 'SHADOW_INTERFERENCE',
    dialogueUnlocked: [
      { entity: 'SHADOW', lines: ['Signal compromised.', 'Compensation granted.'] },
    ],
    reward: {
      type: 'm1u',
      amount: 20,
      label: '+20 M1U',
      visualOnly: true,
    },
    effects: { glitch: 'heavy' },
  },

  // ━━━━━━━━ 7. HONG KONG — GLOBAL GLITCH LOCKDOWN ━━━━━━━━
  {
    id: 'p_hk',
    cityLabel: 'Portal – Hong Kong',
    type: 'GLOBAL_GLITCH_LOCKDOWN',
    dialogueUnlocked: [
      { entity: 'SHADOW', lines: ['System lockdown initiated.'] },
    ],
    effects: { glitch: 'global', lockdown: 60 },
  },

  // ━━━━━━━━ 8. BALI — AGENT MIRROR ━━━━━━━━
  {
    id: 'p_bali',
    cityLabel: 'Portal – Bali',
    type: 'AGENT_MIRROR',
    dialogueUnlocked: [
      { entity: 'MCP', lines: ['Your path is unfolding.', 'Observe carefully.'] },
    ],
    effects: {},
  },

  // ━━━━━━━━ 9. OSAKA — THE LOST FREQUENCY ━━━━━━━━
  {
    id: 'p_osaka',
    cityLabel: 'Portal – Osaka',
    type: 'LOST_FREQUENCY',
    dialogueUnlocked: [
      { entity: 'SHADOW', lines: ["You shouldn't have tuned this frequency."] },
    ],
    puzzles: LOST_FREQUENCY_PUZZLES,
    effects: { glitch: 'heavy', audio: 'radio' },
  },

  // ━━━━━━━━ 10. PNG — GATEWAY TO MISSION ZERO ━━━━━━━━
  {
    id: 'p_png',
    cityLabel: 'Portal – Papua New Guinea',
    type: 'GATEWAY_ZERO',
    dialogueUnlocked: [
      { entity: 'MCP', lines: ['Gateway sealed. Protocol Zero pending.'] },
      { entity: 'SHADOW', lines: ["You're not ready."] },
    ],
    effects: { glitch: 'heavy' },
  },

  // ━━━━━━━━ 11. LA — HOLLYWOOD GATE ━━━━━━━━
  {
    id: 'p_la',
    cityLabel: 'Portal – Los Angeles',
    type: 'HOLLYWOOD_GATE',
    requirement: {
      type: 'buzz_map_count',
      minBuzzMap: 19,
      label: 'ACCESS LEVEL 19 REQUIRED',
    },
    dialogueUnlocked: [
      { entity: 'MCP', lines: ['Hollywood Gate — Coming Soon.'] },
    ],
    dialogueLocked: [
      { entity: 'MCP', lines: ['ACCESS DENIED — Level 19 required.', 'Create more BUZZ MAP areas to unlock.'] },
    ],
    effects: { glitch: 'light' },
  },

  // ━━━━━━━━ 12. TOKYO — SHADOW NEXUS ━━━━━━━━
  {
    id: 'p_tokyo',
    cityLabel: 'Portal – Tokyo',
    type: 'SHADOW_NEXUS',
    dialogueUnlocked: [
      { entity: 'SHADOW', lines: ['Convergence point detected.'] },
      { entity: 'ECHO', lines: ['...signals converge here...', '...be careful what you seek...'] },
    ],
    effects: { glitch: 'heavy', audio: 'static' },
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getPortalBehavior(portalId: string): PortalBehaviorConfig | undefined {
  return PORTAL_BEHAVIORS.find(p => p.id === portalId);
}

export function getRandomLoreFragment(portalId: string): string {
  const config = getPortalBehavior(portalId);
  if (!config?.loreFragments?.length) return '';
  return config.loreFragments[Math.floor(Math.random() * config.loreFragments.length)];
}

export function getRandomPuzzle(portalId: string): string {
  const config = getPortalBehavior(portalId);
  if (!config?.puzzles?.length) return '';
  return config.puzzles[Math.floor(Math.random() * config.puzzles.length)];
}

/**
 * Get random reward for Nice portal
 */
export function getRandomNiceReward(): { type: 'm1u' | 'clue'; label: string } {
  const random = Math.random();
  if (random > 0.5) {
    return { type: 'm1u', label: '+100 M1U' };
  }
  return { type: 'clue', label: '1 FREE CLUE' };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
