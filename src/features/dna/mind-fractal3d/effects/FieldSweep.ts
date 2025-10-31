// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

/**
 * Field Sweep - periodic EM wave that modulates tunnel scale/glow
 * Every 10-15s, apply pulse: 0.8 → 1.2 → 1.0 with expo easing
 */
export class FieldSweep {
  private lastSweep = 0;
  private sweepDuration = 2000; // 2s pulse
  private sweepInterval = 10000 + Math.random() * 5000; // 10-15s
  private currentIntensity = 1.0;
  private currentTwist = 0.0; // -0.02 to +0.02 delta twist
  private sweeping = false;
  private sweepStart = 0;

  getIntensity(): number {
    return this.currentIntensity;
  }

  getTwistDelta(): number {
    return this.currentTwist;
  }

  update(): void {
    const now = performance.now();

    if (!this.sweeping) {
      // Check if it's time for next sweep
      if (now - this.lastSweep > this.sweepInterval) {
        this.sweeping = true;
        this.sweepStart = now;
        this.lastSweep = now;
        this.sweepInterval = 10000 + Math.random() * 5000; // Randomize next
      }
    } else {
      // Perform sweep animation
      const elapsed = now - this.sweepStart;
      const progress = Math.min(1.0, elapsed / this.sweepDuration);

      // Easing: smooth sine (organic lung breathing)
      const eased = Math.sin(progress * Math.PI); // 0 → 1 → 0 smoothly

      // Intensity curve: 0.85 → 1.15 → 0.85 (30% range for perceptible breathing)
      this.currentIntensity = 0.85 + eased * 0.3;

      // Twist delta: 0 → ±0.015 → 0 (subtle micro-torsion)
      const twistDir = Math.random() > 0.5 ? 1 : -1;
      this.currentTwist = twistDir * eased * 0.015;

      if (progress >= 1.0) {
        this.sweeping = false;
        this.currentIntensity = 1.0;
        this.currentTwist = 0.0;
      }
    }
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
