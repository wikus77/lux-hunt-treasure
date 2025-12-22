/**
 * FIRST SESSION DISCOVERY — M1SSION™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Centralized configuration for first-session guided discovery.
 * All new behaviors are gated behind DISCOVERY_MODE_ENABLED flag.
 * ROLLBACK: Set DISCOVERY_MODE_ENABLED = false and redeploy.
 */

// ═══════════════════════════════════════════════════════════════
// 🎚️ MASTER SWITCH — Set to false to disable all discovery features
// ═══════════════════════════════════════════════════════════════
export const DISCOVERY_MODE_ENABLED = true;

// ═══════════════════════════════════════════════════════════════
// 📝 HUD OVERLAY CONFIG
// ═══════════════════════════════════════════════════════════════
export const MAP_HUD_CONFIG = {
  /** Main title line */
  line1: 'One real prize is hidden near you.',
  /** Instruction line */
  line2: 'Explore the map to get closer.',
  /** Call to action */
  line3: 'Start exploring.',
  /** Auto-hide after this many milliseconds (0 = never auto-hide) */
  autoHideAfterMs: 20000,
  /** Hide immediately on first map interaction */
  hideOnInteraction: true,
};

// ═══════════════════════════════════════════════════════════════
// 🎯 MICRO-MISSIONS CONFIG
// ═══════════════════════════════════════════════════════════════
export const MICRO_MISSIONS_CONFIG = {
  steps: [
    { id: 1, trigger: 'map_interaction', message: '🗺️ Great! You explored the map.' },
    { id: 2, trigger: 'marker_or_buzz_tap', message: '📍 Nice! You found something.' },
    { id: 3, trigger: 'buzz_page_visit', message: '🎉 You discovered Buzz!' },
  ],
  /** Toast display duration in ms */
  toastDurationMs: 3000,
};

// ═══════════════════════════════════════════════════════════════
// 💡 BUZZ HELP POPUP CONFIG
// ═══════════════════════════════════════════════════════════════
export const BUZZ_HELP_CONFIG = {
  /** Show popup after this many seconds of no interaction */
  showAfterInactiveSeconds: 30,
  /** Alternative: show if microMissionStep stuck at 0 after this time */
  showIfStuckAtStep0AfterMs: 25000,
  /** Popup title */
  title: 'Need help?',
  /** Popup body text */
  body: 'Buzz reveals something nearby.',
  /** Primary CTA text */
  ctaText: 'Open Buzz',
  /** Secondary dismiss text */
  dismissText: 'Not now',
  /** Route to navigate on CTA click */
  buzzRoute: '/buzz',
};

// ═══════════════════════════════════════════════════════════════
// 🧭 BOTTOM NAV PROGRESSIVE REVEAL CONFIG
// ═══════════════════════════════════════════════════════════════
export const NAV_REVEAL_CONFIG = {
  /** Core tabs that get full emphasis initially */
  coreTabs: ['/home', '/map-3d-tiler', '/buzz'],
  /** Opacity for non-core tabs during first session */
  dimmedOpacity: 0.4,
  /** Full opacity once revealed */
  fullOpacity: 1,
};

// ═══════════════════════════════════════════════════════════════
// 🗄️ LOCALSTORAGE KEYS
// ═══════════════════════════════════════════════════════════════
const KEYS = {
  /** Current micro-mission step (0, 1, 2, 3) */
  MICRO_MISSION_STEP: 'm1_discovery_micro_step',
  /** Whether HUD was dismissed */
  HUD_DISMISSED: 'm1_discovery_hud_dismissed',
  /** Whether Buzz Help popup was shown */
  BUZZ_HELP_SHOWN: 'm1_discovery_buzz_help_shown',
  /** Tabs visited for progressive reveal */
  TABS_VISITED: 'm1_discovery_tabs_visited',
  /** Discovery mode completed (all 3 core tabs visited) */
  DISCOVERY_COMPLETED: 'm1_discovery_completed',
  /** First map interaction timestamp */
  FIRST_INTERACTION_TS: 'm1_discovery_first_interaction_ts',
};

// ═══════════════════════════════════════════════════════════════
// 🔧 GETTERS / SETTERS — No React dependencies
// ═══════════════════════════════════════════════════════════════

/**
 * Check if discovery mode should be active (enabled + first session)
 */
export function isDiscoveryActive(): boolean {
  if (!DISCOVERY_MODE_ENABLED) return false;
  try {
    // Discovery is active if not yet completed
    return localStorage.getItem(KEYS.DISCOVERY_COMPLETED) !== 'true';
  } catch {
    return false;
  }
}

