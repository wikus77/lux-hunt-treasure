// © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
// DEV-ONLY Scroll Forensics Utility
// Used to diagnose scroll physics differences between PWA and Native
// v2: Enhanced with clipping detection, background chain, per-page analysis

/**
 * ScrollForensicsSnapshot - captures all relevant scroll/layout state
 * Call from browser console: window.__M1_SCROLL_FORENSICS()
 */
export interface ElementSnapshot {
  exists: boolean;
  tagName: string;
  className: string;
  overflow: string;
  overflowY: string;
  overflowX: string;
  overscrollBehavior: string;
  webkitOverflowScrolling: string;
  height: string;
  minHeight: string;
  maxHeight: string;
  position: string;
  top: string;
  bottom: string;
  transform: string;
  background: string;
  backgroundColor: string;
  backgroundImage: string;
  clipPath: string;
  contain: string;
  willChange: string;
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  boundingRect: { top: number; bottom: number; height: number };
}

export interface ClippingAncestor {
  selector: string;
  tagName: string;
  overflow: string;
  clipPath: string;
  contain: string;
}

export interface ScrollForensicsSnapshot {
  timestamp: string;
  currentPath: string;
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
    activeScrollContainer: string | null;
  };
  elements: {
    [key: string]: ElementSnapshot | null;
  };
  backgroundChain: {
    headerArea: string[];
    bottomNavArea: string[];
  };
  clippingDetector: {
    targetElement: string;
    clippingAncestors: ClippingAncestor[];
  };
}

function getElementSnapshot(selector: string): ElementSnapshot | null {
  const el = document.querySelector(selector) as HTMLElement | null;
  if (!el) return null;
  
  const cs = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  return {
    exists: true,
    tagName: el.tagName,
    className: el.className.toString().substring(0, 100),
    overflow: cs.overflow,
    overflowY: cs.overflowY,
    overflowX: cs.overflowX,
    overscrollBehavior: (cs as any).overscrollBehavior || 'auto',
    webkitOverflowScrolling: (cs as any).webkitOverflowScrolling || 'auto',
    height: cs.height,
    minHeight: cs.minHeight,
    maxHeight: cs.maxHeight,
    position: cs.position,
    top: cs.top,
    bottom: cs.bottom,
    transform: cs.transform,
    background: cs.background.substring(0, 80),
    backgroundColor: cs.backgroundColor,
    backgroundImage: cs.backgroundImage.substring(0, 80),
    clipPath: cs.clipPath || 'none',
    contain: (cs as any).contain || 'none',
    willChange: cs.willChange,
    scrollTop: el.scrollTop,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
    boundingRect: { top: rect.top, bottom: rect.bottom, height: rect.height },
  };
}

function findClippingAncestors(selector: string): ClippingAncestor[] {
  const el = document.querySelector(selector) as HTMLElement | null;
  if (!el) return [];
  
  const ancestors: ClippingAncestor[] = [];
  let current: HTMLElement | null = el.parentElement;
  
  while (current && current !== document.body) {
    const cs = getComputedStyle(current);
    const overflow = cs.overflow;
    const clipPath = cs.clipPath || 'none';
    const contain = (cs as any).contain || 'none';
    
    // Check if this element might clip content
    if (overflow !== 'visible' || clipPath !== 'none' || (contain !== 'none' && contain !== 'style')) {
      ancestors.push({
        selector: current.tagName + (current.className ? '.' + current.className.toString().split(' ')[0] : ''),
        tagName: current.tagName,
        overflow,
        clipPath,
        contain,
      });
    }
    
    current = current.parentElement;
  }
  
  return ancestors;
}

function getBackgroundChain(area: 'header' | 'bottomNav'): string[] {
  const chain: string[] = [];
  const y = area === 'header' ? 50 : window.innerHeight - 50;
  const x = window.innerWidth / 2;
  
  const elements = document.elementsFromPoint(x, y);
  
  for (const el of elements.slice(0, 8)) {
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor;
    const bgImage = cs.backgroundImage;
    
    if (bg !== 'rgba(0, 0, 0, 0)' || bgImage !== 'none') {
      const tag = el.tagName.toLowerCase();
      const cls = el.className ? `.${el.className.toString().split(' ')[0]}` : '';
      chain.push(`${tag}${cls}: ${bg !== 'rgba(0, 0, 0, 0)' ? bg : bgImage.substring(0, 50)}`);
    }
  }
  
  return chain;
}

