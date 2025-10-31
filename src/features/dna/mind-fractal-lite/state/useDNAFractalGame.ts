// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useCallback, useEffect } from 'react';

export interface DNAFractalGameState {
  seed: number;
  moves: number;
  connections: number;
  timeSpent: number;
  completionRatio: number;
  lastUpdate: number;
}

export interface DNAFractalGameActions {
  incrementMoves: () => void;
  incrementConnections: () => void;
  evolve: () => void;
  snapshot: () => DNAFractalGameState;
  reset: (newSeed?: number) => void;
}

/**
 * Game state management for Mind Fractal 3D
 * Tracks progress: moves, connections, time, completion ratio
 */
export function useDNAFractalGame(
  initialSeed: number,
  onPersist?: (state: DNAFractalGameState) => void
): [DNAFractalGameState, DNAFractalGameActions] {
  const [state, setState] = useState<DNAFractalGameState>({
    seed: initialSeed,
    moves: 0,
    connections: 0,
    timeSpent: 0,
    completionRatio: 0,
    lastUpdate: Date.now()
  });
  
  // Update time spent every second
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + 1
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Debounced persistence (every 5 seconds if changed)
  useEffect(() => {
    if (!onPersist) return;
    
    const timeout = setTimeout(() => {
      if (state.moves > 0 || state.connections > 0) {
        onPersist(state);
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [state.moves, state.connections, state.completionRatio, onPersist]);
  
  const incrementMoves = useCallback(() => {
    setState(prev => ({
      ...prev,
      moves: prev.moves + 1,
      lastUpdate: Date.now()
    }));
  }, []);
  
  const incrementConnections = useCallback(() => {
    setState(prev => ({
      ...prev,
      connections: prev.connections + 1,
      lastUpdate: Date.now()
    }));
  }, []);
  
  const evolve = useCallback(() => {
    setState(prev => {
      const newRatio = Math.min(prev.completionRatio + 0.05, 1.0);
      return {
        ...prev,
        completionRatio: newRatio,
        lastUpdate: Date.now()
      };
    });
    
    // Immediate persist on evolution
    if (onPersist) {
      setTimeout(() => {
        onPersist(state);
      }, 100);
    }
  }, [onPersist, state]);
  
  const snapshot = useCallback((): DNAFractalGameState => {
    return { ...state };
  }, [state]);
  
  const reset = useCallback((newSeed?: number) => {
    setState({
      seed: newSeed ?? initialSeed,
      moves: 0,
      connections: 0,
      timeSpent: 0,
      completionRatio: 0,
      lastUpdate: Date.now()
    });
  }, [initialSeed]);
  
  const actions: DNAFractalGameActions = {
    incrementMoves,
    incrementConnections,
    evolve,
    snapshot,
    reset
  };
  
  return [state, actions];
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
