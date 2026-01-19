/**
 * M1SSION™ Long Press Hook with Multi-Platform Feedback
 * Detects long press events for both mouse and touch
 * Includes haptic, audio, and visual feedback
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useCallback, useRef, useEffect } from 'react';

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
}

// Audio Context for click sound (singleton)
let audioContext: AudioContext | null = null;

/**
 * Play a short click/tap sound as feedback
 */
const playClickSound = () => {
  try {
    // Create AudioContext lazily
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Resume if suspended (required on iOS)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Short "tick" sound - 1800Hz for 30ms
    oscillator.frequency.value = 1800;
    oscillator.type = 'sine';
    
    // Fade out quickly
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.03);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.03);
    
  } catch (error) {
    console.debug('[useLongPress] Audio feedback not available');
  }
};

/**
 * Trigger haptic feedback (vibration) if supported
 */
const triggerHapticFeedback = () => {
  try {
    // Try vibration API (Android, some desktop browsers)
    if ('vibrate' in navigator) {
      navigator.vibrate([50]);
      return true;
    }
    
    // Try iOS webkit haptic (PWA)
    if ('webkit' in window && (window as any).webkit?.messageHandlers?.hapticFeedback) {
      (window as any).webkit.messageHandlers.hapticFeedback.postMessage('medium');
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Flash the screen edges as visual feedback
 */
const flashVisualFeedback = () => {
  try {
    // Create flash overlay
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 999999;
      background: radial-gradient(circle at center, transparent 30%, rgba(0, 209, 255, 0.3) 100%);
      animation: longPressFlash 0.2s ease-out forwards;
    `;
    
    // Add animation keyframes if not exists
    if (!document.getElementById('longpress-flash-style')) {
      const style = document.createElement('style');
      style.id = 'longpress-flash-style';
      style.textContent = `
        @keyframes longPressFlash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(flash);
    
    // Remove after animation
    setTimeout(() => {
      flash.remove();
    }, 200);
  } catch (error) {
    console.debug('[useLongPress] Visual feedback error');
  }
};

/**
 * Trigger all feedback mechanisms
 */
const triggerFeedback = () => {
  // Try haptic first
  const hapticWorked = triggerHapticFeedback();
  
  // Always play audio (works on iOS!)
  playClickSound();
  
  // Always show visual flash for extra feedback
  flashVisualFeedback();
  
  console.debug('[useLongPress] Feedback triggered - haptic:', hapticWorked);
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

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: (e: React.TouchEvent) => start(e),
    onTouchEnd: clear,
    onTouchMove: handleTouchMove
  };
};

export default useLongPress;
