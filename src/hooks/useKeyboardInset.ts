/**
 * useKeyboardInset - Unified iOS keyboard height detection
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Uses visualViewport API to calculate exact keyboard overlap.
 * This is the ONLY reliable method on iOS WKWebView.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface KeyboardInsetState {
  /** Keyboard height in pixels (0 when closed) */
  inset: number;
  /** Whether keyboard is currently open */
  isOpen: boolean;
  /** Visual viewport height */
  viewportHeight: number;
  /** Initial window height (before keyboard) */
  initialHeight: number;
}

/**
 * Hook to track iOS keyboard height using visualViewport
 * @returns KeyboardInsetState with inset, isOpen, viewportHeight
 */
export function useKeyboardInset(): KeyboardInsetState {
  const [state, setState] = useState<KeyboardInsetState>({
    inset: 0,
    isOpen: false,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    initialHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  
  const initialHeightRef = useRef<number>(
    typeof window !== 'undefined' ? window.innerHeight : 0
  );
  const rafRef = useRef<number | null>(null);

  const updateInset = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const vv = window.visualViewport;
    if (!vv) {
      // Fallback: no visualViewport support
      setState(prev => ({ ...prev, inset: 0, isOpen: false }));
      return;
    }

    // On iOS, when keyboard opens:
    // - window.innerHeight stays the same (layout viewport)
    // - visualViewport.height shrinks (visual viewport)
    // - The difference is the keyboard height + any offset
    
    const layoutHeight = initialHeightRef.current;
    const visualHeight = vv.height;
    const offsetTop = vv.offsetTop || 0;
    
    // Calculate keyboard overlap
    // inset = layoutHeight - (visualHeight + offsetTop)
    // This gives us exactly how much the keyboard is covering
    const rawInset = layoutHeight - visualHeight - offsetTop;
    
    // Threshold: consider keyboard open if inset > 100px
    const isOpen = rawInset > 100;
    const inset = isOpen ? Math.max(0, rawInset) : 0;
    
    // Debug logging (remove in production)
    if (isOpen) {
      console.log('[useKeyboardInset]', {
        layoutHeight,
        visualHeight,
        offsetTop,
        rawInset,
        inset,
      });
    }

    setState({
      inset,
      isOpen,
      viewportHeight: visualHeight,
      initialHeight: layoutHeight,
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Store initial height on mount
    initialHeightRef.current = window.innerHeight;

    const handleResize = () => {
      // Use RAF to batch updates and prevent jank
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(updateInset);
    };

    // Listen to visualViewport changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }
    
    // Also listen to window resize as fallback
    window.addEventListener('resize', handleResize);
    
    // Also listen to focus events (keyboard trigger)
    const handleFocus = () => {
      // Small delay to let iOS settle
      setTimeout(handleResize, 100);
    };
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleFocus);

    // Initial check
    updateInset();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleFocus);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [updateInset]);

  return state;
}

export default useKeyboardInset;
