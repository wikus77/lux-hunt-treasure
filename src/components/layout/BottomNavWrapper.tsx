/**
 * M1SSION™ Bottom Navigation Wrapper
 * Wraps BottomNavigation with keyboard-hide support for iOS PWA
 * This wrapper is hidden when iOS keyboard is open (via CSS class .m1-keyboard-open)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import BottomNavigation from './BottomNavigation';

interface BottomNavWrapperProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Wrapper component that hides BottomNavigation when iOS keyboard is open
 * Uses data attribute for CSS targeting instead of ID (allows multiple instances)
 */
export const BottomNavWrapper: React.FC<BottomNavWrapperProps> = ({ className = '', style }) => {
  return (
    <div 
      data-bottom-nav-wrapper="true"
      className={`m1-bottom-nav-wrapper ${className}`}
      style={style}
    >
      <BottomNavigation />
    </div>
  );
};

export default BottomNavWrapper;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

