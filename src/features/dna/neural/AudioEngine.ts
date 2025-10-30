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

  // Select node sound with reverb
  playSelect() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    
    // Create reverb convolver
    const convolver = ctx.createConvolver();
    const impulseLength = ctx.sampleRate * 0.6;
    const impulse = ctx.createBuffer(2, impulseLength, ctx.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < impulseLength; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / impulseLength * 3);
      }
    }
    convolver.buffer = impulse;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const reverbGain = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
    
    gainNode.gain.value = 0.2 * this.masterVolume;
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    reverbGain.gain.value = 0.3;
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    gainNode.connect(convolver);
    convolver.connect(reverbGain);
    reverbGain.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.08);
  }

  // Dragging sound (FM sweep with sub rumble)
  playDrag() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    
    // FM synthesis
    const carrier = ctx.createOscillator();
    const modulator = ctx.createOscillator();
    const modulatorGain = ctx.createGain();
    const carrierGain = ctx.createGain();
    
    // Sub bass rumble
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(500, ctx.currentTime);
    carrier.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.2);
    
    modulator.type = 'sine';
    modulator.frequency.value = 80;
    modulatorGain.gain.value = 200;
    
    sub.type = 'sine';
    sub.frequency.value = 55;
    subGain.gain.value = 0.08 * this.masterVolume;
    
    carrierGain.gain.value = 0.12 * this.masterVolume;
    carrierGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    
    modulator.connect(modulatorGain);
    modulatorGain.connect(carrier.frequency);
    carrier.connect(carrierGain);
    carrierGain.connect(ctx.destination);
    
    sub.connect(subGain);
    subGain.connect(ctx.destination);
    
    carrier.start(ctx.currentTime);
    modulator.start(ctx.currentTime);
    sub.start(ctx.currentTime);
    carrier.stop(ctx.currentTime + 0.2);
    modulator.stop(ctx.currentTime + 0.2);
    sub.stop(ctx.currentTime + 0.2);
  }

  // Valid connection sound with delay tail
  playConnect() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    
    // Cmaj7add9 chord with sparkle
    const frequencies = [261.63, 329.63, 392, 493.88, 587.33];
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = ctx.createDelay();
      const delayGain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.value = (0.25 / frequencies.length) * this.masterVolume;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      delay.delayTime.value = 0.15;
      delayGain.gain.value = 0.4;
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + i * 0.02);
      osc.stop(ctx.currentTime + 0.5);
    });
    
    // Sparkle swoosh
    setTimeout(() => {
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 4);
      }
      
      const source = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();
      
      source.buffer = buffer;
      filter.type = 'highpass';
      filter.frequency.value = 3000;
      gainNode.gain.value = 0.1 * this.masterVolume;
      
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      source.start(ctx.currentTime);
    }, 50);
  }

  // Error sound (band-stop noise + reverse hit)
  playError() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    
    // Reverse hit effect
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const envelope = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * envelope;
    }
    
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();
    
    source.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.value = 500;
    filter.Q.value = 8;
    gainNode.gain.value = 0.25 * this.masterVolume;
    
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    source.start(ctx.currentTime);
  }

  // Cinematic victory sequence (2s rise + pulse drop + reverb tail)
  playVictory() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    
    // Rising arpeggio with reverb
    const notes = [261.63, 329.63, 392, 493.88, 587.33, 783.99]; // C-E-G-B-D-G
    
    // Create reverb
    const convolver = ctx.createConvolver();
    const impulseLength = ctx.sampleRate * 2;
    const impulse = ctx.createBuffer(2, impulseLength, ctx.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < impulseLength; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / impulseLength * 2);
      }
    }
    convolver.buffer = impulse;
    
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const reverbGain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        gain.gain.value = (0.2 / notes.length) * this.masterVolume;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        reverbGain.gain.value = 0.5;
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.connect(convolver);
        convolver.connect(reverbGain);
        reverbGain.connect(ctx.destination);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
      }, i * 150);
    });
    
    // Pulse drop (sidechain effect)
    setTimeout(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'sawtooth';
      osc.frequency.value = 130.81; // C3
      
      filter.type = 'lowpass';
      filter.frequency.value = 200;
      
      gain.gain.value = 0.3 * this.masterVolume;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.2);
    }, 1000);
  }
}

export const audioEngine = new NeuralAudioEngine();

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
