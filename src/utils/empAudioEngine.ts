/**
 * The Pulse™ — EMP Audio Engine
 * Web Audio API-based synchronized audio for ritual phases
 * Sub-bass rumble + interference noise + ring-mod chirp
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

type EmpPhase = 'precharge' | 'blackout' | 'interference' | 'reveal' | 'closed';

interface AudioNodeGraph {
  context: AudioContext;
  masterGain: GainNode;
  
  // Sub-bass channel
  osc1: OscillatorNode;
  osc1Gain: GainNode;
  osc1Filter: BiquadFilterNode;
  
  // Noise channel
  noiseBuffer: AudioBuffer;
  noiseSource: AudioBufferSourceNode | null;
  noiseGain: GainNode;
  noiseBP: BiquadFilterNode;
  
  // Ring-mod channel (optional chirp)
  osc2?: OscillatorNode;
  osc2Gain?: GainNode;
  
  // Master limiter
  compressor: DynamicsCompressorNode;
}

export class EmpAudioEngine {
  private graph: AudioNodeGraph | null = null;
  private isUnlocked = false;
  private currentPhase: EmpPhase = 'closed';
  private phaseStartTime = 0;
  private reducedMotion = false;

  constructor() {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Initialize audio context and unlock on iOS
   */
  async initialize(): Promise<boolean> {
    if (this.graph) return true;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('[EMP Audio] Web Audio API not supported');
        return false;
      }

      const ctx = new AudioContextClass();
      
      // iOS requires user gesture to unlock AudioContext
      if (ctx.state === 'suspended') {
        console.log('[EMP Audio] AudioContext suspended, waiting for user gesture...');
        
        // Try to resume immediately (might work on non-iOS)
        await ctx.resume();
        
        if (ctx.state === 'suspended') {
          // Still suspended, need user gesture
          return new Promise((resolve) => {
            const unlock = async () => {
              await ctx.resume();
              if (ctx.state === 'running') {
                document.removeEventListener('touchstart', unlock);
                document.removeEventListener('click', unlock);
                this.isUnlocked = true;
                await this.buildGraph(ctx);
                resolve(true);
              }
            };
            
            document.addEventListener('touchstart', unlock, { once: true });
            document.addEventListener('click', unlock, { once: true });
          });
        }
      }

      await this.buildGraph(ctx);
      this.isUnlocked = true;
      return true;
    } catch (err) {
      console.error('[EMP Audio] Initialization error:', err);
      return false;
    }
  }

  /**
   * Build the audio node graph
   */
  private async buildGraph(ctx: AudioContext): Promise<void> {
    // Master chain
    const masterGain = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    
    masterGain.gain.value = this.reducedMotion ? 0.3 : 0.6;
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    
    masterGain.connect(compressor);
    compressor.connect(ctx.destination);

    // Sub-bass oscillator (30-45 Hz rumble)
    const osc1 = ctx.createOscillator();
    const osc1Gain = ctx.createGain();
    const osc1Filter = ctx.createBiquadFilter();
    
    osc1.type = 'sine';
    osc1.frequency.value = 37;
    osc1Gain.gain.value = 0; // Start silent
    osc1Filter.type = 'lowpass';
    osc1Filter.frequency.value = 120;
    osc1Filter.Q.value = 1.5;
    
    osc1.connect(osc1Gain);
    osc1Gain.connect(osc1Filter);
    osc1Filter.connect(masterGain);
    osc1.start();

    // Noise generator (white noise)
    const noiseBuffer = this.createNoiseBuffer(ctx, 2);
    const noiseGain = ctx.createGain();
    const noiseBP = ctx.createBiquadFilter();
    
    noiseGain.gain.value = 0; // Start silent
    noiseBP.type = 'bandpass';
    noiseBP.frequency.value = 4000;
    noiseBP.Q.value = 2;
    
    noiseGain.connect(noiseBP);
    noiseBP.connect(masterGain);

    this.graph = {
      context: ctx,
      masterGain,
      osc1,
      osc1Gain,
      osc1Filter,
      noiseBuffer,
      noiseSource: null,
      noiseGain,
      noiseBP,
      compressor
    };

    console.log('[EMP Audio] Audio graph built');
  }

  /**
   * Create white noise buffer
   */
  private createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  }

  /**
   * Apply audio for specific phase
   */
  applyPhase(phase: EmpPhase, syncTime?: number): void {
    if (!this.graph || !this.isUnlocked) {
      console.warn('[EMP Audio] Not initialized or unlocked');
      return;
    }

    this.currentPhase = phase;
    this.phaseStartTime = syncTime || performance.now();

    const { context: ctx, osc1Gain, osc1Filter, noiseGain, noiseBP, noiseBuffer } = this.graph;
    const now = ctx.currentTime;

    console.log(`[EMP Audio] Applying phase: ${phase}`);

    switch (phase) {
      case 'precharge':
        // Ramp up sub-bass from -36dB to -12dB over 1.2s
        osc1Gain.gain.cancelScheduledValues(now);
        osc1Gain.gain.setValueAtTime(0.0158, now); // -36dB
        osc1Gain.gain.exponentialRampToValueAtTime(0.251, now + 1.2); // -12dB
        
        // Increase filter resonance
        osc1Filter.Q.cancelScheduledValues(now);
        osc1Filter.Q.setValueAtTime(1.5, now);
        osc1Filter.Q.linearRampToValueAtTime(3, now + 1.2);
        break;

      case 'blackout':
        // Hard mute everything immediately
        osc1Gain.gain.cancelScheduledValues(now);
        osc1Gain.gain.setValueAtTime(0, now);
        
        noiseGain.gain.cancelScheduledValues(now);
        noiseGain.gain.setValueAtTime(0, now);
        
        // Stop noise source if running
        if (this.graph.noiseSource) {
          this.graph.noiseSource.stop();
          this.graph.noiseSource = null;
        }
        break;

      case 'interference':
        // Start noise source
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        noiseSource.connect(noiseGain);
        noiseSource.start();
        this.graph.noiseSource = noiseSource;
        
        // Ramp up noise + apply tremolo via LFO
        noiseGain.gain.cancelScheduledValues(now);
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.4, now + 0.3);
        
        // Apply random dropouts (micro-glitches)
        for (let i = 0; i < 8; i++) {
          const dropTime = now + 0.3 + Math.random() * 2.5;
          const dropDuration = 0.01 + Math.random() * 0.03;
          
          noiseGain.gain.setValueAtTime(0.4, dropTime);
          noiseGain.gain.linearRampToValueAtTime(0, dropTime + 0.001);
          noiseGain.gain.setValueAtTime(0, dropTime + dropDuration);
          noiseGain.gain.linearRampToValueAtTime(0.4, dropTime + dropDuration + 0.001);
        }
        
        // Modulate BP filter frequency
        noiseBP.frequency.cancelScheduledValues(now);
        noiseBP.frequency.setValueAtTime(2000, now);
        noiseBP.frequency.linearRampToValueAtTime(6000, now + 1.5);
        noiseBP.frequency.linearRampToValueAtTime(3000, now + 3);
        break;

      case 'reveal':
        // Stop noise
        if (this.graph.noiseSource) {
          this.graph.noiseSource.stop();
          this.graph.noiseSource = null;
        }
        
        noiseGain.gain.cancelScheduledValues(now);
        noiseGain.gain.setValueAtTime(0, now);
        
        // Whoosh: sweep filter from 300Hz to 6kHz
        osc1Filter.frequency.cancelScheduledValues(now);
        osc1Filter.frequency.setValueAtTime(300, now);
        osc1Filter.frequency.exponentialRampToValueAtTime(6000, now + 0.8);
        
        // Attenuate rumble -12dB to -24dB
        osc1Gain.gain.cancelScheduledValues(now);
        osc1Gain.gain.setValueAtTime(0.251, now); // -12dB
        osc1Gain.gain.exponentialRampToValueAtTime(0.063, now + 0.8); // -24dB
        break;

      case 'closed':
        // Fade out everything
        osc1Gain.gain.cancelScheduledValues(now);
        osc1Gain.gain.setValueAtTime(osc1Gain.gain.value, now);
        osc1Gain.gain.linearRampToValueAtTime(0, now + 0.25);
        
        noiseGain.gain.cancelScheduledValues(now);
        noiseGain.gain.setValueAtTime(noiseGain.gain.value, now);
        noiseGain.gain.linearRampToValueAtTime(0, now + 0.25);
        
        // Stop noise after fade
        setTimeout(() => {
          if (this.graph?.noiseSource) {
            this.graph.noiseSource.stop();
            this.graph.noiseSource = null;
          }
        }, 300);
        break;
    }
  }

  /**
   * Stop and cleanup
   */
  stop(): void {
    if (!this.graph) return;

    const { context: ctx, osc1, noiseSource } = this.graph;
    
    try {
      osc1.stop();
      if (noiseSource) noiseSource.stop();
      
      ctx.close();
    } catch (err) {
      console.warn('[EMP Audio] Cleanup error:', err);
    }

    this.graph = null;
    this.isUnlocked = false;
    this.currentPhase = 'closed';
    
    console.log('[EMP Audio] Stopped and cleaned up');
  }

  /**
   * Check if audio is ready
   */
  isReady(): boolean {
    return this.graph !== null && this.isUnlocked;
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
