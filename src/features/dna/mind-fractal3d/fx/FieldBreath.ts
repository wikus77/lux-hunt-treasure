// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

/**
 * Field Breath - continuous sinusoidal breathing effect
 * Range: 0.85 → 1.15 with smooth sine wave
 * Boostable after link for +10% amplitude for 2s
 */
export class FieldBreath {
  private periodMs: number;
  private amplitude: number;
  private boostUntil = 0;
  private boostAmplitude = 0;

  constructor(opts?: { periodMs?: number; amp?: number }) {
    this.periodMs = opts?.periodMs ?? 12000; // 12s period
    this.amplitude = opts?.amp ?? 0.30; // 0.85-1.15 range
  }

  /**
   * Get current intensity (0.85-1.15 baseline)
   */
  tick(nowMs: number): number {
    const t = (nowMs % this.periodMs) / this.periodMs; // 0→1
    const sine = Math.sin(Math.PI * 2 * t); // -1→1→-1
    const normalized = (sine + 1) / 2; // 0→1→0
    
    const baseIntensity = 1.0 - this.amplitude / 2 + normalized * this.amplitude; // 0.85→1.15
    
    // Apply boost if active
    const boost = nowMs < this.boostUntil ? this.boostAmplitude : 0;
    
    return baseIntensity + boost;
  }

  /**
   * Boost breathing intensity after link
   */
  boost(seconds = 2, ampAdd = 0.10): void {
    this.boostUntil = performance.now() + seconds * 1000;
    this.boostAmplitude = ampAdd;
  }

  /**
   * Get twist delta for spiral effect (oscillates -0.05 to +0.05)
   */
  getTwistDelta(nowMs: number): number {
    const t = (nowMs % (this.periodMs * 2)) / (this.periodMs * 2);
    return Math.sin(Math.PI * 2 * t) * 0.05;
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
