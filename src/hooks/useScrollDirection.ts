// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useState, useEffect } from 'react';

interface ScrollState {
  isScrollingUp: boolean;
  isScrollingDown: boolean;
  scrollY: number;
  shouldHideHeader: boolean;
}

export const useScrollDirection = (threshold: number = 50): ScrollState => {
  const [state, setState] = useState<ScrollState>({
    isScrollingUp: false,
    isScrollingDown: false,
    scrollY: 0,
    shouldHideHeader: false,
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking = false;
        return;
      }

      const isScrollingDown = scrollY > lastScrollY;
      const isScrollingUp = scrollY < lastScrollY;
      
      setState({
        isScrollingUp,
        isScrollingDown,
        scrollY,
        shouldHideHeader: isScrollingDown && scrollY > threshold,
      });

      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return state;
};
