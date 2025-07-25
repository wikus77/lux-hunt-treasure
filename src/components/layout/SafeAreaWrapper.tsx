// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useEffect, useState } from 'react';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  debug?: boolean;
}

const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0', 10),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0', 10),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0', 10),
  };
};

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  className = '',
  top = true,
  bottom = true,
  left = true,
  right = true,
  debug = false
}) => {
  const [safeArea, setSafeArea] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  useEffect(() => {
    const updateSafeArea = () => {
      const insets = getSafeAreaInsets();
      setSafeArea(insets);
      
      if (debug) {
        console.log('📱 Safe Area Insets:', insets);
      }
    };

    updateSafeArea();

    const handleOrientationChange = () => {
      setTimeout(updateSafeArea, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', updateSafeArea);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', updateSafeArea);
    };
  }, [debug]);

  const paddingStyle = {
    paddingTop: top ? `${safeArea.top}px` : undefined,
    paddingBottom: bottom ? `${safeArea.bottom}px` : undefined,
    paddingLeft: left ? `${safeArea.left}px` : undefined,
    paddingRight: right ? `${safeArea.right}px` : undefined,
  };

  return (
    <div 
      className={`safe-area-wrapper ${className}`}
      style={paddingStyle}
    >
      {debug && (
        <div className="fixed top-0 left-0 z-[10000] bg-red-500 text-white text-xs p-2">
          Safe Area: T:{safeArea.top} B:{safeArea.bottom} L:{safeArea.left} R:{safeArea.right}
        </div>
      )}
      {children}
    </div>
  );
};