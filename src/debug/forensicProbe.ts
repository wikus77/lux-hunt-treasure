/**
 * M1SSION™ FORENSIC PROBE - iOS WKWebView Draggable Overlay Diagnostic
 * © 2026 Joseph MULÉ — NIYVORA KFT
 * 
 * INCIDENT: Draggable overlay/half-page cover on iOS wrapped app
 * 
 * This probe intercepts touch events, identifies the element under the finger,
 * and logs comprehensive diagnostic data to identify the culprit.
 * 
 * USAGE:
 *   window.__forensic.report()        - Full diagnostic report
 *   window.__forensic.findTransforms() - List transform elements
 *   window.__forensic.scrollRoots()   - List scroll containers
 *   window.__forensic.highlight('body') - Highlight an element
 */

// ========================================
// IMMEDIATE BOOTSTRAP - Assign to window FIRST
// ========================================

console.log('[FORENSIC] 🔬 Probe module loading...');

interface ForensicSnapshot {
  timestamp: number;
  eventType: string;
  touchX: number;
  touchY: number;
  target: ElementInfo | null;
  chain: ElementInfo[];
  suspects: SuspectElement[];
  viewport: ViewportInfo;
  scrollRoots: ScrollRootInfo[];
}

interface ElementInfo {
  tagName: string;
  id: string;
  className: string;
  selector: string;
  rect: DOMRect;
  computed: ComputedStyleSnapshot;
  scrollInfo?: ScrollInfo;
}

interface ComputedStyleSnapshot {
  position: string;
  top: string;
  left: string;
  width: string;
  height: string;
  transform: string;
  translate: string;
  zIndex: string;
  overflow: string;
  overflowY: string;
  overflowX: string;
  overscrollBehavior: string;
  pointerEvents: string;
  background: string;
  willChange: string;
  touchAction: string;
  webkitOverflowScrolling: string;
  minHeight: string;
}

interface ScrollInfo {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  isScrollable: boolean;
}

interface SuspectElement {
  element: HTMLElement;
  reason: string;
  selector: string;
  info: ElementInfo;
}

interface ViewportInfo {
  innerWidth: number;
  innerHeight: number;
  visualViewport: {
    width: number;
    height: number;
    offsetTop: number;
    offsetLeft: number;
    scale: number;
  } | null;
  documentClientHeight: number;
  bodyClientHeight: number;
  isStandalone: boolean;
  safeAreas: {
    top: string;
    bottom: string;
    left: string;
    right: string;
  };
  cssVariables: {
    appHeight: string;
    headerHeight: string;
    bottomNavHeight: string;
  };
  bodyComputed: {
    position: string;
    overflow: string;
    height: string;
    minHeight: string;
    touchAction: string;
  };
  htmlComputed: {
    position: string;
    overflow: string;
    height: string;
    minHeight: string;
  };
}

interface ScrollRootInfo {
  selector: string;
  rect: DOMRect;
  overflow: string;
  height: string;
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  hasNested: boolean;
}

// ========================================
// GLOBAL STATE
// ========================================

let isProbeActive = false;
let highlightOverlay: HTMLElement | null = null;
let lastSnapshot: ForensicSnapshot | null = null;
let snapshots: ForensicSnapshot[] = [];
const MAX_SNAPSHOTS = 50;

// ========================================
// UTILITY FUNCTIONS
// ========================================

function getSelector(el: Element): string {
  if (el.id) return `#${el.id}`;
  
  const parts: string[] = [];
  let current: Element | null = el;
  
  while (current && current !== document.body && parts.length < 4) {
    let part = current.tagName.toLowerCase();
    if (current.id) {
      part = `#${current.id}`;
      parts.unshift(part);
      break;
    }
    if (current.className && typeof current.className === 'string') {
      const classes = current.className.split(' ').filter(c => c && !c.startsWith('__'));
      if (classes.length > 0) {
        part += `.${classes.slice(0, 2).join('.')}`;
      }
    }
    parts.unshift(part);
    current = current.parentElement;
  }
  
  return parts.join(' > ');
}

