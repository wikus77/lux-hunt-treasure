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
    const containerEl = containerSelector ? (document.querySelector(containerSelector) as HTMLElement | null) : null;
    let lastScroll = containerEl ? containerEl.scrollTop : window.scrollY;
    let ticking = false;

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

    const target: any = containerEl || window;
    target.addEventListener('scroll', onScroll, { passive: true });

    return () => target.removeEventListener('scroll', onScroll);
  }, [threshold, containerSelector]);

  return state;
};
