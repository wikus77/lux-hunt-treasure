/**
 * © 2025 Joseph MULÉ – M1SSION™ – Neural Audio Engine
 */

class NeuralAudioEngine {
  private audioContext: AudioContext | null = null;
  private masterVolume: number = 0.6;
  private isMuted: boolean = false;

  constructor() {
    this.loadMuteState();
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  private loadMuteState() {
    try {
      const saved = localStorage.getItem('neural_mute');
      this.isMuted = saved === 'true';
    } catch (e) {
      this.isMuted = false;
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('neural_mute', String(muted));
    } catch (e) {
      // Ignore
    }
  }

  isMutedState(): boolean {
    return this.isMuted;
  }

  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (this.isMuted) return;

    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    gainNode.gain.value = volume * this.masterVolume;
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  private playChord(frequencies: number[], duration: number, volume: number = 0.2) {
    frequencies.forEach(freq => this.playTone(freq, duration, 'sine', volume / frequencies.length));
  }

  // Select node sound
  playSelect() {
    this.playTone(1046.5, 0.08, 'sine', 0.25); // C6
  }

  // Dragging sound (riser)
  playDrag() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
    
    gainNode.gain.value = 0.15 * this.masterVolume;
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  }

  // Valid connection sound
  playConnect() {
    // C major add9 chord
    this.playChord([261.63, 329.63, 392, 587.33], 0.4, 0.3);
    
    // Swoosh (filtered noise)
    if (this.isMuted) return;
    const ctx = this.getContext();
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 5);
    }
    
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();
    
    source.buffer = buffer;
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    gainNode.gain.value = 0.15 * this.masterVolume;
    
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    source.start(ctx.currentTime);
  }

  // Error sound
  playError() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    
    // Short burst of filtered noise
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();
    
    source.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    gainNode.gain.value = 0.2 * this.masterVolume;
    
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    source.start(ctx.currentTime);
  }

  // Victory arpeggio
  playVictory() {
    const notes = [261.63, 329.63, 392, 493.88, 523.25]; // C-E-G-B-C
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.3, 'sine', 0.25);
      }, i * 120);
    });
  }
}

export const audioEngine = new NeuralAudioEngine();

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
