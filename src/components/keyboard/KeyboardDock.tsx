/**
 * KeyboardDock - Unified iOS keyboard-docked input wrapper
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * CRITICAL: Uses React Portal to render at document root level.
 * This avoids the iOS bug where position:fixed inside a container
 * with backdrop-filter/transform becomes relative to that container.
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useKeyboardInset } from '@/hooks/useKeyboardInset';

interface KeyboardDockProps {
  children: React.ReactNode;
  /** Additional className for the dock container */
  className?: string;
  /** Gap between dock and keyboard top (default: 0) */
  gapPx?: number;
  /** Whether the dock is currently visible/active */
  isActive?: boolean;
  /** Z-index for the dock (default: 60000) */
  zIndex?: number;
  /** Bottom offset when keyboard is closed (default: 0 = safe-area only) */
  closedBottomPx?: number;
}

/**
 * KeyboardDock - Renders children in a portal that docks to keyboard
 * 
 * Usage:
 * ```tsx
 * <KeyboardDock isActive={true} gapPx={8}>
 *   <InputBar />
 * </KeyboardDock>
 * ```
 */
export const KeyboardDock: React.FC<KeyboardDockProps> = ({
  children,
  className = '',
  gapPx = 0,
  isActive = true,
  zIndex = 60000,
  closedBottomPx = 0,
}) => {
  const { inset, isOpen } = useKeyboardInset();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !isActive) {
    return null;
  }

  // Calculate bottom position
  // When keyboard open: inset - gapPx (dock just above keyboard)
  // When keyboard closed: safe-area + closedBottomPx
  const bottomValue = isOpen
    ? `${inset - gapPx}px`
    : `calc(env(safe-area-inset-bottom, 0px) + ${closedBottomPx}px)`;

  const dockStyle: React.CSSProperties = {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    // Use transform for smooth animation and to position above keyboard
    transform: isOpen ? `translateY(-${inset - gapPx}px)` : 'translateY(0)',
    zIndex,
    // Smooth transition
    transition: 'transform 0.15s ease-out',
    // Ensure it's above everything
    pointerEvents: 'auto',
  };

  const content = (
    <div 
      className={`keyboard-dock ${className}`}
      style={dockStyle}
      data-keyboard-open={isOpen}
      data-keyboard-inset={inset}
    >
      {children}
    </div>
  );

  // Use portal to render at document body level
  // This bypasses any parent with transform/backdrop-filter
  return createPortal(content, document.body);
};

export default KeyboardDock;
