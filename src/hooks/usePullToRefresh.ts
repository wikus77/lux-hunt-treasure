// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useState, useEffect, useCallback, useRef } from 'react';

interface PullToRefreshState {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
}

const PULL_THRESHOLD = 80;
const MAX_PULL_DISTANCE = 120;

export const usePullToRefresh = (onRefresh: () => void | Promise<void>) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isPWA = useRef<boolean>(false);

  const stableOnRefresh = useCallback(onRefresh, []);

  useEffect(() => {
    console.log('🔄 Pull-to-Refresh hook mounted');
    
    isPWA.current = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    const isMobile = /iPad|iPhone|iPod|Android|Mobile/i.test(navigator.userAgent);
    
    console.log('📱 Device check:', { isMobile, isPWA: isPWA.current });
    
    if (!isMobile && !isPWA.current) {
      console.log('⚠️ Pull-to-refresh disabled: not mobile/PWA');
      return;
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        console.log('👆 Touch start at Y:', startY.current);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY !== 0) return;
      if (isRefreshing) return;

      currentY.current = e.touches[0].clientY;
      const rawDistance = currentY.current - startY.current;
      
      if (rawDistance > 0) {
        e.preventDefault();
        
        const resistance = Math.min(rawDistance / 2, MAX_PULL_DISTANCE);
        
        console.log('📏 Pull distance:', resistance);
        
        setIsPulling(true);
        setPullDistance(resistance);
      }
    };

    const handleTouchEnd = async () => {
      console.log('🖐️ Touch end - isPulling:', isPulling, 'distance:', pullDistance);
      
      if (isPulling && pullDistance >= PULL_THRESHOLD) {
        console.log('✅ Threshold reached, triggering refresh');
        
        setIsPulling(false);
        setPullDistance(0);
        setIsRefreshing(true);

        try {
          await stableOnRefresh();
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error('❌ Pull-to-refresh error:', error);
        } finally {
          setIsRefreshing(false);
        }
      } else {
        console.log('⏹️ Reset without refresh');
        setIsPulling(false);
        setPullDistance(0);
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
  }, [isPulling, pullDistance, isRefreshing, stableOnRefresh]);

  return { isPulling, pullDistance, isRefreshing };
};
