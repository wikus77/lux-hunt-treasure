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

    const readScroll = () => (containerEl ? containerEl.scrollTop : window.scrollY);

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

    const attachListener = (target: any) => {
      if (attachedTarget) attachedTarget.removeEventListener('scroll', onScroll);
      target.addEventListener('scroll', onScroll, { passive: true });
      attachedTarget = target;
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
          if (retryTimer) window.clearInterval(retryTimer);
        }
      };
      // Try a few times while the page mounts
      retryTimer = window.setInterval(tryAttach, 200);
      // Also try once on next frame
      requestAnimationFrame(tryAttach);
    }

    return () => {
      if (attachedTarget) attachedTarget.removeEventListener('scroll', onScroll);
      if (retryTimer) window.clearInterval(retryTimer);
    };
  }, [threshold, containerSelector]);

  return state;
};
