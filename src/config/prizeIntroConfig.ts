// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ PRIZE INTRO CINEMATIC SYSTEM - Configuration
// This file defines the prizes shown in the Prize Intro Overlay
// 
// 📷 JOSEPH: Replace imageUrl values with real prize images
// Format: Use imports for local images or URLs for remote images

// ============================================================================
// TYPES
// ============================================================================

export interface PrizeVisual {
  id: string;
  imageUrl: string;           // 📷 JOSEPH: Replace with real image URL or import
  label: string;              // Short name (e.g., "Lamborghini Huracán")
  tagline: string;            // 1-line hook
  category: 'vehicle' | 'watch' | 'jewelry' | 'fashion' | 'experience';
  isPrimaryCandidate: boolean; // true = could be the real prize for this mission
  estimatedValue?: string;    // Optional: "€180,000" etc.
}

export type PrizeIntroMode = 'cinematic' | 'carousel';

export interface SecondaryPrizesHint {
  count: number;
  copy: string;
}

export type PrizeIntroEntity = 'SHADOW' | 'MCP' | 'ECHO';

export interface PrizeIntroDialogue {
  entity: PrizeIntroEntity;
  lines: string[];
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * PRIZE_INTRO_MODE - Controls how prizes are displayed
 * 
 * 'cinematic': Auto-playing sequence, no skip until end (DEFAULT)
 * 'carousel': User can swipe/scroll between prizes
 */
export const PRIZE_INTRO_MODE: PrizeIntroMode = 'cinematic';

/**
 * PRIZE_DISPLAY_DURATION_MS - How long each prize is shown in cinematic mode
 */
export const PRIZE_DISPLAY_DURATION_MS = 3000; // 3 seconds per prize

/**
 * PRIZE_TRANSITION_DURATION_MS - Animation duration between prizes
 */
export const PRIZE_TRANSITION_DURATION_MS = 800;

// ============================================================================
// 📷 PRIZE IMAGES - Configured for /public/prizes/
// ============================================================================

/**
 * CURRENT_MISSION_PRIZES - The prizes shown in the intro
 * 
 * Images are located in /public/prizes/
 * To add new images, place them in /public/prizes/ and update this array.
 * 
 * 📸 REQUIRED FILES in /public/prizes/:
 * - prize-1.jpg (Lamborghini Revuelto)
 * - prize-2.jpg (Rolex Submariner Gold)
 * - prize-3.jpg (Rolex Submariner Silver)
 * - prize-4.jpg (Rolex Day-Date)
 * - prize-5.jpg (Diamonds Collection)
 * - prize-6.jpg (Ducati Panigale V4)
 * - prize-7.jpg (Hermès Birkin Tan)
 * - prize-8.jpg (Chanel Classic Flap)
 * - prize-9.jpg (Hermès Birkin Crocodile)
 * - prize-10.jpg (YSL Envelope)
 */
export const CURRENT_MISSION_PRIZES: PrizeVisual[] = [
  // =========================================================================
  // 🚗 VEHICLES
  // =========================================================================
  {
    id: 'prize-lambo-revuelto',
    imageUrl: '/prizes/prize-1.jpg',
    label: 'Lamborghini Revuelto',
    tagline: 'High-voltage hunt.',
    category: 'vehicle',
    isPrimaryCandidate: true,
    estimatedValue: '€500,000+',
  },
  {
    id: 'prize-ducati-v4',
    imageUrl: '/prizes/prize-6.jpg',
    label: 'Ducati Panigale V4',
    tagline: 'Pure Italian adrenaline.',
    category: 'vehicle',
    isPrimaryCandidate: true,
    estimatedValue: '€35,000+',
  },

  // =========================================================================
  // ⌚ WATCHES
  // =========================================================================
  {
    id: 'prize-rolex-gold',
    imageUrl: '/prizes/prize-2.jpg',
    label: 'Rolex Submariner Gold',
    tagline: 'Time is a weapon.',
    category: 'watch',
    isPrimaryCandidate: true,
    estimatedValue: '€38,000+',
  },
  {
    id: 'prize-rolex-silver',
    imageUrl: '/prizes/prize-3.jpg',
    label: 'Rolex Submariner',
    tagline: 'Precision under pressure.',
    category: 'watch',
    isPrimaryCandidate: true,
    estimatedValue: '€12,000+',
  },
  {
    id: 'prize-rolex-daydate',
    imageUrl: '/prizes/prize-4.jpg',
    label: 'Rolex Day-Date',
    tagline: 'The president\'s choice.',
    category: 'watch',
    isPrimaryCandidate: true,
    estimatedValue: '€40,000+',
  },

  // =========================================================================
  // 💎 JEWELRY
  // =========================================================================
  {
    id: 'prize-diamonds',
    imageUrl: '/prizes/prize-5.jpg',
    label: 'Diamond Collection',
    tagline: 'Clarity under fire.',
    category: 'jewelry',
    isPrimaryCandidate: true,
    estimatedValue: '€50,000+',
  },

  // =========================================================================
  // 👜 FASHION
  // =========================================================================
  {
    id: 'prize-hermes-birkin',
    imageUrl: '/prizes/prize-7.jpg',
    label: 'Hermès Birkin',
    tagline: 'Luxury under pressure.',
    category: 'fashion',
    isPrimaryCandidate: true,
    estimatedValue: '€15,000+',
  },
  {
    id: 'prize-hermes-croc',
    imageUrl: '/prizes/prize-9.jpg',
    label: 'Hermès Birkin Crocodile',
    tagline: 'The rarest of the rare.',
    category: 'fashion',
    isPrimaryCandidate: true,
    estimatedValue: '€80,000+',
  },
  {
    id: 'prize-chanel-classic',
    imageUrl: '/prizes/prize-8.jpg',
    label: 'Chanel Classic Flap',
    tagline: 'Timeless elegance.',
    category: 'fashion',
    isPrimaryCandidate: true,
    estimatedValue: '€10,000+',
  },
  {
    id: 'prize-ysl-envelope',
    imageUrl: '/prizes/prize-10.jpg',
    label: 'Saint Laurent Envelope',
    tagline: 'Parisian edge.',
    category: 'fashion',
    isPrimaryCandidate: true,
    estimatedValue: '€3,000+',
  },
];

// ============================================================================
// SECONDARY PRIZES HINT
// ============================================================================

/**
 * SECONDARY_PRIZES_HINT - Information about the 99 secondary prizes
 */
export const SECONDARY_PRIZES_HINT: SecondaryPrizesHint = {
  count: 99,
  copy: 'Scattered across the map, 99 secondary prizes wait for agents who don\'t blink.',
};

// ============================================================================
// DIALOGUE SCRIPTS - ENTITY NARRATIVES
// ============================================================================

/**
 * SHADOW_INTRO_DIALOGUE - SHADOW's perspective on the prizes
 * Used when SHADOW is the lead narrator
 */
export const SHADOW_INTRO_DIALOGUE: PrizeIntroDialogue = {
  entity: 'SHADOW',
  lines: [
    '[SHADOW//PRIZE_HUNT]',
    '',
    '"You\'re not the only one hunting these.',
    'Agents want them. We want them.',
    '',
    'Only one is real this Mission.',
    'Try not to pick wrong."',
  ],
};

/**
 * MCP_INTRO_DIALOGUE - MCP's perspective on the prizes
 * Used when MCP is the lead narrator
 */
export const MCP_INTRO_DIALOGUE: PrizeIntroDialogue = {
  entity: 'MCP',
  lines: [
    '[MCP//BRIEFING: PRIZE]',
    '',
    '"A real-world prize is active.',
    'Shadow is already moving.',
    '',
    'Only one of these is linked to this Mission.',
    'The others are noise… for now."',
  ],
};

/**
 * ECHO_INTRO_DIALOGUE - ECHO's cryptic commentary
 * Used as secondary voice or in night mode
 */
export const ECHO_INTRO_DIALOGUE: PrizeIntroDialogue = {
  entity: 'ECHO',
  lines: [
    '[ECHO//SIGNAL]',
    '',
    '"...we see what they offer...',
    '...but not what they hide...',
    '',
    '...choose carefully, agent...',
    '...we cannot help you twice..."',
  ],
};

// ============================================================================
// FINAL REVEAL MESSAGES
// ============================================================================

/**
 * PRIZE_REVEAL_MESSAGE - Shown after all prizes are displayed
 */
export const PRIZE_REVEAL_MESSAGE = 'Only one of these is the real target for this Mission.';

/**
 * CTA_BUTTON_TEXT - Text for the call-to-action button
 */
export const CTA_BUTTON_TEXT = 'ENTER THE HUNT';

// ============================================================================
// TIMING CONFIGURATION
// ============================================================================

export const PRIZE_INTRO_TIMING = {
  /** Initial fade-in delay before first prize */
  INITIAL_DELAY_MS: 500,
  /** How long each prize image is displayed */
  PRIZE_DISPLAY_MS: 3000,
  /** Transition animation duration */
  TRANSITION_MS: 800,
  /** Typing speed for dialogue (ms per character) */
  TYPING_SPEED_MS: 30,
  /** Delay after final prize before showing CTA */
  FINAL_DELAY_MS: 1500,
  /** Minimum time before user can skip (even in carousel mode) */
  MIN_VIEW_TIME_MS: 2000,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a random subset of prizes for the intro
 * Useful if you want to show only N prizes per session
 */
export function getRandomPrizes(count: number = 5): PrizeVisual[] {
  const shuffled = [...CURRENT_MISSION_PRIZES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get prizes by category
 */
export function getPrizesByCategory(category: PrizeVisual['category']): PrizeVisual[] {
  return CURRENT_MISSION_PRIZES.filter(p => p.category === category);
}

/**
 * Get the primary dialogue based on time of day
 * Night (02:00-05:00) uses SHADOW, day uses MCP
 */
export function getPrimaryDialogue(): PrizeIntroDialogue {
  const hour = new Date().getHours();
  const isNight = hour >= 2 && hour < 5;
  return isNight ? SHADOW_INTRO_DIALOGUE : MCP_INTRO_DIALOGUE;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

