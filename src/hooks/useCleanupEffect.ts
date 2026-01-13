/**
 * M1SSION™ useCleanupEffect Hook
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Hook per gestire effetti con cleanup automatico e robusto.
 * Previene memory leak su unmount specialmente su device con poca RAM.
 */

import { useEffect, useRef, useCallback } from 'react';

type CleanupFunction = () => void;
type EffectCallback = () => CleanupFunction | void;

/**
 * useCleanupEffect - come useEffect ma con tracking dei cleanup
 * Utile per debugging memory leak
 */
export function useCleanupEffect(
  effect: EffectCallback,
  deps: React.DependencyList,
  debugLabel?: string
) {
  const cleanupRef = useRef<CleanupFunction | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Run effect
    const cleanup = effect();
    if (typeof cleanup === 'function') {
      cleanupRef.current = cleanup;
    }

    return () => {
      mountedRef.current = false;
      if (cleanupRef.current) {
        try {
          cleanupRef.current();
        } catch (e) {
          console.warn(`[Cleanup:${debugLabel || 'unknown'}] Error:`, e);
        }
        cleanupRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return mountedRef;
}

/**
 * useSafeInterval - setInterval con cleanup automatico
 */
export function useSafeInterval(
  callback: () => void,
  delay: number | null,
  enabled = true
) {
  const savedCallback = useRef(callback);
  const intervalRef = useRef<number | null>(null);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (!enabled || delay === null) {
      return;
    }

    const tick = () => {
      savedCallback.current();
    };

    intervalRef.current = window.setInterval(tick, delay);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [delay, enabled]);

  // Return function to clear interval manually
  return useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
}

/**
 * useSafeTimeout - setTimeout con cleanup automatico
 */
export function useSafeTimeout(
  callback: () => void,
  delay: number | null,
  enabled = true
) {
  const savedCallback = useRef(callback);
  const timeoutRef = useRef<number | null>(null);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the timeout
  useEffect(() => {
    if (!enabled || delay === null) {
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      savedCallback.current();
      timeoutRef.current = null;
    }, delay);

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [delay, enabled]);

  // Return function to clear timeout manually
  return useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
}

/**
 * useIsMounted - semplice check per sapere se componente è montato
 */
export function useIsMounted(): () => boolean {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(() => mountedRef.current, []);
}

/**
 * useDebounce - ritarda l'esecuzione di un valore/callback
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Import useState for useDebounce
import { useState } from 'react';

export default useCleanupEffect;

