// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

/**
 * FPS Monitor with moving average for quality scaling
 */
export class FPSMonitor {
  private samples: number[] = [];
  private lastTime = performance.now();
  private sampleSize = 60; // 60 frames for average
  
  public tick(): number {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    
    const fps = 1000 / delta;
    this.samples.push(fps);
    
    if (this.samples.length > this.sampleSize) {
      this.samples.shift();
    }
    
    return fps;
  }
  
  public getAverage(): number {
    if (this.samples.length === 0) return 60;
    return this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
  }
  
  public reset(): void {
    this.samples = [];
    this.lastTime = performance.now();
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
