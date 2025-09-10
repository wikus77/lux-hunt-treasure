// © 2025 Joseph MULÉ – M1SSION™ – Toast Debug Utility
const isDev = import.meta.env.DEV;

interface ToastState {
  id: string;
  state: 'entering' | 'visible' | 'exiting' | 'removed';
  timestamp: number;
  transform?: string;
  opacity?: string;
  animationName?: string;
  animationPlayState?: string;
}

interface GestureState {
  startY: number;
  currentY: number;
  isDragging: boolean;
}

class ToastDebugManager {
  private toasts: Map<string, ToastState> = new Map();
  private gestures: Map<string, GestureState> = new Map();

  trackToast(id: string, state: ToastState['state']) {
    if (!isDev) return;
    
    this.toasts.set(id, {
      id,
      state,
      timestamp: Date.now()
    });
    
    console.log(`🍞 [ToastDebug] ${id}: ${state}`);
  }

  trackGesture(id: string, gesture: GestureState) {
    if (!isDev) return;
    
    this.gestures.set(id, gesture);
    
    if (gesture.isDragging) {
      console.log(`👆 [ToastDebug] ${id}: swipe deltaY=${gesture.currentY - gesture.startY}px`);
    }
  }

  getToastComputedStyle(id: string) {
    if (!isDev) return null;
    
    const element = document.querySelector(`[data-sonner-toast][id="${id}"]`) || 
                   document.querySelector('[data-sonner-toast]');
    
    if (!element) return null;
    
    const computed = getComputedStyle(element as HTMLElement);
    
    return {
      transform: computed.transform,
      opacity: computed.opacity,
      animationName: computed.animationName,
      animationPlayState: computed.animationPlayState,
      animationDuration: computed.animationDuration,
      willChange: computed.willChange
    };
  }

  list() {
    if (!isDev) return;
    
    console.log('🍞 [ToastDebug] Current toasts:', Array.from(this.toasts.values()));
    console.log('👆 [ToastDebug] Current gestures:', Array.from(this.gestures.values()));
  }

  show(message: string = 'Debug toast') {
    if (!isDev) return;
    
    // Dynamically import to avoid build issues
    import('sonner').then(({ toast }) => {
      toast.info(message);
      console.log(`🍞 [ToastDebug] Forced toast: ${message}`);
    });
  }

  state() {
    if (!isDev) return;
    
    const allToasts = document.querySelectorAll('[data-sonner-toast]');
    const results: any[] = [];
    
    allToasts.forEach((toast, index) => {
      const computed = getComputedStyle(toast as HTMLElement);
      results.push({
        index,
        id: (toast as HTMLElement).id || `toast-${index}`,
        transform: computed.transform,
        animationName: computed.animationName,
        animationPlayState: computed.animationPlayState,
        opacity: computed.opacity,
        removed: toast.getAttribute('data-removed')
      });
    });
    
    console.log('🍞 [ToastDebug] Live state:', results);
    return results;
  }

  clear() {
    if (!isDev) return;
    
    this.toasts.clear();
    this.gestures.clear();
    console.log('🍞 [ToastDebug] Cleared all debug data');
  }
}

export const toastDebug = new ToastDebugManager();

// Global debug interface
if (isDev && typeof window !== 'undefined') {
  (window as any).__M1_TOAST_DEBUG__ = {
    list: () => toastDebug.list(),
    show: (message?: string) => toastDebug.show(message),
    state: () => toastDebug.state(),
    clear: () => toastDebug.clear(),
    getStyle: (id: string) => toastDebug.getToastComputedStyle(id)
  };
}