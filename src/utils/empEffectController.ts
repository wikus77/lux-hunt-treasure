/**
 * The Pulse™ — EMP Effect Controller
 * Orchestrates visual + audio + haptic effects synchronized to ritual phases
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { EmpAudioEngine } from './empAudioEngine';
import { EmpVisualEngine } from './empVisualEngine';

export type EmpPhase = 'precharge' | 'blackout' | 'interference' | 'reveal' | 'closed';

interface EmpEffectOptions {
  enableAudio?: boolean;
  enableVisual?: boolean;
  enableHaptic?: boolean;
}

export class EmpEffectController {
  private audioEngine: EmpAudioEngine;
  private visualEngine: EmpVisualEngine;
  private isRunning = false;
  private lastPhaseTime = 0;
  private debounceMs = 250;
  private reducedMotion = false;
  
  private options: Required<EmpEffectOptions> = {
    enableAudio: true,
    enableVisual: true,
    enableHaptic: true
  };

  constructor(options?: EmpEffectOptions) {
    this.audioEngine = new EmpAudioEngine();
    this.visualEngine = new EmpVisualEngine();
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (options) {
      this.options = { ...this.options, ...options };
    }
    
    // Disable haptic if reduced motion is preferred
    if (this.reducedMotion) {
      this.options.enableHaptic = false;
    }
  }

  /**
   * Initialize and start the controller
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[EMP Controller] Already running');
      return;
    }

    console.log('[EMP Controller] Starting...');

    // Initialize audio (may need user gesture unlock on iOS)
    if (this.options.enableAudio) {
      const audioReady = await this.audioEngine.initialize();
      
      if (!audioReady) {
        console.warn('[EMP Controller] Audio not ready - will show unlock prompt on iOS');
        this.showAudioUnlockHint();
      }
    }

    // Start visual effects
    if (this.options.enableVisual) {
      this.visualEngine.start();
    }

    this.isRunning = true;
    console.log('[EMP Controller] Started');
  }

  /**
   * Apply a specific ritual phase
   */
  applyPhase(phase: EmpPhase, syncTime?: number): void {
    if (!this.isRunning) {
      console.warn('[EMP Controller] Not running - call start() first');
      return;
    }

    // Debouncing: ignore duplicate phase events within 250ms
    const now = performance.now();
    if (now - this.lastPhaseTime < this.debounceMs) {
      console.log(`[EMP Controller] Debounced duplicate phase: ${phase}`);
      return;
    }
    
    this.lastPhaseTime = now;
    console.log(`[EMP Controller] Applying phase: ${phase}`);

    // Calculate sync timestamp (t0 = now + 60ms for network latency compensation)
    const t0 = syncTime || (now + 60);

    // Apply visual effects
    if (this.options.enableVisual) {
      this.visualEngine.applyPhase(phase);
    }

    // Apply audio effects
    if (this.options.enableAudio && this.audioEngine.isReady()) {
      this.audioEngine.applyPhase(phase, t0);
    }

    // Apply haptic effects (only during interference)
    if (this.options.enableHaptic && phase === 'interference') {
      this.triggerHaptic();
    }

    // Auto-stop on closed phase
    if (phase === 'closed') {
      setTimeout(() => this.stop(), 500);
    }
  }

  /**
   * Trigger haptic vibration (random pattern during interference)
   */
  private triggerHaptic(): void {
    if (!('vibrate' in navigator)) return;

    // Random irregular pattern
    const pattern = [
      10 + Math.random() * 20,  // vibrate
      30 + Math.random() * 40,  // pause
      8 + Math.random() * 15,   // vibrate
      20 + Math.random() * 30,  // pause
      12 + Math.random() * 18   // vibrate
    ];

    try {
      navigator.vibrate(pattern);
      console.log('[EMP Controller] Haptic triggered');
    } catch (err) {
      console.warn('[EMP Controller] Haptic error:', err);
    }

    // Trigger additional random vibrations during interference phase
    // (one pattern every 300-500ms)
    if (this.isRunning) {
      const nextDelay = 300 + Math.random() * 200;
      setTimeout(() => {
        if (this.isRunning) {
          this.triggerHaptic();
        }
      }, nextDelay);
    }
  }

  /**
   * Stop and cleanup all effects
   */
  stop(): void {
    if (!this.isRunning) return;

    console.log('[EMP Controller] Stopping...');

    this.audioEngine.stop();
    this.visualEngine.stop();
    
    // Stop any ongoing haptic
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }

    this.isRunning = false;
    this.lastPhaseTime = 0;
    
    console.log('[EMP Controller] Stopped');
  }

  /**
   * Check if controller is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Show audio unlock hint for iOS (if needed)
   */
  private showAudioUnlockHint(): void {
    // Check if we're likely on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) return;

    // Create temporary hint overlay
    const hint = document.createElement('div');
    hint.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 20px 30px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      z-index: 999999;
      pointer-events: auto;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    `;
    hint.textContent = '🔊 Tap to enable audio';
    
    const unlock = async () => {
      await this.audioEngine.initialize();
      hint.remove();
    };
    
    hint.addEventListener('click', unlock);
    hint.addEventListener('touchstart', unlock);
    
    document.body.appendChild(hint);
    
    // Auto-remove after 5s
    setTimeout(() => hint.remove(), 5000);
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
