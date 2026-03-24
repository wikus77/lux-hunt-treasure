/**
 * Floating Pills V3 — config / feature gate (UI layer only).
 * Rollback: set ENABLE_HOME_FLOATING_PILLS_V3 to false (AppHome falls back to HomeSidePillsLayer).
 */

/** Master switch for portaled fixed V3 pills (viewport-fixed on iOS scroll root). */
export const ENABLE_HOME_FLOATING_PILLS_V3 = true;

/** Below UnifiedHeader (9999) and BottomNavigation (10000); above scrolling main (0). */
export const FLOATING_PILLS_V3_Z_INDEX = 9500;

/** DOM id for portal root (devtools / tests). */
export const FLOATING_PILLS_V3_PORTAL_ID = 'm1-floating-pills-v3-portal';
