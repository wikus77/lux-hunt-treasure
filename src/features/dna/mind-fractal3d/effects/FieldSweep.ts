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

      // Easing: expo in-out
      const eased = progress < 0.5
        ? Math.pow(2, 20 * progress - 10) / 2
        : (2 - Math.pow(2, -20 * progress + 10)) / 2;

      // Intensity curve: 1.0 → 1.2 → 1.0
      if (progress < 0.5) {
        this.currentIntensity = 1.0 + eased * 0.2 * 2;
      } else {
        this.currentIntensity = 1.2 - (eased - 0.5) * 0.2 * 2;
      }

      // Twist delta: 0 → ±0.02 → 0 (randomize direction)
      const twistDir = Math.random() > 0.5 ? 1 : -1;
      if (progress < 0.5) {
        this.currentTwist = twistDir * eased * 0.02 * 2;
      } else {
        this.currentTwist = twistDir * (0.02 - (eased - 0.5) * 0.02 * 2);
      }

      if (progress >= 1.0) {
        this.sweeping = false;
        this.currentIntensity = 1.0;
        this.currentTwist = 0.0;
      }
    }
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