function getComputedSnapshot(el: Element): ComputedStyleSnapshot {
  const cs = getComputedStyle(el);
  return {
    position: cs.position,
    top: cs.top,
    left: cs.left,
    width: cs.width,
    height: cs.height,
    transform: cs.transform,
    translate: cs.translate || 'none',
    zIndex: cs.zIndex,
    overflow: cs.overflow,
    overflowY: cs.overflowY,
    overflowX: cs.overflowX,
    overscrollBehavior: cs.overscrollBehavior || 'auto',
    pointerEvents: cs.pointerEvents,
    background: cs.background.substring(0, 100),
    willChange: cs.willChange,
    touchAction: cs.touchAction || 'auto',
    webkitOverflowScrolling: (cs as any).webkitOverflowScrolling || 'auto',
    minHeight: cs.minHeight,
  };
}

function getScrollInfo(el: Element): ScrollInfo | undefined {
  if (el instanceof HTMLElement) {
    const cs = getComputedStyle(el);
    const isScrollable = 
      cs.overflowY === 'auto' || 
      cs.overflowY === 'scroll' || 
      cs.overflow === 'auto' || 
      cs.overflow === 'scroll';
    
    if (isScrollable || el.scrollHeight > el.clientHeight) {
      return {
        scrollTop: el.scrollTop,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        isScrollable,
      };
    }
  }
  return undefined;
}

function getElementInfo(el: Element): ElementInfo {
  return {
    tagName: el.tagName,
    id: el.id,
    className: typeof el.className === 'string' ? el.className : '',
    selector: getSelector(el),
    rect: el.getBoundingClientRect(),
    computed: getComputedSnapshot(el),
    scrollInfo: getScrollInfo(el),
  };
}

function getElementChain(el: Element | null): ElementInfo[] {
  const chain: ElementInfo[] = [];
  let current = el;
  
  while (current && current !== document.documentElement) {
    chain.push(getElementInfo(current));
    current = current.parentElement;
  }
  
  chain.push(getElementInfo(document.documentElement));
  
  return chain;
}

function getSafeAreaValue(property: string): string {
  try {
    const div = document.createElement('div');
    div.style.paddingTop = `env(${property}, NOTSET)`;
    document.body.appendChild(div);
    const computed = getComputedStyle(div).paddingTop;
    document.body.removeChild(div);
    return computed === 'NOTSET' || computed === '0px' ? 'env() unsupported' : computed;
  } catch {
    return 'error';
  }
}

function getCSSVariable(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || 'unset';
}

// ========================================
// SUSPECT DETECTION
// ========================================

function findSuspects(chain: ElementInfo[], targetElement: Element | null): SuspectElement[] {
  const suspects: SuspectElement[] = [];
  
  let current = targetElement;
  while (current && current !== document.documentElement) {
    const htmlEl = current as HTMLElement;
    const cs = getComputedStyle(current);
    
    // SUSPECT 1: Transform not none
    if (cs.transform !== 'none' && cs.transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
      suspects.push({
        element: htmlEl,
        reason: `TRANSFORM: ${cs.transform}`,
        selector: getSelector(current),
        info: getElementInfo(current),
      });
    }
    
    // SUSPECT 2: Position fixed/absolute with large dimensions
    if ((cs.position === 'fixed' || cs.position === 'absolute')) {
      const rect = current.getBoundingClientRect();
      if (rect.width > window.innerWidth * 0.5 && rect.height > window.innerHeight * 0.3) {
        suspects.push({
          element: htmlEl,
          reason: `POSITION ${cs.position.toUpperCase()}: ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}`,
          selector: getSelector(current),
          info: getElementInfo(current),
        });
      }
    }
    
    // SUSPECT 3: overflow auto/scroll with webkit-overflow-scrolling
    if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && 
        (cs as any).webkitOverflowScrolling === 'touch') {
      suspects.push({
        element: htmlEl,
        reason: `WEBKIT SCROLL CONTAINER`,
        selector: getSelector(current),
        info: getElementInfo(current),
      });
    }
    
    // SUSPECT 4: will-change transform
    if (cs.willChange === 'transform' || cs.willChange.includes('transform')) {
      suspects.push({
        element: htmlEl,
        reason: `WILL-CHANGE: ${cs.willChange}`,
        selector: getSelector(current),
        info: getElementInfo(current),
      });
    }
    
    // SUSPECT 5: motion.div / framer-motion elements
    if (htmlEl.hasAttribute('data-framer-component-type') || 
        htmlEl.style.willChange === 'transform' ||
        htmlEl.className.includes('motion')) {
      suspects.push({
        element: htmlEl,
        reason: `FRAMER MOTION ELEMENT`,
        selector: getSelector(current),
        info: getElementInfo(current),
      });
    }
    
    // SUSPECT 6: position: fixed on body
    if (current === document.body && cs.position === 'fixed') {
      suspects.push({
        element: htmlEl,
        reason: `BODY POSITION FIXED (iOS WKWebView issue!)`,
        selector: 'body',
        info: getElementInfo(current),
      });
    }
    
    current = current.parentElement;
  }
  
  return suspects;
}

