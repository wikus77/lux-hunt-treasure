/**
 * iOS WKWebView Readability Hotfix — Persistent runtime patch (SOLO app nativa iOS).
 * Forza leggibilità testi in modali/portal/reward/Radix/Vaul dopo cold start (killapp + reopen).
 * CSS injection + hardening JS (opacity/filter) + MutationObserver per re-render React.
 * © 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

import { Capacitor } from '@capacitor/core';

const STYLE_ID = 'm1-ios-readability-hotfix';
const OBSERVER_MARK = 'data-m1-readability-observer';
const DEBOUNCE_MS = 80;

const ROOT_SELECTORS = [
  '#m1-modal-portal',
  '#m1-settings-section-portal',
  '#m1-profile-portal',
  '.m1-reward-zone-popup',
  '[data-radix-dialog-content]',
  '[data-radix-alert-dialog-content]',
  '[data-radix-popover-content]',
  '[data-radix-select-content]',
  '[data-vaul-drawer]',
  '.vaul-drawer',
  '.settings-modal',
  '.m1-sheet',
  '.m1-modal',
  '.mission-profile-engine',
  '[data-m1-mpe-sheet]',
];

const HOTFIX_CSS = `
/* WKWEBVIEW READABILITY — base + -webkit-text-fill-color + text-shadow for WKWebView */
#m1-modal-portal,.m1-reward-zone-popup,[data-radix-dialog-content],[data-radix-alert-dialog-content],[data-radix-popover-content],[data-radix-select-content],[data-vaul-drawer],.vaul-drawer,.settings-modal,.m1-sheet,.m1-modal,.mission-profile-engine,[data-m1-mpe-sheet] { color: rgba(255,255,255,0.92) !important; -webkit-text-fill-color: rgba(255,255,255,0.92) !important; text-shadow: 0 1px 10px rgba(0,0,0,0.55) !important; }
/* MPE sheet + reward popup: stronger base so title/body stay readable */
[data-m1-mpe-sheet] h1,[data-m1-mpe-sheet] h2,[data-m1-mpe-sheet] h3,[data-m1-mpe-sheet] p,[data-m1-mpe-sheet] span,[data-m1-mpe-sheet] label,[data-m1-mpe-sheet] button,[data-m1-mpe-sheet] a,.m1-reward-zone-popup h1,.m1-reward-zone-popup h2,.m1-reward-zone-popup p,.m1-reward-zone-popup span,.m1-reward-zone-popup button { color: rgba(255,255,255,0.92) !important; -webkit-text-fill-color: rgba(255,255,255,0.92) !important; text-shadow: 0 1px 10px rgba(0,0,0,0.55) !important; }
/* Cyan brand in MPE / popup: preserve accent */
[data-m1-mpe-sheet] .text-cyan-400,[data-m1-mpe-sheet] .text-cyan-500,[data-m1-mpe-sheet] [class*="text-cyan"],.m1-reward-zone-popup .text-cyan-400,.m1-reward-zone-popup [class*="text-cyan"] { color: rgba(0,229,255,0.95) !important; -webkit-text-fill-color: rgba(0,229,255,0.95) !important; }
#m1-settings-section-portal,#m1-profile-portal { color: rgba(255,255,255,0.92) !important; -webkit-text-fill-color: currentColor !important; }
/* muted + gray + slate + tailwind */
#m1-modal-portal .text-muted-foreground,#m1-modal-portal [class*="text-muted-foreground"],#m1-modal-portal .text-gray-400,#m1-modal-portal .text-gray-500,#m1-modal-portal .text-slate-400,#m1-modal-portal .text-slate-500,
#m1-settings-section-portal .text-muted-foreground,#m1-settings-section-portal [class*="text-muted-foreground"],#m1-settings-section-portal .text-gray-400,#m1-settings-section-portal .text-gray-500,#m1-settings-section-portal .text-slate-400,#m1-settings-section-portal .text-slate-500,
#m1-profile-portal .text-muted-foreground,#m1-profile-portal [class*="text-muted-foreground"],#m1-profile-portal .text-gray-400,#m1-profile-portal .text-gray-500,#m1-profile-portal .text-slate-400,#m1-profile-portal .text-slate-500,
.m1-reward-zone-popup .text-muted-foreground,.m1-reward-zone-popup [class*="text-muted-foreground"],.m1-reward-zone-popup .text-gray-400,.m1-reward-zone-popup .text-gray-500,.m1-reward-zone-popup .text-slate-400,.m1-reward-zone-popup .text-slate-500,.m1-reward-zone-popup .text-white\\/90,.m1-reward-zone-popup .text-white\\/85,.m1-reward-zone-popup .text-white\\/80,.m1-reward-zone-popup .text-white\\/75,.m1-reward-zone-popup .text-white\\/70,.m1-reward-zone-popup .text-zinc-400,.m1-reward-zone-popup .text-zinc-500,
[data-radix-dialog-content] .text-muted-foreground,[data-radix-dialog-content] [class*="text-muted-foreground"],[data-radix-dialog-content] .text-gray-400,[data-radix-dialog-content] .text-gray-500,[data-radix-dialog-content] .text-slate-400,[data-radix-dialog-content] .text-slate-500,
[data-radix-alert-dialog-content] .text-muted-foreground,[data-radix-alert-dialog-content] [class*="text-muted-foreground"],[data-radix-alert-dialog-content] .text-gray-400,[data-radix-alert-dialog-content] .text-gray-500,
[data-radix-popover-content] .text-muted-foreground,[data-radix-popover-content] [class*="text-muted-foreground"],[data-radix-popover-content] .text-gray-400,[data-radix-popover-content] .text-gray-500,
[data-radix-select-content] .text-muted-foreground,[data-radix-select-content] [class*="text-muted-foreground"],[data-radix-select-content] .text-gray-400,[data-radix-select-content] .text-gray-500,
[data-vaul-drawer] .text-muted-foreground,[data-vaul-drawer] [class*="text-muted-foreground"],[data-vaul-drawer] .text-gray-400,[data-vaul-drawer] .text-gray-500,
.vaul-drawer .text-muted-foreground,.vaul-drawer [class*="text-muted-foreground"],.vaul-drawer .text-gray-400,.vaul-drawer .text-gray-500,
.settings-modal .text-muted-foreground,.settings-modal [class*="text-muted-foreground"],.settings-modal .text-gray-400,.settings-modal .text-gray-500,
[data-m1-mpe-sheet] .text-muted-foreground,[data-m1-mpe-sheet] [class*="text-muted-foreground"],[data-m1-mpe-sheet] .text-gray-400,[data-m1-mpe-sheet] .text-gray-500,[data-m1-mpe-sheet] .text-slate-400,[data-m1-mpe-sheet] .text-slate-500,[data-m1-mpe-sheet] .text-white\\/90,[data-m1-mpe-sheet] .text-white\\/85,[data-m1-mpe-sheet] .text-white\\/80,[data-m1-mpe-sheet] .text-white\\/75,[data-m1-mpe-sheet] .text-white\\/70,[data-m1-mpe-sheet] .text-zinc-400,[data-m1-mpe-sheet] .text-zinc-500 { color: rgba(255,255,255,0.78) !important; -webkit-text-fill-color: rgba(255,255,255,0.78) !important; text-shadow: 0 0 1px rgba(0,0,0,0.3); }
/* foreground */
#m1-modal-portal .text-foreground,#m1-modal-portal [class*="text-foreground"]:not([class*="muted"]),#m1-settings-section-portal .text-foreground,#m1-settings-section-portal [class*="text-foreground"]:not([class*="muted"]),#m1-profile-portal .text-foreground,#m1-profile-portal [class*="text-foreground"]:not([class*="muted"]) { color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; }
.m1-reward-zone-popup .text-foreground,.m1-reward-zone-popup [class*="text-foreground"]:not([class*="muted"]) { color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; }
[data-radix-dialog-content] .text-foreground,[data-radix-dialog-content] [class*="text-foreground"]:not([class*="muted"]),[data-radix-alert-dialog-content] .text-foreground,[data-radix-alert-dialog-content] [class*="text-foreground"]:not([class*="muted"]),[data-radix-popover-content] .text-foreground,[data-radix-popover-content] [class*="text-foreground"]:not([class*="muted"]),[data-radix-select-content] .text-foreground,[data-radix-select-content] [class*="text-foreground"]:not([class*="muted"]),[data-vaul-drawer] .text-foreground,[data-vaul-drawer] [class*="text-foreground"]:not([class*="muted"]),.vaul-drawer .text-foreground,.settings-modal .text-foreground,[data-m1-mpe-sheet] .text-foreground,[data-m1-mpe-sheet] [class*="text-foreground"]:not([class*="muted"]) { color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; }
/* placeholder */
#m1-modal-portal input::placeholder,#m1-modal-portal textarea::placeholder,#m1-settings-section-portal input::placeholder,#m1-settings-section-portal textarea::placeholder,#m1-profile-portal input::placeholder,#m1-profile-portal textarea::placeholder,
.m1-reward-zone-popup input::placeholder,.m1-reward-zone-popup textarea::placeholder,
[data-radix-dialog-content] input::placeholder,[data-radix-dialog-content] textarea::placeholder,[data-radix-alert-dialog-content] input::placeholder,[data-radix-alert-dialog-content] textarea::placeholder,[data-radix-popover-content] input::placeholder,[data-radix-popover-content] textarea::placeholder,[data-radix-select-content] input::placeholder,[data-radix-select-content] textarea::placeholder,[data-vaul-drawer] input::placeholder,[data-vaul-drawer] textarea::placeholder,.vaul-drawer input::placeholder,.vaul-drawer textarea::placeholder,.settings-modal input::placeholder,.settings-modal textarea::placeholder,[data-m1-mpe-sheet] input::placeholder,[data-m1-mpe-sheet] textarea::placeholder { color: rgba(255,255,255,0.48) !important; -webkit-text-fill-color: rgba(255,255,255,0.48) !important; }
/* disabled */
#m1-modal-portal input:disabled,#m1-modal-portal textarea:disabled,#m1-settings-section-portal input:disabled,#m1-settings-section-portal textarea:disabled,#m1-profile-portal input:disabled,#m1-profile-portal textarea:disabled,
.m1-reward-zone-popup input:disabled,.m1-reward-zone-popup textarea:disabled,
[data-radix-dialog-content] input:disabled,[data-radix-dialog-content] textarea:disabled,[data-radix-alert-dialog-content] input:disabled,[data-radix-alert-dialog-content] textarea:disabled,[data-radix-popover-content] input:disabled,[data-radix-popover-content] textarea:disabled,[data-radix-select-content] input:disabled,[data-radix-select-content] textarea:disabled,[data-vaul-drawer] input:disabled,[data-vaul-drawer] textarea:disabled,.vaul-drawer input:disabled,.vaul-drawer textarea:disabled,.settings-modal input:disabled,.settings-modal textarea:disabled,[data-m1-mpe-sheet] input:disabled,[data-m1-mpe-sheet] textarea:disabled { opacity: 1 !important; color: rgba(255,255,255,0.70) !important; -webkit-text-fill-color: rgba(255,255,255,0.70) !important; filter: none !important; }
`;

/** True if node is inside any of the target roots (portals/sheets/modals). */
function isInsideTargetRoot(node: Node): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  const el = node as Element;
  for (const sel of ROOT_SELECTORS) {
    try {
      const roots = document.querySelectorAll(sel);
      for (const r of roots) {
        if (r.contains(el)) return true;
      }
    } catch {
      /* ignore invalid selector */
    }
  }
  return false;
}

/** True if element is a target root or is inside one (so we should run sweep). */
function isTargetRootOrInside(node: Node): boolean {
  let el: Element | null = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : (node.parentNode?.nodeType === Node.ELEMENT_NODE ? (node.parentNode as Element) : null);
  if (!el) return false;
  if (isInsideTargetRoot(el)) return true;
  for (const sel of ROOT_SELECTORS) {
    try {
      if (el.matches?.(sel)) return true;
      const q = document.querySelector(sel);
      if (q === el) return true;
    } catch {
      /* ignore */
    }
  }
  return false;
}

const TEXT_TAGS = new Set(['P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LABEL', 'BUTTON', 'A', 'LI', 'SMALL', 'STRONG', 'EM']);

/** Apply opacity/filter override to text-bearing elements (robust: tag, class, aria-label). */
function harden(el: Element): void {
  if (!(el instanceof HTMLElement)) return;
  const html = el as HTMLElement;
  const cn = html.className;
  const hasText = (html.textContent?.trim().length ?? 0) > 0;
  const hasTextClass = typeof cn === 'string' && /\btext-/.test(cn);
  const isTextTag = TEXT_TAGS.has(html.tagName);
  const hasAriaLabel = html.getAttribute?.('aria-label') != null || html.getAttribute?.('role') === 'button';
  if (!hasText && !hasTextClass && !isTextTag && !hasAriaLabel) return;
  if (typeof cn === 'string' && /\bopacity-\d+\b/.test(cn)) {
    html.className = cn.replace(/\bopacity-\d+\b/g, '').replace(/\s+/g, ' ').trim();
  }
  html.style.setProperty('opacity', '1', 'important');
  html.style.setProperty('filter', 'none', 'important');
}

const isDev = typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV === true;

function sweep(): void {
  let totalRoots = 0;
  let totalNodes = 0;
  for (const sel of ROOT_SELECTORS) {
    try {
      const roots = document.querySelectorAll(sel);
      roots.forEach((root) => {
        totalRoots++;
        harden(root);
        const descs = root.querySelectorAll('*');
        descs.forEach((desc) => harden(desc));
        totalNodes += 1 + descs.length;
        if (isDev) {
          const shortSel = sel.length > 30 ? sel.slice(0, 27) + '...' : sel;
          console.log('[iOSReadability] harden root=' + shortSel + ' nodes=' + (1 + descs.length));
        }
      });
    } catch (_) {
      /* ignore invalid selector */
    }
  }
  if (isDev && totalRoots > 0) {
    console.log('[iOSReadability] sweep done roots=' + totalRoots + ' totalNodes=' + totalNodes);
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let observerInstance: MutationObserver | null = null;

function scheduleSweep(): void {
  if (debounceTimer !== null) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    sweep();
  }, DEBOUNCE_MS);
}

function stopReadability(): void {
  if (observerInstance) {
    observerInstance.disconnect();
    observerInstance = null;
  }
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  const styleEl = document.getElementById(STYLE_ID);
  if (styleEl) styleEl.remove();
  if (typeof document.documentElement.removeAttribute === 'function') {
    document.documentElement.removeAttribute(OBSERVER_MARK);
  }
  if (typeof window !== 'undefined') {
    (window as any).__m1_stop_readability__ = undefined;
  }
}

export function installIOSReadabilityHotfix(): void {
  if (typeof document === 'undefined' || !document.head) return;
  if ((window as any).__M1_DISABLE_READABILITY__ === true) return;
  if (!Capacitor.isNativePlatform()) return;
  if (Capacitor.getPlatform() !== 'ios') return;
  if (document.getElementById(STYLE_ID)) return;
  if (document.documentElement.getAttribute(OBSERVER_MARK) === '1') return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.setAttribute('data-m1', 'ios-readability-hotfix');
  style.textContent = HOTFIX_CSS;
  document.head.appendChild(style);

  sweep();

  observerInstance = new MutationObserver((mutations) => {
    for (const mut of mutations) {
      if (isTargetRootOrInside(mut.target)) {
        if (isDev) console.log('[iOSReadability] sweep scheduled (reason=targetInRoot)');
        scheduleSweep();
        return;
      }
      for (const n of mut.addedNodes) {
        if (n.nodeType === Node.ELEMENT_NODE && isTargetRootOrInside(n)) {
          if (isDev) console.log('[iOSReadability] sweep scheduled (reason=portalAdded) roots=' + ROOT_SELECTORS.length);
          scheduleSweep();
          return;
        }
      }
    }
  });
  observerInstance.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style'],
  });
  document.documentElement.setAttribute(OBSERVER_MARK, '1');

  (window as any).__m1_stop_readability__ = stopReadability;

  console.log('📱 [iOS] m1-ios-readability-hotfix installed');
}
