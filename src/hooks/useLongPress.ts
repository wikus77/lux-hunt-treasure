
import { useState, useCallback, useRef } from 'react';

interface LongPressOptions {
  threshold?: number; // Time in ms to consider a press as a long press
  onStart?: () => void;
  onFinish?: () => void;
  onCancel?: () => void;
}

interface LongPressResult {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

/**
 * Hook for detecting long press events (for both mouse and touch events)
 */
export const useLongPress = (
  callback: () => void, 
  options: LongPressOptions = {}
): LongPressResult => {
  const { threshold = 500, onStart, onFinish, onCancel } = options;
  
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<NodeJS.Timeout>();
  const target = useRef<EventTarget>();

  const start = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.persist();
    
    // Prevent context menu on long press for touch events
    if ('touches' in e) {
      e.preventDefault();
    }
    
    const clonedEvent = { ...e };
    target.current = e.target;
    
    timeout.current = setTimeout(() => {
      onStart?.();
      setLongPressTriggered(true);
      callback();
      onFinish?.();
    }, threshold);
  }, [callback, onFinish, onStart, threshold]);

  const clear = useCallback(() => {
    // Prevent triggering if it was a short press/click
    timeout.current && clearTimeout(timeout.current);
    setLongPressTriggered(false);
    onCancel?.();
  }, [onCancel]);

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: (e: React.TouchEvent) => start(e),
    onTouchEnd: clear
  };
};
