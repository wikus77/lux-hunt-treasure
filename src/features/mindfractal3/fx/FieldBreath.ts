// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

/**
 * Field Breath - organic sinusoidal breathing with boost on link
 */
export class FieldBreath {
  private lastBreath = 0;
  private breathDuration = 2000; // 2s
  private breathInterval = 10000 + Math.random() * 5000; // 10-15s
  private currentIntensity = 1.0;
  private currentTwist = 0.0;
  private breathing = false;
  private breathStart = 0;
  private amplitudeBoost = 0;
  private boostEndTime = 0;

  getScale(): number {
    return this.currentIntensity + this.amplitudeBoost;
  }

  getTwistDelta(): number {
    return this.currentTwist;
  }

  boostAmplitude(amount: number, duration: number): void {
    this.amplitudeBoost = amount;
    this.boostEndTime = performance.now() + duration;
  }

  update(): void {
    const now = performance.now();

    // Decay amplitude boost
    if (this.amplitudeBoost > 0 && now > this.boostEndTime) {
      this.amplitudeBoost = Math.max(0, this.amplitudeBoost - 0.001);
    }

    if (!this.breathing) {
      if (now - this.lastBreath > this.breathInterval) {
        this.breathing = true;
        this.breathStart = now;
        this.lastBreath = now;
        this.breathInterval = 10000 + Math.random() * 5000;
      }
    } else {
      const elapsed = now - this.breathStart;
      const progress = Math.min(1.0, elapsed / this.breathDuration);

      // Smooth sine easing (organic breathing)
      const eased = Math.sin(progress * Math.PI);

      // Intensity curve: 0.85 → 1.15 → 0.85 (30% range)
      this.currentIntensity = 0.85 + eased * 0.3;

      // Twist delta: 0 → ±0.015 → 0
      const twistDir = Math.random() > 0.5 ? 1 : -1;
      this.currentTwist = twistDir * eased * 0.015;

      if (progress >= 1.0) {
        this.breathing = false;
        this.currentIntensity = 1.0;
        this.currentTwist = 0.0;
      }
    }
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
