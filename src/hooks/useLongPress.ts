/**
 * M1SSION™ Long Press Hook with Haptic Feedback
 * Detects long press events for both mouse and touch
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface LongPressOptions {
  threshold?: number; // Time in ms to consider a press as a long press (default 500)
  onStart?: () => void;
  onFinish?: () => void;
  onCancel?: () => void;
  hapticFeedback?: boolean; // Enable vibration feedback (default true)
  hapticPattern?: number | number[]; // Vibration pattern in ms
}

interface LongPressResult {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onTouchMove: () => void; // Cancel on move to prevent scroll conflicts
}

/**
 * Trigger haptic feedback (vibration) if supported
 */
const triggerHapticFeedback = (pattern: number | number[] = 50) => {
  try {
    // Check if vibration API is available
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
    // iOS doesn't support vibrate, but we can try other methods
    // Some devices support haptic through webkit
    if ('webkit' in window && (window as any).webkit?.messageHandlers?.hapticFeedback) {
      (window as any).webkit.messageHandlers.hapticFeedback.postMessage('medium');
    }
  } catch (error) {
    // Silently fail - haptic not available
    console.debug('[useLongPress] Haptic feedback not available');
  }
};

/**
 * Hook for detecting long press events (for both mouse and touch events)
 * Now includes haptic feedback!
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
    hapticFeedback = true,
    hapticPattern = [50] // Single short vibration
  } = options;
  
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const target = useRef<EventTarget | null>(null);
  const isPressed = useRef<boolean>(false);

  const start = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Only start if not already pressed
    if (isPressed.current) return;
    isPressed.current = true;
    
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
      
      // Trigger haptic feedback when long press is detected
      if (hapticFeedback) {
        triggerHapticFeedback(hapticPattern);
      }
      
      callback();
      onFinish?.();
    }, threshold);
  }, [callback, onFinish, onStart, threshold, hapticFeedback, hapticPattern]);

  const clear = useCallback(() => {
    isPressed.current = false;
    // Prevent triggering if it was a short press/click
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
    setLongPressTriggered(false);
    onCancel?.();
  }, [onCancel]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: (e: React.TouchEvent) => {
      start(e);
    },
    onTouchEnd: clear,
    onTouchMove: clear // Cancel on touch move to avoid interference with scrolling
  };
};

export default useLongPress;
