import type { PillInfoPillId } from '@/contexts/PillInfoOverlayContext';

/** Reference `.hint-content { width: 300px }` — clamp on narrow phones */
export const HINT_CONTENT_W = 300;
export const PANEL_EST_H = 130;
export const MARGIN = 12;
export const SAFE_TOP_RESERVE = 118;
export const SAFE_BOTTOM_RESERVE = 96;
/** Reference offset hub → content start (matches PillHintBox margin 56 from hub centerline) */
export const HINT_OFFSET_ALONG = 56;
/** Reference offset hub edge → panel (matches PillHintBox top/bottom: 85) */
export const HINT_OFFSET_PERP = 85;
const HUB_MIN = 48;
const HUB_MAX = 72;
const REF_HUB = 60;
/** Estimated panel height (PillHintBox padding 35×2 + body) — viewport safety only */
const EST_PANEL_BOX_H = PANEL_EST_H + 70;

/** `data-position="1"` = content below hub; `"4"` = above (reference HTML). */
export type HintCssVariant = 1 | 4;

export type HintHorizontal = 'east' | 'west';

export type HintAnchorLayout = {
  /** Viewport center of pill (anchor getBoundingClientRect). */
  cx: number;
  cy: number;
  /** Decorative hub ≈ pill size (clamped), centered on cx,cy. */
  hubSize: number;
  variant: HintCssVariant;
  contentWidth: number;
  horizontal: HintHorizontal;
};

function safeAreaTop(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--sat').trim();
    if (v) return parseFloat(v) || 0;
  } catch {
    /* ignore */
  }
  return 0;
}

function safeAreaBottom(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--sab').trim();
    if (v) return parseFloat(v) || 0;
  } catch {
    /* ignore */
  }
  return 0;
}

/**
 * Explicit play-surface presets — **Battle (west + above)** is the BR reference.
 * Top row: panel **below** hub (variant 1), open toward center.
 * Bottom row: panel **above** hub (variant 4), symmetric to Battle.
 * Center: below-first (variant 1), horizontal from midline.
 *
 * Root cause addressed: dynamic `roomBelow >= roomAbove` picked different variants per pill
 * so connector distance / perceived “premium” did not match Battle even when horizontal matched.
 */
export const PLAY_SURFACE_HINT_PRESET: Record<
  PillInfoPillId,
  { horizontal: HintHorizontal; variant: HintCssVariant }
> = {
  action: { horizontal: 'east', variant: 1 },
  timer: { horizontal: 'west', variant: 1 },
  agent: { horizontal: 'east', variant: 1 },
  commit: { horizontal: 'east', variant: 4 },
  battle: { horizontal: 'west', variant: 4 },
};

function oppositeHorizontal(h: HintHorizontal): HintHorizontal {
  return h === 'east' ? 'west' : 'east';
}

function oppositeVariant(v: HintCssVariant): HintCssVariant {
  return v === 1 ? 4 : 1;
}

/** Axis-aligned bounds of the text panel in viewport space (hub-centered math, matches PillHintBox). */
function panelBoundsViewport(
  variant: HintCssVariant,
  horizontal: HintHorizontal,
  cx: number,
  cy: number,
  hubSize: number,
  contentW: number
): { left: number; top: number; right: number; bottom: number } {
  const half = hubSize / 2;
  const hubTop = cy - half;
  const hubBottom = cy + half;
  let left: number;
  let right: number;
  if (horizontal === 'east') {
    left = cx + HINT_OFFSET_ALONG;
    right = left + contentW;
  } else {
    right = cx - HINT_OFFSET_ALONG;
    left = right - contentW;
  }
  let top: number;
  let bottom: number;
  if (variant === 1) {
    top = hubTop + HINT_OFFSET_PERP;
    bottom = top + EST_PANEL_BOX_H;
  } else {
    bottom = hubBottom - HINT_OFFSET_PERP;
    top = bottom - EST_PANEL_BOX_H;
  }
  return { left, top, right, bottom };
}

function panelClipsViewport(
  b: { left: number; top: number; right: number; bottom: number },
  vw: number,
  vh: number,
  safeTop: number,
  safeBottom: number
): boolean {
  return (
    b.left < MARGIN - 0.5 ||
    b.right > vw - MARGIN + 0.5 ||
    b.top < safeTop - 0.5 ||
    b.bottom > vh - safeBottom + 0.5
  );
}

/** Apply preset; only override horizontal/variant/width when the panel would clip. */
function resolvePlaySurfaceLayout(
  pillId: PillInfoPillId,
  cx: number,
  cy: number,
  hubSize: number,
  contentWIn: number,
  vw: number,
  vh: number,
  safeTop: number,
  safeBottom: number
): { horizontal: HintHorizontal; variant: HintCssVariant; contentWidth: number } {
  const base = PLAY_SURFACE_HINT_PRESET[pillId];
  let horizontal: HintHorizontal =
    pillId === 'agent' ? (cx < vw * 0.5 ? 'east' : 'west') : base.horizontal;
  let variant: HintCssVariant = base.variant;
  let contentW = contentWIn;

  const tryCombo = (h: HintHorizontal, v: HintCssVariant, w: number) =>
    !panelClipsViewport(panelBoundsViewport(v, h, cx, cy, hubSize, w), vw, vh, safeTop, safeBottom);

  if (tryCombo(horizontal, variant, contentW)) {
    return { horizontal, variant, contentWidth: contentW };
  }

  const candidates: { h: HintHorizontal; v: HintCssVariant }[] = [
    { h: oppositeHorizontal(horizontal), v: variant },
    { h: horizontal, v: oppositeVariant(variant) },
    { h: oppositeHorizontal(horizontal), v: oppositeVariant(variant) },
  ];

  for (const c of candidates) {
    if (tryCombo(c.h, c.v, contentW)) {
      return { horizontal: c.h, variant: c.v, contentWidth: contentW };
    }
  }

  let w = contentW;
  while (w > 160 && !tryCombo(horizontal, variant, w)) {
    w -= 16;
  }
  if (!tryCombo(horizontal, variant, w)) {
    for (const c of candidates) {
      let w2 = contentWIn;
      while (w2 > 160 && !tryCombo(c.h, c.v, w2)) {
        w2 -= 16;
      }
      if (tryCombo(c.h, c.v, w2)) {
        return { horizontal: c.h, variant: c.v, contentWidth: w2 };
      }
    }
  }

  return {
    horizontal,
    variant,
    contentWidth: Math.max(160, w),
  };
}