function findAllScrollRoots(): ScrollRootInfo[] {
  const roots: ScrollRootInfo[] = [];
  
  // Check body
  const bodyCs = getComputedStyle(document.body);
  roots.push({
    selector: 'body',
    rect: document.body.getBoundingClientRect(),
    overflow: bodyCs.overflow,
    height: bodyCs.height,
    scrollTop: document.body.scrollTop,
    scrollHeight: document.body.scrollHeight,
    clientHeight: document.body.clientHeight,
    hasNested: false,
  });
  
  // Check html
  const htmlCs = getComputedStyle(document.documentElement);
  roots.push({
    selector: 'html',
    rect: document.documentElement.getBoundingClientRect(),
    overflow: htmlCs.overflow,
    height: htmlCs.height,
    scrollTop: document.documentElement.scrollTop,
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight,
    hasNested: false,
  });
  
  // Find all elements with overflow auto/scroll
  const scrollables = document.querySelectorAll('*');
  scrollables.forEach((el) => {
    const cs = getComputedStyle(el);
    if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') &&
        (el as HTMLElement).scrollHeight > (el as HTMLElement).clientHeight) {
      const selector = getSelector(el);
      const hasNested = el.querySelector('[style*="overflow"]') !== null;
      roots.push({
        selector,
        rect: el.getBoundingClientRect(),
        overflow: cs.overflow,
        height: cs.height,
        scrollTop: (el as HTMLElement).scrollTop,
        scrollHeight: (el as HTMLElement).scrollHeight,
        clientHeight: (el as HTMLElement).clientHeight,
        hasNested,
      });
    }
  });
  
  return roots;
}

// ========================================
// VIEWPORT FORENSICS
// ========================================

function getViewportInfo(): ViewportInfo {
  const vv = window.visualViewport;
  const bodyCs = getComputedStyle(document.body);
  const htmlCs = getComputedStyle(document.documentElement);
  
  return {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    visualViewport: vv ? {
      width: vv.width,
      height: vv.height,
      offsetTop: vv.offsetTop,
      offsetLeft: vv.offsetLeft,
      scale: vv.scale,
    } : null,
    documentClientHeight: document.documentElement.clientHeight,
    bodyClientHeight: document.body.clientHeight,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    safeAreas: {
      top: getSafeAreaValue('safe-area-inset-top'),
      bottom: getSafeAreaValue('safe-area-inset-bottom'),
      left: getSafeAreaValue('safe-area-inset-left'),
      right: getSafeAreaValue('safe-area-inset-right'),
    },
    cssVariables: {
      appHeight: getCSSVariable('--app-height'),
      headerHeight: getCSSVariable('--header-height'),
      bottomNavHeight: getCSSVariable('--bottom-nav-height'),
    },
    bodyComputed: {
      position: bodyCs.position,
      overflow: bodyCs.overflow,
      height: bodyCs.height,
      minHeight: bodyCs.minHeight,
      touchAction: bodyCs.touchAction || 'auto',
    },
    htmlComputed: {
      position: htmlCs.position,
      overflow: htmlCs.overflow,
      height: htmlCs.height,
      minHeight: htmlCs.minHeight,
    },
  };
}

// ========================================
// HIGHLIGHT OVERLAY
// ========================================

