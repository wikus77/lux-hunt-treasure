// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Viseme Sync Hook - Precision scheduler for lip-sync

import { useRef, useState, useCallback } from 'react';

export type Viseme = { t: number; v: string };

interface UseVisemeSyncOptions {
  onTick?: (viseme: Viseme) => void;
  onComplete?: () => void;
}

export function useVisemeSync(options: UseVisemeSyncOptions = {}) {
  const { onTick, onComplete } = options;
  const [status, setStatus] = useState<'idle' | 'playing' | 'stopped'>('idle');
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const visemesRef = useRef<Viseme[]>([]);
  const currentIndexRef = useRef<number>(0);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const processVisemes = useCallback(() => {
    const elapsed = performance.now() - startTimeRef.current;
    const visemes = visemesRef.current;
    
    while (currentIndexRef.current < visemes.length) {
      const viseme = visemes[currentIndexRef.current];
      if (viseme.t <= elapsed) {
        onTick?.(viseme);
        currentIndexRef.current++;
      } else {
        break;
      }
    }

    if (currentIndexRef.current < visemes.length) {
      rafRef.current = requestAnimationFrame(processVisemes);
    } else {
      setStatus('idle');
      onComplete?.();
    }
  }, [onTick, onComplete]);

  const start = useCallback((visemes: Viseme[]) => {
    clearAllTimeouts();
    
    // Sort visemes by timestamp
    const sortedVisemes = [...visemes].sort((a, b) => a.t - b.t);
    visemesRef.current = sortedVisemes;
    currentIndexRef.current = 0;
    startTimeRef.current = performance.now();
    
    setStatus('playing');

    // For visemes with delay > 15ms, use setTimeout for CPU efficiency
    // For others, use RAF for precision
    sortedVisemes.forEach((viseme) => {
      if (viseme.t > 15) {
        const timeout = setTimeout(() => {
          onTick?.(viseme);
        }, viseme.t);
        timeoutsRef.current.push(timeout);
      }
    });

    // Start RAF loop for immediate visemes
    rafRef.current = requestAnimationFrame(processVisemes);

    // Set completion timeout
    if (sortedVisemes.length > 0) {
      const lastViseme = sortedVisemes[sortedVisemes.length - 1];
      const completionTimeout = setTimeout(() => {
        setStatus('idle');
        onComplete?.();
      }, lastViseme.t + 100);
      timeoutsRef.current.push(completionTimeout);
    }
  }, [clearAllTimeouts, onTick, onComplete, processVisemes]);

  const stop = useCallback(() => {
    clearAllTimeouts();
    visemesRef.current = [];
    currentIndexRef.current = 0;
    setStatus('stopped');
  }, [clearAllTimeouts]);

  return {
    start,
    stop,
    status
  };
}

export default useVisemeSync;




