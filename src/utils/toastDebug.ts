// © 2025 M1SSION™ – Toast Debug Utility (dev only)

interface ToastDebugState {
  id: string;
  state: 'entering' | 'visible' | 'exiting' | 'removed';
  startTime: number;
  timer?: number;
  gesture?: {
    startY: number;
    currentY: number;
    isDragging: boolean;
  };
}

class ToastDebugManager {
  private toasts = new Map<string, ToastDebugState>();
  private isEnabled = import.meta.env.VITE_UI_DEBUG === '1' || import.meta.env.DEV;

  constructor() {
    if (this.isEnabled && typeof window !== 'undefined') {
      (window as any).__M1_TOAST_DEBUG__ = {
        get: () => this.getState(),
        list: () => this.list(),
        show: (message: string) => this.testShow(message),
        dismiss: (id: string) => this.testDismiss(id)
      };
      console.log('🧪 Toast Debug enabled: window.__M1_TOAST_DEBUG__');
    }
  }

  public trackToast(id: string, state: ToastDebugState['state']) {
    if (!this.isEnabled) return;
    
    const existing = this.toasts.get(id);
    const now = Date.now();
    
    if (state === 'entering' && !existing) {
      this.toasts.set(id, {
        id,
        state,
        startTime: now
      });
      console.log(`🍞 Toast ${id}: entering`);
    } else if (existing) {
      existing.state = state;
      console.log(`🍞 Toast ${id}: ${state} (age: ${now - existing.startTime}ms)`);
      
      if (state === 'removed') {
        this.toasts.delete(id);
      }
    }
  }

  public trackGesture(id: string, gesture: ToastDebugState['gesture']) {
    if (!this.isEnabled) return;
    
    const toast = this.toasts.get(id);
    if (toast) {
      toast.gesture = gesture;
      console.log(`🍞 Toast ${id}: gesture`, gesture);
    }
  }

  public trackTimer(id: string, timer: number) {
    if (!this.isEnabled) return;
    
    const toast = this.toasts.get(id);
    if (toast) {
      toast.timer = timer;
      console.log(`🍞 Toast ${id}: timer set (${timer}ms remaining)`);
    }
  }

  private getState() {
    return {
      toasts: Array.from(this.toasts.values()),
      timestamp: Date.now(),
      enabled: this.isEnabled
    };
  }

  private list() {
    console.table(Array.from(this.toasts.values()));
    return this.toasts.size;
  }

  private testShow(message: string) {
    if (typeof window !== 'undefined' && (window as any).toast) {
      (window as any).toast(message || 'Test toast message');
      return 'Toast triggered';
    }
    return 'Toast function not found';
  }

  private testDismiss(id: string) {
    const toast = this.toasts.get(id);
    if (toast) {
      this.trackToast(id, 'exiting');
      return `Dismissing toast ${id}`;
    }
    return `Toast ${id} not found`;
  }
}

// Initialize debug manager
export const toastDebug = new ToastDebugManager();

// Export types for use in components
export type { ToastDebugState };