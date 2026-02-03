// © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
// TopSafeGradient: Web-first gradient overlay for iOS safe area
// Covers the white gap at top without modifying header/nav/hero

import React from 'react';

interface TopSafeGradientProps {
  /** Height below safe area (default 160px) */
  height?: number;
  /** Enable on all platforms or just iOS (default: all) */
  iosOnly?: boolean;
}

/**
 * Fixed gradient overlay that covers iOS safe area + top portion
 * - Position: fixed at top
 * - z-index: 10 (below header z-index 9999, above page content)
 * - pointer-events: none (doesn't block interactions)
 * - Gradient: M1SSION blue/purple → transparent → white blend
 */
export const TopSafeGradient: React.FC<TopSafeGradientProps> = ({
  height = 160,
  iosOnly = false,
}) => {
  // Skip render if iosOnly and not on iOS
  if (iosOnly && typeof window !== 'undefined') {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
    if (!isIOS) return null;
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        // Height: safe area + extra for gradient fade
        height: `calc(env(safe-area-inset-top, 47px) + ${height}px)`,
        // z-index: below header (9999) but above page background (0)
        zIndex: 10,
        // Don't block touches
        pointerEvents: 'none',
        // M1SSION gradient: blue/purple at top → transparent fade to white
        background: `linear-gradient(180deg,
          rgba(67, 97, 238, 0.75) 0%,
          rgba(114, 9, 183, 0.5) 15%,
          rgba(114, 9, 183, 0.3) 30%,
          rgba(255, 255, 255, 0.4) 50%,
          rgba(255, 255, 255, 0.7) 70%,
          rgba(255, 255, 255, 0.9) 85%,
          rgba(255, 255, 255, 1) 100%
        )`,
        // Subtle blur for premium feel (like Revolut)
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    />
  );
};

export default TopSafeGradient;
