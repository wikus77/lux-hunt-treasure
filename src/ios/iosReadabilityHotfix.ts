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
  '.settings-modal',
  '[data-m1-mpe-sheet]',
];

const HOTFIX_CSS = `
/* WKWEBVIEW READABILITY — base + -webkit-text-fill-color for WKWebView */
#m1-modal-portal,.m1-reward-zone-popup,[data-radix-dialog-content],[data-radix-alert-dialog-content],[data-radix-popover-content],[data-radix-select-content],[data-vaul-drawer],.settings-modal,[data-m1-mpe-sheet] { color: rgba(255,255,255,0.92) !important; -webkit-text-fill-color: rgba(255,255,255,0.92) !important; text-shadow: 0 1px 1px rgba(0,0,0,0.35) !important; }
#m1-settings-section-portal,#m1-profile-portal { color: rgba(255,255,255,0.92) !important; -webkit-text-fill-color: rgba(255,255,255,0.92) !important; }
/* muted + gray */
#m1-modal-portal .text-muted-foreground,#m1-modal-portal [class*="text-muted-foreground"],#m1-modal-portal .text-gray-400,#m1-modal-portal .text-gray-500,
#m1-settings-section-portal .text-muted-foreground,#m1-settings-section-portal [class*="text-muted-foreground"],#m1-settings-section-portal .text-gray-400,#m1-settings-section-portal .text-gray-500,
#m1-profile-portal .text-muted-foreground,#m1-profile-portal [class*="text-muted-foreground"],#m1-profile-portal .text-gray-400,#m1-profile-portal .text-gray-500 { color: rgba(255,255,255,0.78) !important; -webkit-text-fill-color: rgba(255,255,255,0.78) !important; text-shadow: 0 0 1px rgba(0,0,0,0.3); }
.m1-reward-zone-popup .text-muted-foreground,.m1-reward-zone-popup [class*="text-muted-foreground"],.m1-reward-zone-popup .text-gray-400,.m1-reward-zone-popup .text-gray-500 { color: rgba(255,255,255,0.78) !important; -webkit-text-fill-color: rgba(255,255,255,0.78) !important; text-shadow: 0 0 1px rgba(0,0,0,0.3); }
[data-radix-dialog-content] .text-muted-foreground,[data-radix-dialog-content] [class*="text-muted-foreground"],[data-radix-dialog-content] .text-gray-400,[data-radix-dialog-content] .text-gray-500,
[data-radix-alert-dialog-content] .text-muted-foreground,[data-radix-alert-dialog-content] [class*="text-muted-foreground"],[data-radix-alert-dialog-content] .text-gray-400,[data-radix-alert-dialog-content] .text-gray-500,
[data-radix-popover-content] .text-muted-foreground,[data-radix-popover-content] [class*="text-muted-foreground"],[data-radix-popover-content] .text-gray-400,[data-radix-popover-content] .text-gray-500,
[data-radix-select-content] .text-muted-foreground,[data-radix-select-content] [class*="text-muted-foreground"],[data-radix-select-content] .text-gray-400,[data-radix-select-content] .text-gray-500,
[data-vaul-drawer] .text-muted-foreground,[data-vaul-drawer] [class*="text-muted-foreground"],[data-vaul-drawer] .text-gray-400,[data-vaul-drawer] .text-gray-500,
.settings-modal .text-muted-foreground,.settings-modal [class*="text-muted-foreground"],.settings-modal .text-gray-400,.settings-modal .text-gray-500 { color: rgba(255,255,255,0.78) !important; -webkit-text-fill-color: rgba(255,255,255,0.78) !important; text-shadow: 0 0 1px rgba(0,0,0,0.3); }
[data-m1-mpe-sheet] .text-muted-foreground,[data-m1-mpe-sheet] [class*="text-muted-foreground"],[data-m1-mpe-sheet] .text-gray-400,[data-m1-mpe-sheet] .text-gray-500,[data-m1-mpe-sheet] [class*="text-white/"] { color: rgba(255,255,255,0.88) !important; -webkit-text-fill-color: rgba(255,255,255,0.88) !important; text-shadow: 0 1px 1px rgba(0,0,0,0.35) !important; }
/* foreground */
#m1-modal-portal .text-foreground,#m1-modal-portal [class*="text-foreground"]:not([class*="muted"]),#m1-settings-section-portal .text-foreground,#m1-settings-section-portal [class*="text-foreground"]:not([class*="muted"]),#m1-profile-portal .text-foreground,#m1-profile-portal [class*="text-foreground"]:not([class*="muted"]) { color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; }
.m1-reward-zone-popup .text-foreground,.m1-reward-zone-popup [class*="text-foreground"]:not([class*="muted"]) { color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; }
[data-radix-dialog-content] .text-foreground,[data-radix-dialog-content] [class*="text-foreground"]:not([class*="muted"]),[data-radix-alert-dialog-content] .text-foreground,[data-radix-alert-dialog-content] [class*="text-foreground"]:not([class*="muted"]),[data-radix-popover-content] .text-foreground,[data-radix-popover-content] [class*="text-foreground"]:not([class*="muted"]),[data-radix-select-content] .text-foreground,[data-radix-select-content] [class*="text-foreground"]:not([class*="muted"]),[data-vaul-drawer] .text-foreground,[data-vaul-drawer] [class*="text-foreground"]:not([class*="muted"]),.settings-modal .text-foreground,.settings-modal [class*="text-foreground"]:not([class*="muted"]),[data-m1-mpe-sheet] .text-foreground,[data-m1-mpe-sheet] [class*="text-foreground"]:not([class*="muted"]),[data-m1-mpe-sheet] h1,[data-m1-mpe-sheet] h2,[data-m1-mpe-sheet] p,[data-m1-mpe-sheet] span,[data-m1-mpe-sheet] button { color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; text-shadow: 0 1px 1px rgba(0,0,0,0.35) !important; }
/* placeholder */
#m1-modal-portal input::placeholder,#m1-modal-portal textarea::placeholder,#m1-settings-section-portal input::placeholder,#m1-settings-section-portal textarea::placeholder,#m1-profile-portal input::placeholder,#m1-profile-portal textarea::placeholder,
.m1-reward-zone-popup input::placeholder,.m1-reward-zone-popup textarea::placeholder,
[data-radix-dialog-content] input::placeholder,[data-radix-dialog-content] textarea::placeholder,[data-radix-alert-dialog-content] input::placeholder,[data-radix-alert-dialog-content] textarea::placeholder,[data-radix-popover-content] input::placeholder,[data-radix-popover-content] textarea::placeholder,[data-radix-select-content] input::placeholder,[data-radix-select-content] textarea::placeholder,[data-vaul-drawer] input::placeholder,[data-vaul-drawer] textarea::placeholder,.settings-modal input::placeholder,.settings-modal textarea::placeholder,[data-m1-mpe-sheet] input::placeholder,[data-m1-mpe-sheet] textarea::placeholder { color: rgba(255,255,255,0.48) !important; -webkit-text-fill-color: rgba(255,255,255,0.48) !important; }
/* disabled */
#m1-modal-portal input:disabled,#m1-modal-portal textarea:disabled,#m1-settings-section-portal input:disabled,#m1-settings-section-portal textarea:disabled,#m1-profile-portal input:disabled,#m1-profile-portal textarea:disabled,
.m1-reward-zone-popup input:disabled,.m1-reward-zone-popup textarea:disabled,
[data-radix-dialog-content] input:disabled,[data-radix-dialog-content] textarea:disabled,[data-radix-alert-dialog-content] input:disabled,[data-radix-alert-dialog-content] textarea:disabled,[data-radix-popover-content] input:disabled,[data-radix-popover-content] textarea:disabled,[data-radix-select-content] input:disabled,[data-radix-select-content] textarea:disabled,[data-vaul-drawer] input:disabled,[data-vaul-drawer] textarea:disabled,.settings-modal input:disabled,.settings-modal textarea:disabled,[data-m1-mpe-sheet] input:disabled,[data-m1-mpe-sheet] textarea:disabled { opacity: 1 !important; color: rgba(255,255,255,0.70) !important; -webkit-text-fill-color: rgba(255,255,255,0.70) !important; filter: none !important; }
`;

function harden(el: Element): void {
  if (!(el instanceof HTMLElement)) return;
  const html = el as HTMLElement;
  const cn = html.className;
  if (typeof cn === 'string' && /\bopacity-\d+\b/.test(cn)) {
    html.className = cn.replace(/\bopacity-\d+\b/g, '').replace(/\s+/g, ' ').trim();
  }
  html.style.setProperty('opacity', '1', 'important');
  html.style.setProperty('filter', 'none', 'important');
}

function sweep(): void {
  for (const sel of ROOT_SELECTORS) {
    try {
      const roots = document.querySelectorAll(sel);
      roots.forEach((root) => {
        harden(root);
        root.querySelectorAll('*').forEach((desc) => harden(desc));
      });
    } catch (_) {
      /* ignore invalid selector */
    }
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

  observerInstance = new MutationObserver(() => scheduleSweep());
  observerInstance.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style'],
  });
  document.documentElement.setAttribute(OBSERVER_MARK, '1');

  (window as any).__m1_stop_readability__ = stopReadability;

  console.log('📱 [iOS] m1-ios-readability-hotfix installed (mpe+modals)');
}