/**
 * Hub exactly at anchor center; vertical + horizontal placement so hint content stays on-screen.
 * @param pillId When set (play surface), horizontal preference matches grid slot — Battle (west) is the BR reference.
 */
export function computeHintAnchor(
  anchor: DOMRect,
  vw: number,
  vh: number,
  pillId?: PillInfoPillId
): HintAnchorLayout {
  const cx = anchor.left + anchor.width / 2;
  const cy = anchor.top + anchor.height / 2;

  const sat = safeAreaTop();
  const sab = safeAreaBottom();
  const safeTop = sat + SAFE_TOP_RESERVE;
  const safeBottom = sab + SAFE_BOTTOM_RESERVE;

  const rawHub = Math.round(Math.min(anchor.width, anchor.height));
  const hubSize = Math.min(HUB_MAX, Math.max(HUB_MIN, rawHub > 0 ? rawHub : REF_HUB));

  let contentW = Math.min(HINT_CONTENT_W, Math.max(200, vw - MARGIN * 2));

  const half = hubSize / 2;

  let variant: HintCssVariant;
  let horizontal: HintHorizontal;

  if (pillId) {
    const resolved = resolvePlaySurfaceLayout(pillId, cx, cy, hubSize, contentW, vw, vh, safeTop, safeBottom);
    horizontal = resolved.horizontal;
    variant = resolved.variant;
    contentW = resolved.contentWidth;
    const eastLeft = cx + HINT_OFFSET_ALONG;
    const westRight = cx - HINT_OFFSET_ALONG;
    const westLeft = westRight - contentW;
    if (horizontal === 'east' && eastLeft + contentW > vw - MARGIN) {
      contentW = Math.max(160, vw - MARGIN - Math.max(MARGIN, eastLeft));
    }
    if (horizontal === 'west' && westLeft < MARGIN) {
      contentW = Math.max(160, westRight - MARGIN);
    }
  } else {
    const gap = HINT_OFFSET_PERP;
    const block = gap + PANEL_EST_H + 24;

    const roomAbove = cy - half - safeTop;
    const roomBelow = vh - safeBottom - (cy + half);

    const needBelowBottom = cy + half + gap + block;
    const needAboveTop = cy - half - gap - block;

    const fitsBelow = needBelowBottom <= vh - MARGIN;
    const fitsAbove = needAboveTop >= safeTop + MARGIN;

    if (!fitsBelow && fitsAbove) {
      variant = 4;
    } else if (fitsBelow && !fitsAbove) {
      variant = 1;
    } else if (fitsBelow && fitsAbove) {
      variant = roomBelow >= roomAbove ? 1 : 4;
    } else {
      variant = roomBelow >= roomAbove ? 1 : 4;
    }

    const eastLeft = cx + HINT_OFFSET_ALONG;
    const eastRight = eastLeft + contentW;
    const westRight = cx - HINT_OFFSET_ALONG;
    const westLeft = westRight - contentW;

    const preferEast = cx <= vw * 0.52;
    const eastOk = eastRight <= vw - MARGIN;
    const westOk = westLeft >= MARGIN;

    if (preferEast) {
      if (eastOk) horizontal = 'east';
      else if (westOk) horizontal = 'west';
      else {
        horizontal = 'east';
        contentW = Math.max(160, Math.min(contentW, vw - MARGIN - Math.max(MARGIN, eastLeft)));
      }
    } else {
      if (westOk) horizontal = 'west';
      else if (eastOk) horizontal = 'east';
      else {
        horizontal = 'west';
        contentW = Math.max(160, Math.min(contentW, Math.max(0, westRight - MARGIN)));
      }
    }

    if (horizontal === 'east' && eastLeft + contentW > vw - MARGIN) {
      contentW = Math.max(160, vw - MARGIN - Math.max(MARGIN, eastLeft));
    }
    if (horizontal === 'west' && westLeft < MARGIN) {
      contentW = Math.max(160, westRight - MARGIN);
    }
  }

  return {
    cx,
    cy,
    hubSize,
    variant,
    contentWidth: contentW,
    horizontal,
  };
}

/** Kept for i18n / future theming — reference UI uses #fff / #ffe4e4 */
export const PILL_HINT_ACCENT: Record<PillInfoPillId, { line: string; pulse: string; secondary: string }> = {
  action: { line: '#ffffff', pulse: '#ffe4e4', secondary: '#ffffff' },
  timer: { line: '#ffffff', pulse: '#ffe4e4', secondary: '#ffffff' },
  agent: { line: '#ffffff', pulse: '#ffe4e4', secondary: '#ffffff' },
  commit: { line: '#ffffff', pulse: '#ffe4e4', secondary: '#ffffff' },
  battle: { line: '#ffffff', pulse: '#ffe4e4', secondary: '#ffffff' },
};
