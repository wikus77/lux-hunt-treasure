// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Pull to Refresh Hook for PWA

import { useEffect, useRef, useState } from 'react';

interface PullToRefreshOptions {
  onRefresh?: () => void | Promise<void>;
  threshold?: number; // pixels to pull before triggering refresh
  enabled?: boolean;
}

export const usePullToRefresh = (options: PullToRefreshOptions = {}) => {
  const { 
    onRefresh = () => window.location.reload(), 
    threshold = 150,
    enabled = true 
  } = options;
  
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const startY = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only activate when at top of page
      if (window.scrollY <= 0) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || isRefreshing) return;
      
      currentY.current = e.touches[0].clientY;
      const distance = currentY.current - startY.current;
      
      // Only track downward pulls when at top
      if (distance > 0 && window.scrollY <= 0) {
        // Apply resistance (pull feels harder as you go)
        const resistedDistance = Math.min(distance * 0.5, threshold * 1.5);
        setPullDistance(resistedDistance);
        
        // Prevent default scroll when pulling
        if (distance > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling || isRefreshing) return;
      
      if (pullDistance >= threshold) {
        // Trigger refresh
        setIsRefreshing(true);
        setPullDistance(threshold); // Keep at threshold during refresh
        
        try {
          await onRefresh();
        } catch (error) {
          console.error('Pull to refresh error:', error);
        }
        
        // Small delay before hiding
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
          setIsPulling(false);
        }, 500);
      } else {
        // Reset without refresh
        setPullDistance(0);
        setIsPulling(false);
      }
      
      startY.current = 0;
      currentY.current = 0;
    };

    // Add listeners with passive: false to allow preventDefault
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, isPulling, isRefreshing, pullDistance, threshold, onRefresh]);

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    progress: Math.min(pullDistance / threshold, 1), // 0 to 1
    shouldRefresh: pullDistance >= threshold
  };
};

export default usePullToRefresh;
