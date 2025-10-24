/**
 * The Pulse™ — EMP Visual Effects Engine
 * Asynchronous light bursts + distortion overlay management
 * Poisson process for irregular flash timing
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

type EmpPhase = 'precharge' | 'blackout' | 'interference' | 'reveal' | 'closed';

interface FlashBurst {
  startTime: number;
  duration: number;
  intensity: number;
  curve: (t: number) => number;
}

export class EmpVisualEngine {
  private container: HTMLDivElement | null = null;
  private flashOverlay: HTMLDivElement | null = null;
  private rafId: number | null = null;
  private activeBursts: FlashBurst[] = [];
  private lastBurstTime = 0;
  private currentPhase: EmpPhase = 'closed';
  private reducedMotion = false;
  private lambda = 0; // Poisson process rate parameter

  constructor() {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Start visual effects
   */
  start(): void {
    if (this.container) return;

    // Create overlay container
    this.container = document.createElement('div');
    this.container.className = 'ritual-crt-overlay';
    
    // Add scanlines
    const scanlines = document.createElement('div');
    scanlines.className = 'ritual-scanlines';
    this.container.appendChild(scanlines);
    
    // Add vignette
    const vignette = document.createElement('div');
    vignette.className = 'ritual-vignette';
    this.container.appendChild(vignette);
    
    // Add shear bars (random positions)
    if (!this.reducedMotion) {
      const shearContainer = document.createElement('div');
      shearContainer.className = 'ritual-shear-bars';
      
      for (let i = 0; i < 5; i++) {
        const bar = document.createElement('div');
        bar.className = 'ritual-shear-bar';
        bar.style.top = `${Math.random() * 100}%`;
        bar.style.animationDelay = `${Math.random() * 0.3}s`;
        shearContainer.appendChild(bar);
      }
      
      this.container.appendChild(shearContainer);
    }
    
    // Create flash overlay for asynchronous bursts
    this.flashOverlay = document.createElement('div');
    this.flashOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.6), rgba(255, 255, 255, 0.1) 70%);
      mix-blend-mode: screen;
      pointer-events: none;
      opacity: 0;
    `;
    this.container.appendChild(this.flashOverlay);
    
    document.body.appendChild(this.container);
    document.body.classList.add('ritual-distortion-active');
    
    // Start animation loop
    this.startAnimationLoop();
    
    console.log('[EMP Visual] Visual effects started');
  }

  /**
   * Apply phase-specific visuals
   */
  applyPhase(phase: EmpPhase): void {
    this.currentPhase = phase;
    
    // Set Poisson rate based on phase
    switch (phase) {
      case 'precharge':
        this.lambda = this.reducedMotion ? 0.5 : 1.2; // bursts per second
        break;
      case 'interference':
        this.lambda = this.reducedMotion ? 0.8 : 2.5; // higher frequency
        document.body.classList.add('ritual-distortion-interference');
        break;
      case 'blackout':
      case 'reveal':
      case 'closed':
        this.lambda = 0; // no bursts
        document.body.classList.remove('ritual-distortion-interference');
        break;
    }
    
    console.log(`[EMP Visual] Phase: ${phase}, λ=${this.lambda}`);
  }

  /**
   * Start RAF animation loop for flash bursts
   */
  private startAnimationLoop(): void {
    if (this.rafId !== null) return;
    
    const animate = (timestamp: number) => {
      this.updateFlashBursts(timestamp);
      this.rafId = requestAnimationFrame(animate);
    };
    
    this.rafId = requestAnimationFrame(animate);
  }

  /**
   * Update flash bursts using Poisson process
   */
  private updateFlashBursts(timestamp: number): void {
    if (!this.flashOverlay) return;
    
    // Generate new bursts based on Poisson process
    if (this.lambda > 0) {
      const timeSinceLastBurst = timestamp - this.lastBurstTime;
      
      // Poisson process: probability of event in small time interval dt
      // P(event) ≈ λ * dt (for small dt)
      const dt = 16.67; // ~60fps frame time
      const probability = this.lambda * (dt / 1000);
      
      if (Math.random() < probability) {
        this.createBurst(timestamp);
        this.lastBurstTime = timestamp;
      }
    }
    
    // Update active bursts
    let totalIntensity = 0;
    this.activeBursts = this.activeBursts.filter(burst => {
      const elapsed = timestamp - burst.startTime;
      if (elapsed >= burst.duration) return false;
      
      const t = elapsed / burst.duration;
      const currentIntensity = burst.intensity * burst.curve(t);
      totalIntensity += currentIntensity;
      
      return true;
    });
    
    // Apply combined intensity to overlay
    this.flashOverlay.style.opacity = Math.min(totalIntensity, 1).toString();
  }

  /**
   * Create a new flash burst
   */
  private createBurst(timestamp: number): void {
    // Random duration: 60-140ms
    const duration = 60 + Math.random() * 80;
    
    // Random intensity: 0.2-0.85 (never too subtle, never blinding)
    const baseIntensity = 0.2 + Math.random() * 0.65;
    const intensity = this.reducedMotion ? baseIntensity * 0.5 : baseIntensity;
    
    // Non-linear ease-out exponential curve
    const curve = (t: number) => {
      return Math.pow(1 - t, 2.5); // Sharper decay
    };
    
    this.activeBursts.push({
      startTime: timestamp,
      duration,
      intensity,
      curve
    });
  }

  /**
   * Stop and cleanup
   */
  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    
    this.flashOverlay = null;
    this.activeBursts = [];
    this.currentPhase = 'closed';
    this.lambda = 0;
    
    document.body.classList.remove('ritual-distortion-active', 'ritual-distortion-interference');
    
    console.log('[EMP Visual] Visual effects stopped');
  }

  /**
   * Check if running
   */
  isRunning(): boolean {
    return this.container !== null;
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
