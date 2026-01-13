/**
 * M1SSION™ WebGL Context Manager
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * PROBLEMA RISOLTO:
 * - Safari iOS ha un limite di ~8 WebGL context attivi
 * - Superato il limite, nuovi canvas falliscono silenziosamente
 * - Three.js scenes non pulite causano memory leak
 * 
 * SOLUZIONE:
 * - Tracking centralizzato dei WebGL context
 * - Limiti configurabili per device
 * - Cleanup automatico dei context inattivi
 */

interface TrackedContext {
  id: string;
  canvas: HTMLCanvasElement;
  context: WebGLRenderingContext | WebGL2RenderingContext;
  createdAt: number;
  lastUsed: number;
  isActive: boolean;
}

class WebGLManagerSingleton {
  private static instance: WebGLManagerSingleton;
  private contexts: Map<string, TrackedContext> = new Map();
  private maxContexts: number;
  
  private constructor() {
    // Detect device limits (Safari iOS is stricter)
    this.maxContexts = this.detectMaxContexts();
    
    // Periodically check for lost contexts
    setInterval(() => this.cleanupLostContexts(), 30000);
  }
  
  static getInstance(): WebGLManagerSingleton {
    if (!WebGLManagerSingleton.instance) {
      WebGLManagerSingleton.instance = new WebGLManagerSingleton();
    }
    return WebGLManagerSingleton.instance;
  }
  
  /**
   * Detect device WebGL limits
   */
  private detectMaxContexts(): number {
    // Safari iOS has ~8 context limit, Chrome/FF ~16
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/chrome/.test(ua);
    
    if (isIOS || isSafari) {
      return 6; // Conservative limit for Safari
    }
    
    // Check for low memory devices
    if ('deviceMemory' in navigator && (navigator as any).deviceMemory < 4) {
      return 6;
    }
    
    return 12; // Default for modern browsers
  }
  
  /**
   * Register a WebGL context for tracking
   */
  register(
    id: string,
    canvas: HTMLCanvasElement,
    context: WebGLRenderingContext | WebGL2RenderingContext
  ): boolean {
    // Check if we're at limit
    if (this.contexts.size >= this.maxContexts) {
      // Try to release oldest inactive context
      const released = this.releaseOldest();
      if (!released) {
        console.warn(`[WebGLManager] Context limit reached (${this.maxContexts}). Cannot register ${id}`);
        return false;
      }
    }
    
    this.contexts.set(id, {
      id,
      canvas,
      context,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      isActive: true,
    });
    
    // Listen for context lost
    canvas.addEventListener('webglcontextlost', (e) => {
      console.warn(`[WebGLManager] Context lost: ${id}`);
      const tracked = this.contexts.get(id);
      if (tracked) {
        tracked.isActive = false;
      }
    });
    
    return true;
  }
  
  /**
   * Mark context as actively in use
   */
  markActive(id: string): void {
    const ctx = this.contexts.get(id);
    if (ctx) {
      ctx.lastUsed = Date.now();
      ctx.isActive = true;
    }
  }
  
  /**
   * Mark context as inactive (e.g., component hidden)
   */
  markInactive(id: string): void {
    const ctx = this.contexts.get(id);
    if (ctx) {
      ctx.isActive = false;
    }
  }
  
  /**
   * Unregister and release a context
   */
  unregister(id: string): void {
    const ctx = this.contexts.get(id);
    if (ctx) {
      try {
        // Try to lose context to free resources
        const ext = ctx.context.getExtension('WEBGL_lose_context');
        if (ext) {
          ext.loseContext();
        }
      } catch (e) {
        // Ignore
      }
      this.contexts.delete(id);
    }
  }
  
  /**
   * Release oldest inactive context
   */
  private releaseOldest(): boolean {
    let oldest: TrackedContext | null = null;
    let oldestTime = Date.now();
    
    this.contexts.forEach((ctx) => {
      if (!ctx.isActive && ctx.lastUsed < oldestTime) {
        oldest = ctx;
        oldestTime = ctx.lastUsed;
      }
    });
    
    if (oldest) {
      this.unregister(oldest.id);
      return true;
    }
    
    return false;
  }
  
  /**
   * Cleanup contexts that have been lost
   */
  private cleanupLostContexts(): void {
    const toRemove: string[] = [];
    
    this.contexts.forEach((ctx, id) => {
      if (ctx.context.isContextLost()) {
        toRemove.push(id);
      }
    });
    
    toRemove.forEach(id => {
      this.contexts.delete(id);
    });
  }
  
  /**
   * Check if we can create a new context
   */
  canCreateContext(): boolean {
    // Clean up inactive first
    this.cleanupLostContexts();
    
    const activeCount = Array.from(this.contexts.values())
      .filter(ctx => ctx.isActive && !ctx.context.isContextLost())
      .length;
    
    return activeCount < this.maxContexts;
  }
  
  /**
   * Get stats for debugging
   */
  getStats(): { 
    total: number; 
    active: number; 
    limit: number; 
    byId: string[] 
  } {
    const active = Array.from(this.contexts.values())
      .filter(ctx => ctx.isActive && !ctx.context.isContextLost())
      .length;
    
    return {
      total: this.contexts.size,
      active,
      limit: this.maxContexts,
      byId: Array.from(this.contexts.keys()),
    };
  }
}

// Export singleton
export const WebGLManager = WebGLManagerSingleton.getInstance();

