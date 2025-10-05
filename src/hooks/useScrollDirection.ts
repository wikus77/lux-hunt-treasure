// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useState, useEffect } from 'react';

interface ScrollState {
  isScrollingUp: boolean;
  isScrollingDown: boolean;
  scrollY: number;
  shouldHideHeader: boolean;
}

// Enhanced: can observe window or a specific scrollable container via CSS selector
export const useScrollDirection = (threshold: number = 50, containerSelector?: string): ScrollState => {
  const [state, setState] = useState<ScrollState>({
    isScrollingUp: false,
    isScrollingDown: false,
    scrollY: 0,
    shouldHideHeader: false,
  });

  useEffect(() => {
    let containerEl: HTMLElement | null = containerSelector ? (document.querySelector(containerSelector) as HTMLElement | null) : null;
    let lastScroll = containerEl ? containerEl.scrollTop : window.scrollY;
    let ticking = false;
    let attachedTarget: any = null;
    let retryTimer: number | undefined;

    // Fallback virtual scroll for non-scrollable containers (e.g., map gestures)
    let virtualScroll = 0;
    let wheelTarget: any = null;
    let touchStartY: number | null = null;

    const readScroll = () => (containerEl ? containerEl.scrollTop : window.scrollY) + virtualScroll;

    const setFromDelta = (deltaY: number) => {
      // Only used when container cannot scroll
      if (deltaY === 0) return;
      const current = readScroll() + deltaY;
      const isScrollingDown = deltaY > 0;
      const isScrollingUp = deltaY < 0;
      virtualScroll += deltaY;
      setState({
        isScrollingDown,
        isScrollingUp,
        scrollY: current,
        shouldHideHeader: isScrollingDown && Math.abs(virtualScroll) > threshold,
      });
    };

    const updateScrollDirection = () => {
      const current = readScroll();

      if (Math.abs(current - lastScroll) < threshold) {
        ticking = false;
        return;
      }

      const isScrollingDown = current > lastScroll;
      const isScrollingUp = current < lastScroll;
      
      setState({
        isScrollingUp,
        isScrollingDown,
        scrollY: current,
        shouldHideHeader: isScrollingDown && current > threshold,
      });

      lastScroll = current > 0 ? current : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    const onWheel = (e: WheelEvent) => {
      // If container can't scroll, emulate scroll behavior so header can hide
      if (containerEl && containerEl.scrollHeight <= containerEl.clientHeight) {
        setFromDelta(e.deltaY);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartY == null) return;
      const currentY = e.touches[0]?.clientY ?? touchStartY;
      const deltaY = touchStartY - currentY; // positive when moving up (content would scroll down)
      if (containerEl && containerEl.scrollHeight <= containerEl.clientHeight) {
        setFromDelta(deltaY);
      }
      touchStartY = currentY;
    };

    const attachListener = (target: any) => {
      if (attachedTarget) attachedTarget.removeEventListener('scroll', onScroll);
      target.addEventListener('scroll', onScroll, { passive: true });
      attachedTarget = target;
    };

    const attachGestureFallbacks = () => {
      // Attach to container itself
      if (containerEl) {
        containerEl.addEventListener('wheel', onWheel, { passive: true });
        containerEl.addEventListener('touchstart', onTouchStart, { passive: true });
        containerEl.addEventListener('touchmove', onTouchMove, { passive: true });
      }
      // Also try Leaflet map container if present
      const leaflet = document.querySelector('.leaflet-container') as HTMLElement | null;
      if (leaflet) {
        wheelTarget = leaflet;
        leaflet.addEventListener('wheel', onWheel, { passive: true });
        leaflet.addEventListener('touchstart', onTouchStart, { passive: true });
        leaflet.addEventListener('touchmove', onTouchMove, { passive: true });
      }
      // Debug
      console.debug('useScrollDirection: attached gesture fallbacks', {
        containerSelector,
        containerScrollable: containerEl ? containerEl.scrollHeight > containerEl.clientHeight : undefined,
        leafletFound: !!leaflet,
      });
    };

    // Initial attach: window, then try to switch to container when it exists
    attachListener(window);

    if (containerSelector) {
      const tryAttach = () => {
        const el = document.querySelector(containerSelector) as HTMLElement | null;
        if (el && el !== containerEl) {
          containerEl = el;
          lastScroll = readScroll();
          attachListener(containerEl);
          // Gesture fallback if not scrollable
          if (containerEl.scrollHeight <= containerEl.clientHeight) {
            attachGestureFallbacks();
          }
          if (retryTimer) window.clearInterval(retryTimer);
          console.debug('useScrollDirection: attached to container', {
            containerSelector,
            scrollHeight: containerEl.scrollHeight,
            clientHeight: containerEl.clientHeight,
          });
        }
      };
      // Try a few times while the page mounts
      retryTimer = window.setInterval(tryAttach, 200);
      // Also try once on next frame
      requestAnimationFrame(tryAttach);
    }

    return () => {
      if (attachedTarget) attachedTarget.removeEventListener('scroll', onScroll);
      if (containerEl) {
        containerEl.removeEventListener('wheel', onWheel as any);
        containerEl.removeEventListener('touchstart', onTouchStart as any);
        containerEl.removeEventListener('touchmove', onTouchMove as any);
      }
      if (wheelTarget) {
        wheelTarget.removeEventListener('wheel', onWheel as any);
        wheelTarget.removeEventListener('touchstart', onTouchStart as any);
        wheelTarget.removeEventListener('touchmove', onTouchMove as any);
      }
      if (retryTimer) window.clearInterval(retryTimer);
    };
  }, [threshold, containerSelector]);

  return state;
};
