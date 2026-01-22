/**
 * M1SSION™ UI Gap Inspector
 * Forensic tool for diagnosing "gap under header" issues on iOS WKWebView
 * 
 * ACTIVATION:
 * - localStorage.setItem('m1_ui_debug', '1') then reload
 * - OR add ?ui_debug=1 to URL
 * 
 * USAGE:
 * - window.__m1UiDebug.report() - Full diagnostic report
 * - window.__m1UiDebug.highlight(selector) - Highlight element
 * - window.__m1UiDebug.pick(y) - Find element at Y coordinate
 * - window.__m1UiDebug.off() - Disable overlay
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

// Types
interface GapReport {
  timestamp: string;
  viewport: {
    innerWidth: number;
    innerHeight: number;
    visualViewportHeight: number | null;
    visualViewportOffsetTop: number | null;
    devicePixelRatio: number;
    isCapacitor: boolean;
    isPWA: boolean;
    userAgent: string;
  };
  computedStyles: {
    html: Record<string, string>;
    body: Record<string, string>;
    root: Record<string, string> | null;
    main: Record<string, string> | null;
  };
  header: {
    selector: string;
    rect: DOMRect | null;
    bottom: number;
    computedStyles: Record<string, string> | null;
  };
  gapElement: {
    selector: string;
    tagName: string;
    className: string;
    id: string;
    rect: DOMRect | null;
    computedStyles: Record<string, string> | null;
    parentChain: string[];
  } | null;
  diagnosis: string;
  suggestedFix: string;
}

// Utility functions
const getComputedStyleSubset = (el: Element | null): Record<string, string> | null => {
  if (!el) return null;
  const cs = getComputedStyle(el);
  return {
    position: cs.position,
    top: cs.top,
    height: cs.height,
    minHeight: cs.minHeight,
    maxHeight: cs.maxHeight,
    paddingTop: cs.paddingTop,
    paddingBottom: cs.paddingBottom,
    marginTop: cs.marginTop,
    marginBottom: cs.marginBottom,
    overflow: cs.overflow,
    overflowY: cs.overflowY,
    transform: cs.transform,
    zIndex: cs.zIndex,
    display: cs.display,
  };
};

const getSelectorPath = (el: Element | null): string => {
  if (!el) return 'null';
  const parts: string[] = [];
  let current: Element | null = el;
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    if (current.id) {
      selector += `#${current.id}`;
    } else if (current.className && typeof current.className === 'string') {
      const classes = current.className.trim().split(/\s+/).slice(0, 2).join('.');
      if (classes) selector += `.${classes}`;
    }
    parts.unshift(selector);
    current = current.parentElement;
  }
  return parts.join(' > ');
};

const getParentChain = (el: Element | null, maxDepth = 5): string[] => {
  const chain: string[] = [];
  let current: Element | null = el;
  let depth = 0;
  while (current && current !== document.documentElement && depth < maxDepth) {
    chain.push(getSelectorPath(current));
    current = current.parentElement;
    depth++;
  }
  return chain;
};

// Find header element using various selectors
const findHeaderElement = (): Element | null => {
  const selectors = [
    '.unified-header-wrapper',
    '[data-header]',
    'header',
    '.header',
    '#header',
    '.unified-header',
  ];
  
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
};

// Overlay management
let overlayElement: HTMLDivElement | null = null;
let highlightElement: HTMLDivElement | null = null;

const createOverlay = (): HTMLDivElement => {
  if (overlayElement) return overlayElement;
  
  const overlay = document.createElement('div');
  overlay.id = 'm1-gap-inspector-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 999999;
  `;
  document.body.appendChild(overlay);
  overlayElement = overlay;
  return overlay;
};

const createHighlightBox = (rect: DOMRect, color: string, label: string): HTMLDivElement => {
  const box = document.createElement('div');
  box.className = 'm1-gap-highlight';
  box.style.cssText = `
    position: fixed;
    top: ${rect.top}px;
    left: ${rect.left}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    border: 2px solid ${color};
    background: ${color}22;
    pointer-events: none;
    z-index: 999998;
    box-sizing: border-box;
  `;
  
  const labelEl = document.createElement('div');
  labelEl.style.cssText = `
    position: absolute;
    top: -20px;
    left: 0;
    background: ${color};
    color: white;
    font-size: 10px;
    font-family: monospace;
    padding: 2px 6px;
    border-radius: 2px;
    white-space: nowrap;
  `;
  labelEl.textContent = label;
  box.appendChild(labelEl);
  
  return box;
};

const createHeaderBottomLine = (headerBottom: number): HTMLDivElement => {
  const line = document.createElement('div');
  line.className = 'm1-gap-header-line';
  line.style.cssText = `
    position: fixed;
    top: ${headerBottom}px;
    left: 0;
    right: 0;
    height: 2px;
    background: red;
    pointer-events: none;
    z-index: 999997;
  `;
  
  const label = document.createElement('div');
  label.style.cssText = `
    position: absolute;
    top: 4px;
    left: 10px;
    background: red;
    color: white;
    font-size: 11px;
    font-family: monospace;
    padding: 2px 8px;
    border-radius: 3px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  `;
  label.textContent = `Header Bottom: ${Math.round(headerBottom)}px`;
  line.appendChild(label);
  
  return line;
};

// Remove all highlights
const clearHighlights = (): void => {
  document.querySelectorAll('.m1-gap-highlight, .m1-gap-header-line').forEach(el => el.remove());
  if (highlightElement) {
    highlightElement.remove();
    highlightElement = null;
  }
};

// Main report function
const generateReport = (): GapReport => {
  const visualViewport = window.visualViewport;
  const isCapacitor = !!(window as any).Capacitor || window.location.protocol === 'capacitor:';
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  
  // Find header
  const headerEl = findHeaderElement();
  const headerRect = headerEl?.getBoundingClientRect() || null;
  const headerBottom = headerRect?.bottom || 0;
  
  // Find element at critical point (just below header)
  const criticalY = headerBottom + 2;
  const criticalX = window.innerWidth / 2;
  const gapEl = document.elementFromPoint(criticalX, criticalY);
  
  // Collect data
  const report: GapReport = {
    timestamp: new Date().toISOString(),
    viewport: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      visualViewportHeight: visualViewport?.height || null,
      visualViewportOffsetTop: visualViewport?.offsetTop || null,
      devicePixelRatio: window.devicePixelRatio,
      isCapacitor,
      isPWA,
      userAgent: navigator.userAgent.slice(0, 100),
    },
    computedStyles: {
      html: getComputedStyleSubset(document.documentElement) || {},
      body: getComputedStyleSubset(document.body) || {},
      root: getComputedStyleSubset(document.getElementById('root')),
      main: getComputedStyleSubset(document.querySelector('main')),
    },
    header: {
      selector: headerEl ? getSelectorPath(headerEl) : 'NOT FOUND',
      rect: headerRect,
      bottom: headerBottom,
      computedStyles: getComputedStyleSubset(headerEl),
    },
    gapElement: gapEl ? {
      selector: getSelectorPath(gapEl),
      tagName: gapEl.tagName,
      className: (gapEl as HTMLElement).className || '',
      id: gapEl.id || '',
      rect: gapEl.getBoundingClientRect(),
      computedStyles: getComputedStyleSubset(gapEl),
      parentChain: getParentChain(gapEl),
    } : null,
    diagnosis: '',
    suggestedFix: '',
  };
  
  // Diagnose the issue
  const diagnoses: string[] = [];
  const fixes: string[] = [];
  
  // Check for double padding
  const mainPaddingTop = report.computedStyles.main?.paddingTop;
  if (mainPaddingTop && parseInt(mainPaddingTop) > 100) {
    diagnoses.push(`DOUBLE PADDING: <main> has paddingTop=${mainPaddingTop}`);
    fixes.push('Remove duplicate paddingTop from child components (AppHome, etc.)');
  }
  
  // Check gap element's padding
  if (report.gapElement?.computedStyles?.paddingTop) {
    const gapPadding = parseInt(report.gapElement.computedStyles.paddingTop);
    if (gapPadding > 80) {
      diagnoses.push(`GAP ELEMENT has large paddingTop: ${report.gapElement.computedStyles.paddingTop}`);
      fixes.push(`Check ${report.gapElement.selector} for duplicate header offset`);
    }
  }
  
  // Check for safe-area being applied multiple times
  const safeAreaElements = document.querySelectorAll('[style*="safe-area-inset-top"]');
  if (safeAreaElements.length > 2) {
    diagnoses.push(`MULTIPLE safe-area-inset-top usages: ${safeAreaElements.length} elements`);
    fixes.push('Consolidate safe-area handling to single wrapper');
  }
  
  // Check header height vs actual gap
  if (headerRect && report.gapElement?.rect) {
    const actualGap = report.gapElement.rect.top - headerRect.bottom;
    if (actualGap > 20) {
      diagnoses.push(`EXCESSIVE GAP: ${Math.round(actualGap)}px between header bottom and content`);
    }
  }
  
  report.diagnosis = diagnoses.length > 0 ? diagnoses.join(' | ') : 'No obvious issues detected';
  report.suggestedFix = fixes.length > 0 ? fixes.join(' | ') : 'Check for nested paddingTop or duplicate safe-area';
  
  return report;
};

// Show visual overlay
const showOverlay = (): void => {
  clearHighlights();
  
  const headerEl = findHeaderElement();
  const headerRect = headerEl?.getBoundingClientRect();
  const headerBottom = headerRect?.bottom || 0;
  
  // Create header bottom line
  const line = createHeaderBottomLine(headerBottom);
  document.body.appendChild(line);
  
  // Find element at critical point
  const criticalY = headerBottom + 2;
  const criticalX = window.innerWidth / 2;
  const gapEl = document.elementFromPoint(criticalX, criticalY);
  
  // Highlight gap element
  if (gapEl) {
    const rect = gapEl.getBoundingClientRect();
    const highlight = createHighlightBox(rect, '#00D1FF', `Gap: ${gapEl.tagName}${gapEl.id ? '#' + gapEl.id : ''}`);
    document.body.appendChild(highlight);
  }
  
  // Highlight header
  if (headerRect) {
    const headerHighlight = createHighlightBox(headerRect, '#FF00FF', 'Header');
    document.body.appendChild(headerHighlight);
  }
  
  // Find first content element after gap
  const contentY = headerBottom + 100;
  const contentEl = document.elementFromPoint(criticalX, contentY);
  if (contentEl && contentEl !== gapEl) {
    const contentRect = contentEl.getBoundingClientRect();
    const contentHighlight = createHighlightBox(contentRect, '#00FF88', 'Content Start');
    document.body.appendChild(contentHighlight);
  }
};

// Highlight specific selector
const highlightSelector = (selector: string): void => {
  clearHighlights();
  const el = document.querySelector(selector);
  if (el) {
    const rect = el.getBoundingClientRect();
    const highlight = createHighlightBox(rect, '#FFFF00', selector);
    document.body.appendChild(highlight);
    console.log('[UI-GAP] Highlighted:', selector, getComputedStyleSubset(el));
  } else {
    console.warn('[UI-GAP] Element not found:', selector);
  }
};

// Pick element at Y coordinate
const pickAtY = (y: number): Element | null => {
  const x = window.innerWidth / 2;
  const el = document.elementFromPoint(x, y);
  if (el) {
    console.log('[UI-GAP] Element at Y=' + y + ':', {
      selector: getSelectorPath(el),
      rect: el.getBoundingClientRect(),
      computed: getComputedStyleSubset(el),
    });
    const rect = el.getBoundingClientRect();
    const highlight = createHighlightBox(rect, '#FF6600', `Y=${y}`);
    document.body.appendChild(highlight);
  }
  return el;
};

// Disable overlay
const disableOverlay = (): void => {
  clearHighlights();
  if (overlayElement) {
    overlayElement.remove();
    overlayElement = null;
  }
  console.log('[UI-GAP] Overlay disabled');
};

// Check if debug mode is enabled
const isDebugEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check localStorage
  if (localStorage.getItem('m1_ui_debug') === '1') return true;
  
  // Check URL param
  const url = new URL(window.location.href);
  if (url.searchParams.get('ui_debug') === '1') return true;
  
  return false;
};

// Auto-run on page load if enabled
const autoRun = (): void => {
  if (!isDebugEnabled()) return;
  
  console.log('[UI-GAP] 🔬 UI Gap Inspector activated');
  console.log('[UI-GAP] Commands: window.__m1UiDebug.report() | .highlight(sel) | .pick(y) | .off()');
  
  // Show overlay after a delay to let app render
  setTimeout(() => {
    showOverlay();
    const report = generateReport();
    console.log('[UI-GAP] 📊 Initial Report:', report);
    console.log('[UI-GAP] 🔍 Diagnosis:', report.diagnosis);
    console.log('[UI-GAP] 💡 Suggested Fix:', report.suggestedFix);
  }, 2000);
};

// Initialize and expose global API
export const initUiGapInspector = (): void => {
  if (typeof window === 'undefined') return;
  
  // Always expose the API (for manual activation)
  (window as any).__m1UiDebug = {
    report: () => {
      const r = generateReport();
      console.log('[UI-GAP] 📊 Report:', r);
      return r;
    },
    highlight: highlightSelector,
    pick: pickAtY,
    off: disableOverlay,
    show: showOverlay,
    isEnabled: isDebugEnabled,
    enable: () => {
      localStorage.setItem('m1_ui_debug', '1');
      console.log('[UI-GAP] ✅ Enabled. Reload to activate overlay.');
    },
    disable: () => {
      localStorage.removeItem('m1_ui_debug');
      disableOverlay();
      console.log('[UI-GAP] ❌ Disabled.');
    },
  };
  
  console.log('[UI-GAP] 🔬 Inspector mounted on window.__m1UiDebug');
  
  // Auto-run if enabled
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoRun);
  } else {
    autoRun();
  }
};

export default {
  init: initUiGapInspector,
  report: generateReport,
  highlight: highlightSelector,
  pick: pickAtY,
  off: disableOverlay,
  show: showOverlay,
};
