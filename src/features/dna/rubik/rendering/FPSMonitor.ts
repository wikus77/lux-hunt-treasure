/**
 * FPS Performance Monitor
 * Tracks frame rate and triggers quality degradation if needed
 */

export interface FPSConfig {
  targetFPS: number;
  sampleDuration: number; // seconds
  onDegrade: () => void;
}

export class FPSMonitor {
  private frames: number[] = [];
  private lastTime = performance.now();
  private config: FPSConfig;
  private degraded = false;

  constructor(config: FPSConfig) {
    this.config = config;
  }

  /**
   * Update FPS counter (call every frame)
   */
  tick() {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    const fps = 1000 / delta;
    this.frames.push(fps);

    // Keep only recent samples
    const maxSamples = Math.floor(this.config.sampleDuration * 60);
    if (this.frames.length > maxSamples) {
      this.frames.shift();
    }

    // Check for degradation
    if (!this.degraded && this.frames.length >= maxSamples) {
      const avgFPS = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
      
      if (avgFPS < this.config.targetFPS) {
        console.warn(`[FPS Monitor] Average FPS (${avgFPS.toFixed(1)}) below target (${this.config.targetFPS}), degrading quality`);
        this.degraded = true;
        this.config.onDegrade();
      }
    }
  }

  /**
   * Get current average FPS
   */
  getAverageFPS(): number {
    if (this.frames.length === 0) return 60;
    return this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
  }

  /**
   * Reset monitor
   */
  reset() {
    this.frames = [];
    this.degraded = false;
    this.lastTime = performance.now();
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