function createHighlightOverlay(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.id = 'forensic-highlight';
  overlay.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 999999;
    border: 3px solid #ff0000;
    background: rgba(255, 0, 0, 0.15);
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
    transition: all 0.1s ease-out;
  `;
  document.body.appendChild(overlay);
  return overlay;
}

function highlightElement(selectorOrEl: string | Element | null): void {
  if (!highlightOverlay) {
    highlightOverlay = createHighlightOverlay();
  }
  
  let el: Element | null = null;
  if (typeof selectorOrEl === 'string') {
    el = document.querySelector(selectorOrEl);
    if (!el) {
      console.warn(`[FORENSIC] highlight: No element found for selector "${selectorOrEl}"`);
      return;
    }
  } else {
    el = selectorOrEl;
  }
  
  if (!el) {
    highlightOverlay.style.display = 'none';
    return;
  }
  
  const rect = el.getBoundingClientRect();
  highlightOverlay.style.display = 'block';
  highlightOverlay.style.top = `${rect.top}px`;
  highlightOverlay.style.left = `${rect.left}px`;
  highlightOverlay.style.width = `${rect.width}px`;
  highlightOverlay.style.height = `${rect.height}px`;
  
  // Log the highlighted element's styles
  console.log('[FORENSIC] Highlighting:', getSelector(el));
  console.log('[FORENSIC] Computed styles:', getComputedSnapshot(el));
}

// ========================================
// EVENT HANDLERS
// ========================================

function captureSnapshot(event: TouchEvent | PointerEvent | MouseEvent, eventType: string): ForensicSnapshot {
  let x = 0, y = 0;
  
  if ('touches' in event && event.touches.length > 0) {
    x = event.touches[0].clientX;
    y = event.touches[0].clientY;
  } else if ('clientX' in event) {
    x = event.clientX;
    y = event.clientY;
  }
  
  const targetElement = document.elementFromPoint(x, y);
  const chain = getElementChain(targetElement);
  const suspects = findSuspects(chain, targetElement);
  const viewport = getViewportInfo();
  const scrollRoots = findAllScrollRoots();
  
  return {
    timestamp: Date.now(),
    eventType,
    touchX: x,
    touchY: y,
    target: targetElement ? getElementInfo(targetElement) : null,
    chain,
    suspects,
    viewport,
    scrollRoots,
  };
}

function handleTouchStart(e: TouchEvent): void {
  const snapshot = captureSnapshot(e, 'touchstart');
  lastSnapshot = snapshot;
  snapshots.push(snapshot);
  if (snapshots.length > MAX_SNAPSHOTS) snapshots.shift();
  
  console.group('🔬 [FORENSIC] TOUCH START');
  console.log('📍 Position:', snapshot.touchX.toFixed(0), snapshot.touchY.toFixed(0));
  console.log('🎯 Target:', snapshot.target?.selector);
  console.log('📜 Parent chain:');
  snapshot.chain.slice(0, 5).forEach((info, i) => {
    console.log(`  ${i}. ${info.selector} | pos:${info.computed.position} | transform:${info.computed.transform} | overflow:${info.computed.overflow}`);
  });
  
  if (snapshot.suspects.length > 0) {
    console.warn('🚨 SUSPECTS FOUND:');
    snapshot.suspects.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.reason}`);
      console.log(`     Selector: ${s.selector}`);
      console.log(`     Transform: ${s.info.computed.transform}`);
      console.log(`     Position: ${s.info.computed.position}`);
    });
  }
  console.groupEnd();
  
  if (snapshot.suspects.length > 0) {
    highlightElement(snapshot.suspects[0].element);
  }
}

function handleTouchMove(e: TouchEvent): void {
  const snapshot = captureSnapshot(e, 'touchmove');
  
  if (Date.now() - (lastSnapshot?.timestamp || 0) > 200) {
    lastSnapshot = snapshot;
    snapshots.push(snapshot);
    if (snapshots.length > MAX_SNAPSHOTS) snapshots.shift();
    
    if (snapshot.suspects.length > 0) {
      highlightElement(snapshot.suspects[0].element);
      
      const transformSuspects = snapshot.suspects.filter(s => s.reason.startsWith('TRANSFORM'));
      if (transformSuspects.length > 0) {
        console.warn('🚨 [FORENSIC] TRANSFORM DURING DRAG!');
        transformSuspects.forEach(s => {
          console.log(`  ${s.selector}: ${s.info.computed.transform}`);
        });
      }
    }
  }
}

function handleTouchEnd(): void {
  console.group('🔬 [FORENSIC] TOUCH END');
  console.log('📊 Session snapshots:', snapshots.length);
  
  setTimeout(() => {
    const persistentTransforms = findAllTransformElements();
    if (persistentTransforms.length > 0) {
      console.warn('⚠️ [FORENSIC] PERSISTENT TRANSFORMS AFTER TOUCH END:');
      persistentTransforms.forEach(el => {
        const cs = getComputedStyle(el);
        console.log(`  ${getSelector(el)}: ${cs.transform}`);
      });
    }
  }, 100);
  
  console.groupEnd();
  
  setTimeout(() => highlightElement(null), 500);
}

