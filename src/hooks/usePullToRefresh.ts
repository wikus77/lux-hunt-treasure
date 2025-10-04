// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useState, useEffect, useCallback, useRef } from 'react';

interface PullToRefreshState {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
}

const PULL_THRESHOLD = 80; // Minimum pull distance to trigger refresh
const MAX_PULL_DISTANCE = 120; // Maximum visual pull distance

export const usePullToRefresh = (onRefresh: () => void | Promise<void>) => {
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
  });

  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isPWA = useRef<boolean>(false);

  useEffect(() => {
    // Check if running as PWA
    isPWA.current = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    // Only enable on mobile/PWA
    const isMobile = /iPad|iPhone|iPod|Android|Mobile/i.test(navigator.userAgent);
    if (!isMobile && !isPWA.current) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if at top of page
      if (window.scrollY === 0 && !state.isRefreshing) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY !== 0 || state.isRefreshing) return;

      currentY.current = e.touches[0].clientY;
      const pullDistance = Math.max(0, currentY.current - startY.current);

      if (pullDistance > 0) {
        // Prevent default scroll behavior
        e.preventDefault();
        
        // Apply resistance curve for natural feel
        const resistance = Math.min(pullDistance / 2, MAX_PULL_DISTANCE);
        
        setState({
          isPulling: true,
          pullDistance: resistance,
          isRefreshing: false,
        });
      }
    };

    const handleTouchEnd = async () => {
      if (!state.isPulling) return;

      if (state.pullDistance >= PULL_THRESHOLD) {
        // Trigger refresh
        setState({
          isPulling: false,
          pullDistance: 0,
          isRefreshing: true,
        });

        try {
          await onRefresh();
          // Add small delay for smooth UX
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error('Pull-to-refresh error:', error);
        } finally {
          setState({
            isPulling: false,
            pullDistance: 0,
            isRefreshing: false,
          });
        }
      } else {
        // Reset if didn't pull enough
        setState({
          isPulling: false,
          pullDistance: 0,
          isRefreshing: false,
        });
      }

      startY.current = 0;
      currentY.current = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [state.isPulling, state.pullDistance, state.isRefreshing, onRefresh]);

  return state;
};