function findActiveScrollContainer(): string | null {
  // Check common scroll containers
  const selectors = [
    '.m1-single-scroll-root',
    '.global-layout-content',
    'main',
    '[data-allow-scroll="true"]',
  ];
  
  for (const sel of selectors) {
    const el = document.querySelector(sel) as HTMLElement | null;
    if (el && el.scrollHeight > el.clientHeight) {
      return sel;
    }
  }
  
  // Check if body is scrolling
  if (document.body.scrollHeight > document.body.clientHeight) {
    return 'body';
  }
  
  return null;
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
    currentPath: window.location.pathname,
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
      activeScrollContainer: findActiveScrollContainer(),
    },
    elements: {
      'html': getElementSnapshot('html'),
      'body': getElementSnapshot('body'),
      '#root': getElementSnapshot('#root'),
      '.m1-single-scroll-root': getElementSnapshot('.m1-single-scroll-root'),
      '.global-layout-content': getElementSnapshot('.global-layout-content'),
      'main': getElementSnapshot('main'),
      // Page-specific containers
      '[data-page-buzz]': getElementSnapshot('[data-page-buzz]'),
      '[data-page-intelligence]': getElementSnapshot('[data-page-intelligence]'),
      // Header/Nav
      '[data-unified-header]': getElementSnapshot('[data-unified-header]'),
      '#m1-bottom-nav': getElementSnapshot('#m1-bottom-nav'),
    },
    backgroundChain: {
      headerArea: getBackgroundChain('header'),
      bottomNavArea: getBackgroundChain('bottomNav'),
    },
    clippingDetector: {
      targetElement: '.aion-entity, [data-aion-cloud]',
      clippingAncestors: findClippingAncestors('.aion-entity') || findClippingAncestors('[data-aion-cloud]') || [],
    },
  };
}

export function printScrollForensics(): void {
  const snapshot = captureScrollForensics();
  
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║       M1SSION™ SCROLL FORENSICS SNAPSHOT v2                  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📍 PATH:', snapshot.currentPath);
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
  
  console.log('📦 ELEMENTS (key scroll/layout nodes)');
  Object.entries(snapshot.elements).forEach(([selector, data]) => {
    if (data) {
      console.log(`  ${selector}:`);
      console.log(`    overflow: ${data.overflow} | overscrollBehavior: ${data.overscrollBehavior}`);
      console.log(`    height: ${data.height} | position: ${data.position}`);
      console.log(`    scrollTop: ${data.scrollTop} | scrollHeight: ${data.scrollHeight}`);
      if (data.background !== 'rgba(0, 0, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box') {
        console.log(`    background: ${data.background}`);
      }
    } else {
      console.log(`  ${selector}: NOT FOUND`);
    }
  });
  
  console.log('');
  console.log('🎨 BACKGROUND CHAIN');
  console.log('  Header area:', snapshot.backgroundChain.headerArea.join(' → '));
  console.log('  Bottom nav area:', snapshot.backgroundChain.bottomNavArea.join(' → '));
  
  console.log('');
  console.log('✂️ CLIPPING DETECTOR (for AION cloud)');
  if (snapshot.clippingDetector.clippingAncestors.length > 0) {
    console.log('  ⚠️ CLIPPING ANCESTORS FOUND:');
    snapshot.clippingDetector.clippingAncestors.forEach(a => {
      console.log(`    ${a.selector}: overflow=${a.overflow}, clipPath=${a.clipPath}, contain=${a.contain}`);
    });
  } else {
    console.log('  ✅ No clipping ancestors found');
  }
  
  console.log('');
  console.log('📋 FULL JSON (copy for comparison):');
  console.log(JSON.stringify(snapshot, null, 2));
  
  return;
}

/**
 * Compare two snapshots (PWA vs Native)
 */
export function compareSnapshots(pwa: ScrollForensicsSnapshot, native: ScrollForensicsSnapshot): void {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║       PWA vs NATIVE COMPARISON                               ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  console.log('');
  console.log('📱 RUNTIME DIFF');
  console.log(`  PWA: isPWA=${pwa.runtime.isPWA}, isNative=${pwa.runtime.isNative}`);
  console.log(`  Native: isPWA=${native.runtime.isPWA}, isNative=${native.runtime.isNative}`);
  
  console.log('');
  console.log('📜 SCROLL OWNER DIFF');
  console.log(`  PWA: ${pwa.scrollOwner.activeScrollContainer || 'document'}`);
  console.log(`  Native: ${native.scrollOwner.activeScrollContainer || 'document'}`);
  
  console.log('');
  console.log('🔄 OVERSCROLL BEHAVIOR DIFF');
  ['body', '.m1-single-scroll-root', 'main'].forEach(sel => {
    const pwaEl = pwa.elements[sel];
    const nativeEl = native.elements[sel];
    if (pwaEl && nativeEl) {
      const diff = pwaEl.overscrollBehavior !== nativeEl.overscrollBehavior;
      console.log(`  ${sel}: PWA=${pwaEl.overscrollBehavior} vs Native=${nativeEl.overscrollBehavior} ${diff ? '⚠️ DIFF' : '✅'}`);
    }
  });
  
  console.log('');
  console.log('📐 VIEWPORT DIFF');
  console.log(`  PWA: ${pwa.viewport.innerHeight}px | Native: ${native.viewport.innerHeight}px`);
}

// DEV-ONLY: Expose to window for console access
if (import.meta.env.DEV) {
  (window as any).__M1_SCROLL_FORENSICS = printScrollForensics;
  (window as any).__M1_SCROLL_SNAPSHOT = captureScrollForensics;
  (window as any).__M1_COMPARE_SNAPSHOTS = compareSnapshots;
  
  console.log('🔬 [DEV] Scroll Forensics v2 loaded.');
  console.log('   Run: __M1_SCROLL_FORENSICS() — full report');
  console.log('   Run: __M1_SCROLL_SNAPSHOT() — raw JSON');
  console.log('   Run: __M1_COMPARE_SNAPSHOTS(pwa, native) — diff');
}
