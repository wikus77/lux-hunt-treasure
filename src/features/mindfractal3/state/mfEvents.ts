// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

/**
 * Mind Fractal Events - CustomEvent bus for component communication
 * 
 * Events:
 * - mindfractal:node-selected { id, theme, worldPos }
 * - mindfractal:link-created { from, to, length, ts }
 * - mindfractal:evolve { theme, level, theme_links }
 * - mindfractal:nodes-regenerated
 */

export function emitNodeSelected(id: number, theme: string, worldPos: [number, number, number]): void {
  window.dispatchEvent(new CustomEvent('mindfractal:node-selected', {
    detail: { id, theme, worldPos }
  }));
}

export function emitLinkCreated(from: number, to: number, theme: string, length: number): void {
  window.dispatchEvent(new CustomEvent('mindfractal:link-created', {
    detail: { from, to, theme, length, ts: Date.now() }
  }));
}

export function emitEvolve(theme: string, level: number, themeLinks: number): void {
  window.dispatchEvent(new CustomEvent('mindfractal:evolve', {
    detail: { theme, level, theme_links: themeLinks }
  }));
}

export function emitNodesRegenerated(): void {
  window.dispatchEvent(new CustomEvent('mindfractal:nodes-regenerated'));
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
