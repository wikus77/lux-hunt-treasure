// © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
// VIEWPORT HEIGHT UTILITY - Fixes iOS WKWebView 100vh bug
// 
// PROBLEM: In iOS WKWebView, 100vh includes browser UI bars, causing:
// - Content pushed under fixed headers
// - Black gaps at bottom
// - Overlap between sections
//
// SOLUTION: Use visualViewport.height which gives the ACTUAL visible area

let isInitialized = false;
let rafId: number | null = null;

/**
 * Update --app-height CSS variable based on visualViewport
 * This is the CORRECT height for iOS WKWebView
 */
export const updateAppHeight = (): number => {
  if (typeof window === 'undefined') return 0;
  
  // Use visualViewport if available (iOS), fallback to innerHeight
  const vv = window.visualViewport;
  const height = vv?.height ?? window.innerHeight;
  
  // Set CSS variable on document root
  document.documentElement.style.setProperty('--app-height', `${height}px`);
  
  // Also set safe area variables for convenience
  const safeTop = getComputedStyle(document.documentElement).getPropertyValue('--cap-safe-top') || 
                  getComputedSafeArea('safe-area-inset-top');
  const safeBottom = getComputedSafeArea('safe-area-inset-bottom');
  
  document.documentElement.style.setProperty('--app-safe-top', safeTop);
  document.documentElement.style.setProperty('--app-safe-bottom', safeBottom);
  
  // Calculate content area height (minus header and bottom nav)
  const headerHeight = 80; // UnifiedHeader height
  const bottomNavHeight = 64; // BottomNavigation height
  const safeTopPx = parseInt(safeTop) || 0;
  const safeBottomPx = parseInt(safeBottom) || 0;
  
  const contentHeight = height - headerHeight - bottomNavHeight - safeTopPx - safeBottomPx;
  document.documentElement.style.setProperty('--app-content-height', `${Math.max(0, contentHeight)}px`);
  
  return height;
};

/**
 * Get computed safe area inset value
 */
const getComputedSafeArea = (property: string): string => {
  try {
    const div = document.createElement('div');
    div.style.paddingTop = `env(${property}, 0px)`;
    document.body.appendChild(div);
    const computed = getComputedStyle(div).paddingTop;
    document.body.removeChild(div);
    return computed || '0px';
  } catch {
    return '0px';
  }
};

/**
 * Initialize viewport height tracking
 * Call this ONCE at app startup (e.g., in main.tsx)
 */
export const initViewportHeight = (): void => {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;
  
  // Debounced update using RAF
  const debouncedUpdate = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      updateAppHeight();
      rafId = null;
    });
  };
  
  // Initial update
  updateAppHeight();
  
  // Listen to resize events
  window.addEventListener('resize', debouncedUpdate, { passive: true });
  
  // Listen to orientation change (mobile)
  window.addEventListener('orientationchange', () => {
    // Delay update after orientation change settles
    setTimeout(debouncedUpdate, 100);
    setTimeout(debouncedUpdate, 300);
  }, { passive: true });
  
  // Listen to visualViewport events (iOS critical)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', debouncedUpdate, { passive: true });
    window.visualViewport.addEventListener('scroll', debouncedUpdate, { passive: true });
  }
  
  // Also update when keyboard appears/disappears (iOS)
  window.addEventListener('focusin', debouncedUpdate, { passive: true });
  window.addEventListener('focusout', () => {
    // Delay to let keyboard animation complete
    setTimeout(debouncedUpdate, 300);
  }, { passive: true });
  
  console.log('✅ [ViewportHeight] Initialized with height:', updateAppHeight());
};

/**
 * Get current app height value
 */
export const getAppHeight = (): number => {
  const vv = window.visualViewport;
  return vv?.height ?? window.innerHeight;
};

/**
 * Check if there's a viewport mismatch (iOS 100vh bug present)
 */
export const hasViewportMismatch = (): boolean => {
  if (!window.visualViewport) return false;
  const delta = Math.abs(window.innerHeight - window.visualViewport.height);
  return delta > 5; // Allow small tolerance
};

// Auto-initialize if in Capacitor environment
if (typeof window !== 'undefined') {
  // Check for Capacitor marker
  const isCapacitor = (window as any).__CAPACITOR_NATIVE__ === true ||
    document.documentElement?.dataset?.capacitor === 'true' ||
    (window as any).Capacitor?.isNativePlatform?.();
  
  if (isCapacitor) {
    // Initialize immediately for Capacitor
    if (document.readyState === 'complete') {
      initViewportHeight();
    } else {
      window.addEventListener('DOMContentLoaded', initViewportHeight, { once: true });
    }
  }
}

export default {
  init: initViewportHeight,
  update: updateAppHeight,
  getHeight: getAppHeight,
  hasMismatch: hasViewportMismatch,
};