function findAllTransformElements(): HTMLElement[] {
  const elements: HTMLElement[] = [];
  const all = document.querySelectorAll('*');
  
  all.forEach(el => {
    const cs = getComputedStyle(el);
    // Check computed transform
    if (cs.transform !== 'none' && cs.transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
      elements.push(el as HTMLElement);
    }
    // Check inline style transform
    const htmlEl = el as HTMLElement;
    if (htmlEl.style.transform && htmlEl.style.transform !== 'none') {
      if (!elements.includes(htmlEl)) {
        elements.push(htmlEl);
      }
    }
    // Check will-change
    if (cs.willChange === 'transform' || cs.willChange.includes('transform')) {
      if (!elements.includes(htmlEl)) {
        elements.push(htmlEl);
      }
    }
  });
  
  return elements;
}

// ========================================
// PUBLIC API FUNCTIONS
// ========================================

export function report(): void {
  console.log('');
  console.log('═'.repeat(60));
  console.log('🔬 M1SSION™ iOS FORENSIC REPORT');
  console.log('═'.repeat(60));
  console.log('');
  
  // 1. Viewport
  console.group('📐 VIEWPORT & SAFE AREAS');
  const vp = getViewportInfo();
  console.log('innerWidth:', vp.innerWidth);
  console.log('innerHeight:', vp.innerHeight);
  if (vp.visualViewport) {
    console.log('visualViewport.height:', vp.visualViewport.height);
    console.log('visualViewport.offsetTop:', vp.visualViewport.offsetTop);
    console.log('visualViewport.scale:', vp.visualViewport.scale);
  } else {
    console.warn('visualViewport: NOT AVAILABLE');
  }
  console.log('document.documentElement.clientHeight:', vp.documentClientHeight);
  console.log('document.body.clientHeight:', vp.bodyClientHeight);
  console.log('display-mode standalone:', vp.isStandalone);
  console.log('safe-area-inset-top:', vp.safeAreas.top);
  console.log('safe-area-inset-bottom:', vp.safeAreas.bottom);
  console.log('--app-height:', vp.cssVariables.appHeight);
  console.groupEnd();
  
  // 2. Body/HTML computed
  console.group('📄 BODY & HTML COMPUTED');
  console.log('body.position:', vp.bodyComputed.position);
  console.log('body.overflow:', vp.bodyComputed.overflow);
  console.log('body.height:', vp.bodyComputed.height);
  console.log('body.minHeight:', vp.bodyComputed.minHeight);
  console.log('body.touchAction:', vp.bodyComputed.touchAction);
  console.log('body.classList:', document.body.classList.toString());
  console.log('html.overflow:', vp.htmlComputed.overflow);
  console.log('html.height:', vp.htmlComputed.height);
  console.groupEnd();
  
  // 3. Scroll roots
  console.group('📜 SCROLL ROOTS');
  const roots = findAllScrollRoots();
  roots.forEach((r, i) => {
    console.log(`${i + 1}. ${r.selector}`);
    console.log(`   overflow: ${r.overflow}`);
    console.log(`   height: ${r.height}`);
    console.log(`   scrollTop/scrollHeight/clientHeight: ${r.scrollTop}/${r.scrollHeight}/${r.clientHeight}`);
    if (r.hasNested) {
      console.warn('   ⚠️ HAS NESTED OVERFLOW');
    }
  });
  if (roots.length > 3) {
    console.warn(`🚨 ${roots.length} scroll containers - potential nested scroll issue!`);
  }
  console.groupEnd();
  
  // 4. Transform elements
  console.group('🔄 TRANSFORM ELEMENTS');
  const transforms = findAllTransformElements();
  if (transforms.length === 0) {
    console.log('✅ No transform elements found');
  } else {
    transforms.forEach((el, i) => {
      const cs = getComputedStyle(el);
      const sel = getSelector(el);
      console.log(`${i + 1}. ${sel}`);
      console.log(`   computed.transform: ${cs.transform}`);
      console.log(`   style.transform: ${el.style.transform || 'none'}`);
      console.log(`   will-change: ${cs.willChange}`);
      console.log(`   position: ${cs.position}`);
      console.log(`   z-index: ${cs.zIndex}`);
    });
  }
  console.groupEnd();
  
  // 5. Fixed/absolute overlays
  console.group('🎯 FIXED/ABSOLUTE HIGH-Z ELEMENTS');
  const overlays = document.querySelectorAll('*');
  let overlayCount = 0;
  overlays.forEach(el => {
    const cs = getComputedStyle(el);
    if ((cs.position === 'fixed' || cs.position === 'absolute') && 
        parseInt(cs.zIndex) > 100) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 100 && rect.height > 100) {
        overlayCount++;
        console.log(`${overlayCount}. ${getSelector(el)}`);
        console.log(`   position: ${cs.position}, z-index: ${cs.zIndex}`);
        console.log(`   size: ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}`);
        console.log(`   pointer-events: ${cs.pointerEvents}`);
      }
    }
  });
  if (overlayCount === 0) {
    console.log('✅ No high-z overlays found');
  }
  console.groupEnd();
  
  console.log('');
  console.log('═'.repeat(60));
  console.log('📱 Touch the screen to capture element data');
  console.log('═'.repeat(60));
}

