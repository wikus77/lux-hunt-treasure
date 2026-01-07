/**
 * M1SSION™ iOS Keyboard Detection Hook
 * Detects when iOS keyboard is open to hide bottom navigation (like Telegram)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState, useCallback, useRef } from "react";

/**
 * Detect if we're on iOS/iPadOS
 */
const isIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

/**
 * Check if element is editable (input, textarea, contenteditable)
 */
const isEditableElement = (el: Element | null): boolean => {
  if (!el) return false;
  const tagName = el.tagName.toUpperCase();
  if (tagName === 'INPUT') {
    const type = (el as HTMLInputElement).type?.toLowerCase();
    // Only text-like inputs trigger keyboard
    return ['text', 'email', 'password', 'search', 'tel', 'url', 'number'].includes(type);
  }
  if (tagName === 'TEXTAREA') return true;
  if ((el as HTMLElement).isContentEditable) return true;
  if (el.getAttribute('contenteditable') === 'true') return true;
  return false;
};

/**
 * Hook that detects iOS keyboard visibility
 * 
 * Strategy for iOS PWA (where there's no direct keyboard event):
 * 1. PRIMARY: Monitor visualViewport.height changes (most reliable on iOS)
 * 2. FALLBACK: If visualViewport doesn't change enough, use focus-based detection
 * 3. COMBINED: Both conditions must align to avoid false positives
 * 
 * @param thresholdPx - Minimum height difference to consider keyboard open (default: 100px)
 * @returns boolean - true when keyboard is open
 */
export function useKeyboardVisible(thresholdPx = 100): boolean {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const initialViewportHeight = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Store initial viewport height on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initialViewportHeight.current = window.visualViewport?.height ?? window.innerHeight;
    }
  }, []);

  const computeKeyboardState = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const vv = window.visualViewport;
    const currentViewportH = vv?.height ?? window.innerHeight;
    const windowH = window.innerHeight;
    
    // Use the larger of initial height or window.innerHeight as reference
    const referenceH = Math.max(initialViewportHeight.current, windowH);
    const delta = referenceH - currentViewportH;
    
    // iOS keyboard typically takes 200-400px
    const keyboardLikelyOpen = delta > thresholdPx;
    
    // Also check if an editable element is focused
    const ae = document.activeElement;
    const isEditable = isEditableElement(ae);
    
    // For iOS: both conditions should be true
    // For non-iOS: just check focus (keyboard doesn't change viewport)
    const ios = isIOS();
    
    if (ios) {
      // On iOS: viewport MUST shrink AND editable must be focused
      setIsOpen(keyboardLikelyOpen && isEditable);
    } else {
      // On non-iOS: just check focus on editable elements
      // This is a simpler heuristic for Android/Desktop
      setIsOpen(isEditable && isFocused);
    }
  }, [thresholdPx, isFocused]);

  useEffect(() => {
    const vv = window.visualViewport;

    const onResize = () => {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Small delay to let iOS stabilize
      timeoutRef.current = setTimeout(computeKeyboardState, 50);
    };

    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as Element;
      if (isEditableElement(target)) {
        setIsFocused(true);
        // Give iOS time to resize viewport
        setTimeout(computeKeyboardState, 150);
      }
    };
    
    const onFocusOut = () => {
      setIsFocused(false);
      // Small delay to let iOS stabilize viewport
      setTimeout(() => {
        setIsOpen(false);
      }, 100);
    };

    // Listen to visualViewport events (iOS specific)
    vv?.addEventListener("resize", onResize);
    vv?.addEventListener("scroll", onResize);
    
    // Fallback window resize
    window.addEventListener("resize", onResize);
    
    // Focus events
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    // Initial check
    computeKeyboardState();

    return () => {
      vv?.removeEventListener("resize", onResize);
      vv?.removeEventListener("scroll", onResize);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [computeKeyboardState]);

  return isOpen;
}

export default useKeyboardVisible;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

