// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useState, useEffect, useCallback, useRef } from 'react';

interface PullToRefreshState {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
}

const PULL_THRESHOLD = 80;
const MAX_PULL_DISTANCE = 120;

function isScrollable(el: Element | null): el is HTMLElement {
  if (!el || !(el instanceof HTMLElement)) return false;
  const style = window.getComputedStyle(el);
  const overflowY = style.overflowY;
  const canScroll = el.scrollHeight > el.clientHeight;
  return canScroll && (overflowY === 'auto' || overflowY === 'scroll');
}

export const usePullToRefresh = (onRefresh: () => void | Promise<void>) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isPWA = useRef<boolean>(false);
  const scrollElRef = useRef<HTMLElement | null>(null);
  const pullingRef = useRef(false);
  const distanceRef = useRef(0);
  const refreshingRef = useRef(false);

  const stableOnRefresh = useCallback(onRefresh, []);

  // Sync refs with state (for handler closures without deps)
  useEffect(() => { pullingRef.current = isPulling; }, [isPulling]);
  useEffect(() => { distanceRef.current = pullDistance; }, [pullDistance]);
  useEffect(() => { refreshingRef.current = isRefreshing; }, [isRefreshing]);

  useEffect(() => {
    console.log('🔄 Pull-to-Refresh hook mounted');

    isPWA.current = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    const isMobile = /iPad|iPhone|iPod|Android|Mobile/i.test(navigator.userAgent);
    console.log('📱 Device check:', { isMobile, isPWA: isPWA.current });
    if (!isMobile && !isPWA.current) return;

    const findScrollableAncestor = (start: Element | null): HTMLElement | null => {
      let node: Element | null = start as Element | null;
      while (node && node !== document.body) {
        if (isScrollable(node)) return node as HTMLElement;
        node = node.parentElement;
      }
      // Fallback to main scroll containers commonly used
      const mapMain = document.querySelector('main');
      if (isScrollable(mapMain as Element)) return mapMain as HTMLElement;
      // Finally, fallback to document.scrollingElement
      return (document.scrollingElement as HTMLElement) || document.body;
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Identify scrollable container related to touch target
      const path = (e.composedPath && e.composedPath()) || [];
      const target = (path[0] as Element) || (e.target as Element | null);
      scrollElRef.current = findScrollableAncestor(target);

      const scrollTop = scrollElRef.current?.scrollTop ?? window.scrollY;
      if (scrollTop === 0 && !refreshingRef.current) {
        startY.current = e.touches[0].clientY;
        currentY.current = startY.current;
        // Do not set pulling yet; wait for positive delta
      } else {
        // Not at top; ignore gesture
        startY.current = 0;
        currentY.current = 0;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (refreshingRef.current) return;
      if (!startY.current) return;

      const container = scrollElRef.current;
      const scrollTop = container ? container.scrollTop : window.scrollY;
      if (scrollTop !== 0) return; // only when container is at very top

      currentY.current = e.touches[0].clientY;
      const rawDistance = currentY.current - startY.current;
      if (rawDistance <= 0) return;

      if (e.cancelable) e.preventDefault(); // prevent native scroll

      const resistance = Math.min(rawDistance / 2, MAX_PULL_DISTANCE);
      if (!pullingRef.current) setIsPulling(true);
      setPullDistance(resistance);
    };

    const handleTouchEnd = async () => {
      if (!pullingRef.current) {
        // reset
        startY.current = 0; currentY.current = 0; return;
      }

      const didReachThreshold = distanceRef.current >= PULL_THRESHOLD;
      setIsPulling(false);
      setPullDistance(0);

      if (didReachThreshold) {
        setIsRefreshing(true);
        try {
          await stableOnRefresh();
          await new Promise((r) => setTimeout(r, 400));
        } catch (error) {
          console.error('❌ Pull-to-refresh error:', error);
        } finally {
          setIsRefreshing(false);
        }
      }

      startY.current = 0;
      currentY.current = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true, capture: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, { capture: true } as any);
      document.removeEventListener('touchmove', handleTouchMove, { capture: true } as any);
      document.removeEventListener('touchend', handleTouchEnd, { capture: true } as any);
    };
  }, [stableOnRefresh]);

  return { isPulling, pullDistance, isRefreshing } as PullToRefreshState;
};
