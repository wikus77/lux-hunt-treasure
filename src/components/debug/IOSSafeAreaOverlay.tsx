
// M1SSION™ - iOS Safe Area Debug Overlay
import React, { useEffect, useState } from 'react';
import { getSafeAreaInsets, detectCapacitorEnvironment } from '@/utils/iosCapacitorFunctions';

interface IOSSafeAreaOverlayProps {
  children: React.ReactNode;
  visible?: boolean;
  opacity?: number;
}

export const IOSSafeAreaOverlay: React.FC<IOSSafeAreaOverlayProps> = ({
  children,
  visible = false,
  opacity = 0.3
}) => {
  const [safeArea, setSafeArea] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const [isCapacitor, setIsCapacitor] = useState(false);

  useEffect(() => {
    const updateSafeArea = () => {
      const insets = getSafeAreaInsets();
      setSafeArea(insets);
      setIsCapacitor(detectCapacitorEnvironment());
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
  }, []);

  if (!visible || !isCapacitor) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div className="fixed inset-0 pointer-events-none z-[9998]">
      {/* Top safe area */}
      {safeArea.top > 0 && (
        <div
          className="absolute top-0 left-0 right-0 bg-red-500 flex items-center justify-center"
          style={{ 
            height: `${safeArea.top}px`,
            opacity
          }}
        >
          <span className="text-white text-xs font-mono">
            TOP SAFE AREA ({safeArea.top}px)
          </span>
        </div>
      )}

      {/* Bottom safe area */}
      {safeArea.bottom > 0 && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-blue-500 flex items-center justify-center"
          style={{ 
            height: `${safeArea.bottom}px`,
            opacity
          }}
        >
          <span className="text-white text-xs font-mono">
            BOTTOM SAFE AREA ({safeArea.bottom}px)
          </span>
        </div>
      )}

      {/* Left safe area */}
      {safeArea.left > 0 && (
        <div
          className="absolute top-0 bottom-0 left-0 bg-green-500 flex items-center justify-center"
          style={{ 
            width: `${safeArea.left}px`,
            opacity,
            writingMode: 'vertical-rl',
            textOrientation: 'mixed'
          }}
        >
          <span className="text-white text-xs font-mono">
            LEFT ({safeArea.left}px)
          </span>
        </div>
      )}

      {/* Right safe area */}
      {safeArea.right > 0 && (
        <div
          className="absolute top-0 bottom-0 right-0 bg-yellow-500 flex items-center justify-center"
          style={{ 
            width: `${safeArea.right}px`,
            opacity,
            writingMode: 'vertical-lr',
            textOrientation: 'mixed'
          }}
        >
          <span className="text-white text-xs font-mono">
            RIGHT ({safeArea.right}px)
          </span>
        </div>
      )}

      {/* Info panel */}
      <div className="absolute top-16 left-4 bg-black bg-opacity-80 text-white p-2 rounded text-xs font-mono">
        <div>Platform: {isCapacitor ? 'Capacitor' : 'Web'}</div>
        <div>Orientation: {window.innerWidth > window.innerHeight ? 'Landscape' : 'Portrait'}</div>
        <div>Viewport: {window.innerWidth}×{window.innerHeight}</div>
        <div>Safe Area: T{safeArea.top} B{safeArea.bottom} L{safeArea.left} R{safeArea.right}</div>
      </div>
      </div>
    </>
  );
};