/**
 * Get current micro-mission step (0 = not started, 1-3 = in progress/completed)
 */
export function getMicroMissionStep(): number {
  try {
    const step = localStorage.getItem(KEYS.MICRO_MISSION_STEP);
    return step ? parseInt(step, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Advance micro-mission to next step
 */
export function advanceMicroMission(): number {
  try {
    const current = getMicroMissionStep();
    const next = Math.min(current + 1, 3);
    localStorage.setItem(KEYS.MICRO_MISSION_STEP, String(next));
    console.log(`[Discovery] 🎯 Micro-mission advanced: ${current} → ${next}`);
    return next;
  } catch {
    return 0;
  }
}

/**
 * Check if HUD should be shown
 */
export function shouldShowHUD(): boolean {
  if (!isDiscoveryActive()) return false;
  try {
    return localStorage.getItem(KEYS.HUD_DISMISSED) !== 'true';
  } catch {
    return true;
  }
}

/**
 * Mark HUD as dismissed
 */
export function dismissHUD(): void {
  try {
    localStorage.setItem(KEYS.HUD_DISMISSED, 'true');
    console.log('[Discovery] 📝 HUD dismissed');
  } catch {}
}

/**
 * Record first map interaction
 */
export function recordFirstInteraction(): void {
  try {
    if (!localStorage.getItem(KEYS.FIRST_INTERACTION_TS)) {
      localStorage.setItem(KEYS.FIRST_INTERACTION_TS, String(Date.now()));
      console.log('[Discovery] 🖱️ First interaction recorded');
    }
  } catch {}
}

/**
 * Get time since first interaction (or null if no interaction yet)
 */
export function getTimeSinceFirstInteraction(): number | null {
  try {
    const ts = localStorage.getItem(KEYS.FIRST_INTERACTION_TS);
    if (!ts) return null;
    return Date.now() - parseInt(ts, 10);
  } catch {
    return null;
  }
}

/**
 * Check if Buzz Help popup can be shown (only once per first session)
 */
export function canShowBuzzHelp(): boolean {
  if (!isDiscoveryActive()) return false;
  try {
    return localStorage.getItem(KEYS.BUZZ_HELP_SHOWN) !== 'true';
  } catch {
    return true;
  }
}

/**
 * Mark Buzz Help as shown
 */
export function markBuzzHelpShown(): void {
  try {
    localStorage.setItem(KEYS.BUZZ_HELP_SHOWN, 'true');
    console.log('[Discovery] 💡 Buzz Help shown');
  } catch {}
}

/**
 * Get set of visited tabs
 */
export function getVisitedTabs(): Set<string> {
  try {
    const raw = localStorage.getItem(KEYS.TABS_VISITED);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

/**
 * Record a tab visit
 */
export function recordTabVisit(path: string): void {
  try {
    const visited = getVisitedTabs();
    visited.add(path);
    localStorage.setItem(KEYS.TABS_VISITED, JSON.stringify([...visited]));
    console.log(`[Discovery] 🧭 Tab visited: ${path}`, [...visited]);
    
    // Check if all core tabs visited
    const coreTabs = NAV_REVEAL_CONFIG.coreTabs;
    const allCoreVisited = coreTabs.every(tab => visited.has(tab));
    if (allCoreVisited) {
      completeDiscovery();
    }
  } catch {}
}

/**
 * Check if all core tabs have been visited
 */
export function allCoreTabsVisited(): boolean {
  const visited = getVisitedTabs();
  return NAV_REVEAL_CONFIG.coreTabs.every(tab => visited.has(tab));
}

/**
 * Mark discovery as completed (full nav reveal)
 */
export function completeDiscovery(): void {
  try {
    localStorage.setItem(KEYS.DISCOVERY_COMPLETED, 'true');
    console.log('[Discovery] ✅ Discovery completed - full nav revealed');
  } catch {}
}

/**
 * Check if discovery is completed
 */
export function isDiscoveryCompleted(): boolean {
  try {
    return localStorage.getItem(KEYS.DISCOVERY_COMPLETED) === 'true';
  } catch {
    return false;
  }
}

/**
 * Reset all discovery state (for testing)
 */
export function resetDiscovery(): void {
  try {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
    console.log('[Discovery] 🔄 All discovery state reset');
  } catch {}
}

// Expose reset function to window for debugging
if (typeof window !== 'undefined') {
  (window as any).__resetDiscovery = resetDiscovery;
}

