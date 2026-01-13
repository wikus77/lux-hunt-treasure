/**
 * M1SSION™ Timer Cleanup Utility
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * PROBLEMA RISOLTO:
 * - setTimeout/setInterval non puliti causano memory leak
 * - Su device con meno RAM (iPhone 15 vs 16), questo causa crash
 * 
 * SOLUZIONE:
 * - Registrazione centralizzata dei timer
 * - Cleanup automatico
 */

type TimerType = 'timeout' | 'interval';

interface RegisteredTimer {
  id: number;
  type: TimerType;
  createdAt: number;
  source: string;
}

class TimerManager {
  private static instance: TimerManager;
  private timers: Map<number, RegisteredTimer> = new Map();
  
  private constructor() {}
  
  static getInstance(): TimerManager {
    if (!TimerManager.instance) {
      TimerManager.instance = new TimerManager();
    }
    return TimerManager.instance;
  }
  
  /**
   * Wrapper sicuro per setTimeout con auto-registrazione
   */
  setTimeout(callback: () => void, delay: number, source = 'unknown'): number {
    const id = window.setTimeout(() => {
      callback();
      this.timers.delete(id);
    }, delay);
    
    this.timers.set(id, {
      id,
      type: 'timeout',
      createdAt: Date.now(),
      source,
    });
    
    return id;
  }
  
  /**
   * Wrapper sicuro per setInterval con auto-registrazione
   */
  setInterval(callback: () => void, delay: number, source = 'unknown'): number {
    const id = window.setInterval(callback, delay);
    
    this.timers.set(id, {
      id,
      type: 'interval',
      createdAt: Date.now(),
      source,
    });
    
    return id;
  }
  
  /**
   * Pulisce un timer specifico
   */
  clear(id: number): void {
    const timer = this.timers.get(id);
    if (!timer) return;
    
    if (timer.type === 'timeout') {
      clearTimeout(id);
    } else {
      clearInterval(id);
    }
    
    this.timers.delete(id);
  }
  
  /**
   * Pulisce tutti i timer di una sorgente specifica
   */
  clearBySource(source: string): void {
    this.timers.forEach((timer, id) => {
      if (timer.source === source) {
        this.clear(id);
      }
    });
  }
  
  /**
   * Pulisce tutti i timer registrati
   */
  clearAll(): void {
    this.timers.forEach((timer, id) => {
      if (timer.type === 'timeout') {
        clearTimeout(id);
      } else {
        clearInterval(id);
      }
    });
    this.timers.clear();
  }
  
  /**
   * Ritorna statistiche sui timer attivi
   */
  getStats(): { total: number; timeouts: number; intervals: number; bySouce: Record<string, number> } {
    let timeouts = 0;
    let intervals = 0;
    const bySource: Record<string, number> = {};
    
    this.timers.forEach((timer) => {
      if (timer.type === 'timeout') timeouts++;
      else intervals++;
      
      bySource[timer.source] = (bySource[timer.source] || 0) + 1;
    });
    
    return {
      total: this.timers.size,
      timeouts,
      intervals,
      bySouce: bySource,
    };
  }
}

// Export singleton
export const timers = TimerManager.getInstance();

/**
 * Hook helper per React components
 * Usa questo invece di setTimeout/setInterval diretto
 */
export function useSafeTimer(componentName: string) {
  return {
    setTimeout: (cb: () => void, delay: number) => timers.setTimeout(cb, delay, componentName),
    setInterval: (cb: () => void, delay: number) => timers.setInterval(cb, delay, componentName),
    clear: (id: number) => timers.clear(id),
    clearAll: () => timers.clearBySource(componentName),
  };
}

