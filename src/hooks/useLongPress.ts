/**
 * M1SSION™ Long Press Hook with Multi-Platform Feedback
 * Detects long press events for both mouse and touch
 * Uses centralized haptics utility for cross-platform feedback
 * 
 * 🔧 FIX v6 (22/01/2026): Switched to centralized haptics.ts for iOS PWA support
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { hapticMedium } from '@/utils/haptics';

interface LongPressOptions {
  threshold?: number; // Time in ms to consider a press as a long press (default 500)
  onStart?: () => void;
  onFinish?: () => void;
  onCancel?: () => void;
  hapticFeedback?: boolean; // Enable feedback (default true)
}

interface LongPressResult {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onTouchMove: (e: React.TouchEvent) => void;
  // 🔧 FIX v6: Added Pointer Events for better iOS support
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onPointerMove: (e: React.PointerEvent) => void;
}

/**
 * 🔧 FIX v6: Trigger feedback using centralized haptics utility
 * This handles iOS PWA fallback (audio + visual) automatically
 */
const triggerFeedback = () => {
  // Use centralized haptic utility - handles iOS PWA fallback
  const result = hapticMedium();
  console.debug('[useLongPress] Feedback triggered via haptics.ts:', result);
};

/**
 * Hook for detecting long press events (for both mouse and touch events)
 * Includes multi-platform feedback!
 */
export const useLongPress = (
  callback: () => void, 
  options: LongPressOptions = {}
): LongPressResult => {
  const { 
    threshold = 500, 
    onStart, 
    onFinish, 
    onCancel,
    hapticFeedback = true
  } = options;
  
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const target = useRef<EventTarget | null>(null);
  const isPressed = useRef<boolean>(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const start = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Only start if not already pressed
    if (isPressed.current) return;
    isPressed.current = true;
    
    // Store initial position for move detection
    if ('touches' in e) {
      startPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    } else {
      startPos.current = {
        x: e.clientX,
        y: e.clientY
      };
    }
    
    // Store the target
    target.current = e.target;
    
    // Clear any existing timeout
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    
    timeout.current = setTimeout(() => {
      if (!isPressed.current) return; // Double check we're still pressed
      
      onStart?.();
      setLongPressTriggered(true);
      
      // Trigger all feedback mechanisms
      if (hapticFeedback) {
        triggerFeedback();
      }
      
      callback();
      onFinish?.();
    }, threshold);
  }, [callback, onFinish, onStart, threshold, hapticFeedback]);

  const clear = useCallback(() => {
    isPressed.current = false;
    startPos.current = null;
    // Prevent triggering if it was a short press/click
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
    setLongPressTriggered(false);
    onCancel?.();
  }, [onCancel]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Cancel if moved more than 10px
    if (startPos.current && isPressed.current) {
      const moveX = Math.abs(e.touches[0].clientX - startPos.current.x);
      const moveY = Math.abs(e.touches[0].clientY - startPos.current.y);
      if (moveX > 10 || moveY > 10) {
        clear();
      }
    }
  }, [clear]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  // 🔧 FIX v6: Handle pointer events for better iOS support
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (startPos.current && isPressed.current) {
      const moveX = Math.abs(e.clientX - startPos.current.x);
      const moveY = Math.abs(e.clientY - startPos.current.y);
      if (moveX > 10 || moveY > 10) {
        clear();
      }
    }
  }, [clear]);

  return {
    // Mouse events (desktop)
    onMouseDown: (e: React.MouseEvent) => start(e),
    onMouseUp: clear,
    onMouseLeave: clear,
    // Touch events (mobile fallback)
    onTouchStart: (e: React.TouchEvent) => start(e),
    onTouchEnd: clear,
    onTouchMove: handleTouchMove,
    // 🔧 FIX v6: Pointer events (unified, better iOS support)
    onPointerDown: (e: React.PointerEvent) => start(e as any),
    onPointerUp: clear,
    onPointerCancel: clear,
    onPointerMove: handlePointerMove,
  };
};

export default useLongPress;
