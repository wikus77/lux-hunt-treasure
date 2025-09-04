// © 2025 M1SSION™ - PWA Pull to Refresh Hook
import { useEffect, useState } from 'react';

interface PullToRefreshOptions {
  threshold?: number;
  onRefresh?: () => void;
  enabled?: boolean;
}

export const usePullToRefresh = ({
  threshold = 70,
  onRefresh,
  enabled = true
}: PullToRefreshOptions = {}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    // Only enable in PWA standalone mode
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone;

    if (!isPWA) return;

    let startY = 0;
    let pulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (document.scrollingElement!.scrollTop === 0) {
        startY = e.touches[0].clientY;
        pulling = true;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling) return;

      const dy = e.touches[0].clientY - startY;
      
      if (dy > 0) {
        setPullDistance(Math.min(dy, threshold + 20));
        
        if (dy > threshold) {
          // Trigger refresh
          pulling = false;
          setIsPulling(false);
          setPullDistance(0);
          
          if (onRefresh) {
            onRefresh();
          } else {
            // Default behavior: reload page
            window.location.reload();
          }
        }
      }
    };

    const handleTouchEnd = () => {
      pulling = false;
      setIsPulling(false);
      setPullDistance(0);
    };

    // Set overscroll behavior
    document.body.style.overscrollBehaviorY = 'contain';

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      document.body.style.overscrollBehaviorY = '';
    };
  }, [threshold, onRefresh, enabled]);

  return {
    isPulling,
    pullDistance,
    isTriggered: pullDistance >= threshold
  };
};