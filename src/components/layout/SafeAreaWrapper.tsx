
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

    // Listen for orientation changes
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

    paddingTop: top ? `${safeArea.top}px` : undefined,
    paddingBottom: bottom ? `${safeArea.bottom}px` : undefined,
    paddingLeft: left ? `${safeArea.left}px` : undefined,
    paddingRight: right ? `${safeArea.right}px` : undefined,
  } : {};

  return (
    <div 
      className={`safe-area-wrapper ${className}`}
      style={paddingStyle}
    >
        <div className="fixed top-0 left-0 z-[10000] bg-red-500 text-white text-xs p-2">
          Safe Area: T:{safeArea.top} B:{safeArea.bottom} L:{safeArea.left} R:{safeArea.right}
        </div>
      )}
      {children}
    </div>
  );
};
