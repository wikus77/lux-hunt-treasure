/**
 * © 2025 Joseph MULÉ – M1SSION™ – Audio Engine
 */

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private muted: boolean = false;
  private initialized: boolean = false;

  async init() {
    // Gracefully handle audio initialization failures
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.3;

      // Start ambient drone
      this.startAmbientDrone();
      this.initialized = true;
    } catch (error) {
      console.warn('Audio initialization failed (graceful fallback):', error);
      this.initialized = false;
    }
  }

  private startAmbientDrone() {
    if (!this.ctx || !this.masterGain) return;

    this.ambientOsc = this.ctx.createOscillator();
    this.ambientOsc.type = 'sine';
    this.ambientOsc.frequency.value = 80;

    const ambientGain = this.ctx.createGain();
    ambientGain.gain.value = 0.1;

    this.ambientOsc.connect(ambientGain);
    ambientGain.connect(this.masterGain);
    this.ambientOsc.start();
  }

  playPulse() {
    if (!this.ctx || !this.masterGain || this.muted || !this.initialized) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  playConnection() {
    if (!this.ctx || !this.masterGain || this.muted || !this.initialized) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  playVictory() {
    if (!this.ctx || !this.masterGain || this.muted || !this.initialized) return;

    const now = this.ctx.currentTime;
    const frequencies = [523.25, 659.25, 783.99]; // C-E-G major chord

    frequencies.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 2.0);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + i * 0.1);
      osc.stop(now + 2.0);
    });
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.3;
    }
  }

  destroy() {
    this.ambientOsc?.stop();
    this.ctx?.close();
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
