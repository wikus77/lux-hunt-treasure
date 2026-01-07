/**
 * M1SSION™ iOS Keyboard Detection Hook
 * Detects when iOS keyboard is open to hide bottom navigation (like Telegram)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState } from "react";

/**
 * Hook that detects iOS keyboard visibility
 * Uses visualViewport API + focus detection for reliable iOS PWA support
 * 
 * @param thresholdPx - Minimum height difference to consider keyboard open (default: 120px)
 * @returns boolean - true when keyboard is open
 */
export function useKeyboardVisible(thresholdPx = 120): boolean {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;

    const compute = () => {
      // iOS: keyboard reduces visualViewport height
      const viewportH = vv?.height ?? window.innerHeight;
      const windowH = window.innerHeight;

      const delta = windowH - viewportH;
      const openByResize = delta > thresholdPx;

      // Also require focus on an editable element to avoid false positives
      const ae = document.activeElement as HTMLElement | null;
      const isEditable =
        !!ae &&
        (ae.tagName === "INPUT" ||
          ae.tagName === "TEXTAREA" ||
          ae.isContentEditable ||
          ae.getAttribute("contenteditable") === "true");

      setIsOpen(openByResize && isEditable);
    };

    const onFocusIn = () => {
      // Small delay to let iOS adjust viewport
      setTimeout(compute, 100);
    };
    
    const onFocusOut = () => {
      // Small delay before hiding to avoid flicker
      setTimeout(() => setIsOpen(false), 50);
    };

    // Listen to visualViewport events (iOS specific)
    vv?.addEventListener("resize", compute);
    vv?.addEventListener("scroll", compute);
    
    // Fallback for non-iOS
    window.addEventListener("resize", compute);
    
    // Focus events
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    // Initial check
    compute();

    return () => {
      vv?.removeEventListener("resize", compute);
      vv?.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, [thresholdPx]);

  return isOpen;
}

export default useKeyboardVisible;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