export function scrollRoots(): ScrollRootInfo[] {
  const roots = findAllScrollRoots();
  console.group('📜 [FORENSIC] SCROLL ROOTS');
  roots.forEach((r, i) => {
    console.log(`${i + 1}. ${r.selector} | overflow: ${r.overflow} | height: ${r.height}`);
  });
  console.groupEnd();
  return roots;
}

export function findTransforms(): HTMLElement[] {
  const transforms = findAllTransformElements();
  console.group('🔄 [FORENSIC] TRANSFORM ELEMENTS');
  if (transforms.length === 0) {
    console.log('✅ No transform elements found');
  } else {
    transforms.forEach((el, i) => {
      const cs = getComputedStyle(el);
      console.log(`${i + 1}. ${getSelector(el)}`);
      console.log(`   transform: ${cs.transform}`);
      console.log(`   inline: ${el.style.transform || 'none'}`);
    });
  }
  console.groupEnd();
  return transforms;
}

export function highlight(selectorOrEl: string | Element | null): void {
  highlightElement(selectorOrEl);
}

export function clearHighlight(): void {
  highlightElement(null);
}

export function start(): void {
  if (isProbeActive) {
    console.log('[FORENSIC] Probe already active');
    return;
  }
  
  console.log('🔬 [FORENSIC] Starting touch probe...');
  isProbeActive = true;
  snapshots = [];
  
  document.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
  document.addEventListener('touchmove', handleTouchMove, { passive: true, capture: true });
  document.addEventListener('touchend', handleTouchEnd, { passive: true, capture: true });
  
  console.log('📱 Touch the screen to capture diagnostic data');
}

export function stop(): void {
  if (!isProbeActive) return;
  
  console.log('🔬 [FORENSIC] Stopping probe...');
  isProbeActive = false;
  
  document.removeEventListener('touchstart', handleTouchStart, { capture: true } as EventListenerOptions);
  document.removeEventListener('touchmove', handleTouchMove, { capture: true } as EventListenerOptions);
  document.removeEventListener('touchend', handleTouchEnd, { capture: true } as EventListenerOptions);
  
  if (highlightOverlay) {
    highlightOverlay.remove();
    highlightOverlay = null;
  }
}

export function getSnapshots(): ForensicSnapshot[] {
  return snapshots;
}

// ========================================
// IMMEDIATE WINDOW ASSIGNMENT
// ========================================

// Assign to window IMMEDIATELY on import
if (typeof window !== 'undefined') {
  (window as any).__forensic = {
    report,
    scrollRoots,
    findTransforms,
    highlight,
    clearHighlight,
    start,
    stop,
    snapshots: getSnapshots,
    // Quick access
    vp: getViewportInfo,
    body: () => getComputedSnapshot(document.body),
    html: () => getComputedSnapshot(document.documentElement),
  };
  
  console.log('[FORENSIC] ✅ Probe mounted on window.__forensic');
  console.log('[FORENSIC] Run: window.__forensic.report()');
  console.log('[FORENSIC] Run: window.__forensic.start() to enable touch tracking');
}

// Auto-start touch tracking after DOM ready
export function initForensicProbe(): void {
  if (typeof window === 'undefined') return;
  
  const doInit = () => {
    console.log('[FORENSIC] 🚀 Auto-starting touch probe...');
    start();
    report();
  };
  
  if (document.readyState === 'complete') {
    setTimeout(doInit, 500);
  } else {
    window.addEventListener('load', () => setTimeout(doInit, 500), { once: true });
  }
}

export default {
  report,
  scrollRoots,
  findTransforms,
  highlight,
  start,
  stop,
  init: initForensicProbe,
};
