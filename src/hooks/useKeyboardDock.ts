/**
 * M1SSION™ Keyboard Dock Hook
 * Tracks iOS keyboard position using visualViewport for precise docking
 * Safe for App Store - no private APIs
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface KeyboardDockState {
  isOpen: boolean;
  keyboardHeight: number;
  dockBottom: number; // CSS bottom value for docking above keyboard
  isChatInputFocused: boolean;
}

/**
 * Detects chat input focus via data-chat-input attribute
 */
const isChatInput = (el: Element | null): boolean => {
  if (!el) return false;
  return el.getAttribute('data-chat-input') === 'true';
};

/**
 * Hook that provides keyboard docking position for iOS
 * Uses visualViewport API (App Store safe)
 * 
 * @returns KeyboardDockState with keyboard position info
 */
export function useKeyboardDock(): KeyboardDockState {
  const [state, setState] = useState<KeyboardDockState>({
    isOpen: false,
    keyboardHeight: 0,
    dockBottom: 0,
    isChatInputFocused: false,
  });
  
  const initialViewportHeight = useRef<number>(0);
  const rafId = useRef<number>(0);

  const updatePosition = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const vv = window.visualViewport;
    if (!vv) {
      // Fallback for browsers without visualViewport
      setState(prev => ({ ...prev, isOpen: false, keyboardHeight: 0, dockBottom: 0 }));
      return;
    }
    
    // Calculate keyboard height
    // visualViewport.height is the visible area (shrinks when keyboard opens)
    // window.innerHeight stays the same
    const windowH = window.innerHeight;
    const viewportH = vv.height;
    const viewportOffsetTop = vv.offsetTop || 0;
    
    // Keyboard height = difference between window and viewport height
    const keyboardH = Math.max(0, windowH - viewportH - viewportOffsetTop);
    
    // Consider keyboard open if height > 100px (avoid false positives)
    const isKeyboardOpen = keyboardH > 100;
    
    // Check if a chat input is focused
    const activeEl = document.activeElement;
    const chatFocused = isChatInput(activeEl);
    
    // Dock bottom = keyboard height (so bar sits exactly above keyboard)
    // We use the keyboard height directly
    const dockBottom = isKeyboardOpen ? keyboardH : 0;
    
    setState({
      isOpen: isKeyboardOpen && chatFocused,
      keyboardHeight: keyboardH,
      dockBottom,
      isChatInputFocused: chatFocused,
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Store initial viewport height
    initialViewportHeight.current = window.visualViewport?.height ?? window.innerHeight;
    
    const vv = window.visualViewport;
    
    const handleChange = () => {
      // Use RAF to batch updates and avoid layout thrashing
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      rafId.current = requestAnimationFrame(updatePosition);
    };
    
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as Element;
      if (isChatInput(target)) {
        // Delay to let iOS resize viewport
        setTimeout(updatePosition, 100);
        setTimeout(updatePosition, 300); // Second check for slow keyboards
      }
    };
    
    const handleFocusOut = () => {
      // Delay to let iOS stabilize
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isOpen: false,
          isChatInputFocused: false,
          dockBottom: 0,
        }));
      }, 150);
    };
    
    // visualViewport events (most reliable on iOS)
    vv?.addEventListener('resize', handleChange);
    vv?.addEventListener('scroll', handleChange);
    
    // Focus events for chat input tracking
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    
    // Fallback window resize
    window.addEventListener('resize', handleChange);
    
    // Initial update
    updatePosition();
    
    return () => {
      vv?.removeEventListener('resize', handleChange);
      vv?.removeEventListener('scroll', handleChange);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('resize', handleChange);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [updatePosition]);

  return state;
}

export default useKeyboardDock;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
