// © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
// DEV-ONLY Scroll Forensics Utility
// Used to diagnose scroll physics differences between PWA and Native

/**
 * ScrollForensicsSnapshot - captures all relevant scroll/layout state
 * Call from browser console: window.__M1_SCROLL_FORENSICS()
 */
export interface ScrollForensicsSnapshot {
  timestamp: string;
  runtime: {
    isNative: boolean;
    isPWA: boolean;
    platform: string;
    userAgent: string;
    protocol: string;
    bodyClasses: string[];
  };
  viewport: {
    innerWidth: number;
    innerHeight: number;
    visualViewportWidth: number | null;
    visualViewportHeight: number | null;
    visualViewportOffsetTop: number | null;
    documentClientWidth: number;
    documentClientHeight: number;
  };
  safeArea: {
    top: string;
    bottom: string;
    left: string;
    right: string;
  };
  cssVariables: {
    appHeight: string;
    bottomNav: string;
  };
  scrollOwner: {
    documentScrollingElement: string;
    bodyScrollTop: number;
    htmlScrollTop: number;
  };
  elements: {
    [key: string]: {
      exists: boolean;
      overflow: string;
      overflowY: string;
      overflowX: string;
      overscrollBehavior: string;
      webkitOverflowScrolling: string;
      height: string;
      minHeight: string;
      maxHeight: string;
      position: string;
      scrollTop: number;
      scrollHeight: number;
      clientHeight: number;
    } | null;
  };
}

function getComputedValue(el: Element | null, prop: string): string {
  if (!el) return 'N/A';
  return getComputedStyle(el).getPropertyValue(prop) || 'unset';
}

function getElementSnapshot(selector: string): ScrollForensicsSnapshot['elements'][string] {
  const el = document.querySelector(selector) as HTMLElement | null;
  if (!el) return null;
  
  const cs = getComputedStyle(el);
  return {
    exists: true,
    overflow: cs.overflow,
    overflowY: cs.overflowY,
    overflowX: cs.overflowX,
    overscrollBehavior: (cs as any).overscrollBehavior || 'auto',
    webkitOverflowScrolling: (cs as any).webkitOverflowScrolling || 'auto',
    height: cs.height,
    minHeight: cs.minHeight,
    maxHeight: cs.maxHeight,
    position: cs.position,
    scrollTop: el.scrollTop,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
  };
}

function getSafeAreaValue(name: string): string {
  // Create a temporary element to measure safe-area
  const temp = document.createElement('div');
  temp.style.cssText = `position:fixed;top:0;left:0;width:0;height:0;padding-top:env(safe-area-inset-${name}, 0px);`;
  document.body.appendChild(temp);
  const value = getComputedStyle(temp).paddingTop;
  document.body.removeChild(temp);
  return value;
}

export function captureScrollForensics(): ScrollForensicsSnapshot {
  const cap = (window as any).Capacitor;
  const isNative = !!cap?.isNativePlatform?.() || document.body.classList.contains('is-native');
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  
  const vv = window.visualViewport;
  
  return {
    timestamp: new Date().toISOString(),
    runtime: {
      isNative,
      isPWA,
      platform: cap?.getPlatform?.() || 'web',
      userAgent: navigator.userAgent.substring(0, 100),
      protocol: window.location.protocol,
      bodyClasses: Array.from(document.body.classList),
    },
    viewport: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      visualViewportWidth: vv?.width ?? null,
      visualViewportHeight: vv?.height ?? null,
      visualViewportOffsetTop: vv?.offsetTop ?? null,
      documentClientWidth: document.documentElement.clientWidth,
      documentClientHeight: document.documentElement.clientHeight,
    },
    safeArea: {
      top: getSafeAreaValue('top'),
      bottom: getSafeAreaValue('bottom'),
      left: getSafeAreaValue('left'),
      right: getSafeAreaValue('right'),
    },
    cssVariables: {
      appHeight: getComputedStyle(document.documentElement).getPropertyValue('--app-height') || 'unset',
      bottomNav: getComputedStyle(document.documentElement).getPropertyValue('--m1-bottom-nav') || 'unset',
    },
    scrollOwner: {
      documentScrollingElement: document.scrollingElement?.tagName || 'null',
      bodyScrollTop: document.body.scrollTop,
      htmlScrollTop: document.documentElement.scrollTop,
    },
    elements: {
      html: getElementSnapshot('html'),
      body: getElementSnapshot('body'),
      '.m1-single-scroll-root': getElementSnapshot('.m1-single-scroll-root'),
      '.global-layout-content': getElementSnapshot('.global-layout-content'),
      'main': getElementSnapshot('main'),
      '#root': getElementSnapshot('#root'),
    },
  };
}

export function printScrollForensics(): void {
  const snapshot = captureScrollForensics();
  
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║       M1SSION™ SCROLL FORENSICS SNAPSHOT                     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  
  console.log('📱 RUNTIME');
  console.table(snapshot.runtime);
  
  console.log('📐 VIEWPORT');
  console.table(snapshot.viewport);
  
  console.log('🛡️ SAFE AREA');
  console.table(snapshot.safeArea);
  
  console.log('🎨 CSS VARIABLES');
  console.table(snapshot.cssVariables);
  
  console.log('📜 SCROLL OWNER');
  console.table(snapshot.scrollOwner);
  
  console.log('📦 ELEMENTS');
  Object.entries(snapshot.elements).forEach(([selector, data]) => {
    if (data) {
      console.log(`  ${selector}:`);
      console.table(data);
    } else {
      console.log(`  ${selector}: NOT FOUND`);
    }
  });
  
  console.log('');
  console.log('📋 FULL JSON (copy for comparison):');
  console.log(JSON.stringify(snapshot, null, 2));
  
  return;
}

// DEV-ONLY: Expose to window for console access
if (import.meta.env.DEV) {
  (window as any).__M1_SCROLL_FORENSICS = printScrollForensics;
  (window as any).__M1_SCROLL_SNAPSHOT = captureScrollForensics;
  
  console.log('🔬 [DEV] Scroll Forensics loaded. Run: __M1_SCROLL_FORENSICS()');
}
