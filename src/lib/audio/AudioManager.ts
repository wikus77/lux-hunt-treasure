/**
 * M1SSION™ AudioManager - Singleton Pattern for iOS Safari Stability
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * PROBLEMA RISOLTO:
 * - Safari iOS limita il numero di AudioContext attivi
 * - Creare nuovi Audio() su ogni click causa memory leak
 * - AudioContext senza cleanup causa crash su iPhone 15
 * 
 * SOLUZIONE:
 * - UN SOLO AudioContext globale
 * - Pool di Audio elements pre-allocati
 * - Cleanup automatico
 */

type AudioCategory = 'navigation' | 'feedback' | 'game' | 'notification' | 'music';

interface AudioInstance {
  audio: HTMLAudioElement;
  category: AudioCategory;
  lastUsed: number;
}

class AudioManagerSingleton {
  private static instance: AudioManagerSingleton;
  private audioContext: AudioContext | null = null;
  private audioPool: Map<string, AudioInstance> = new Map();
  private isUnlocked = false;
  private maxPoolSize = 10; // Limite massimo di audio in pool
  private cleanupInterval: number | null = null;
  
  private constructor() {
    // Cleanup automatico ogni 30 secondi
    this.cleanupInterval = window.setInterval(() => {
      this.cleanupUnusedAudio();
    }, 30000);
    
    // Unlock audio su primo user gesture
    this.setupUnlockListener();
  }
  
  static getInstance(): AudioManagerSingleton {
    if (!AudioManagerSingleton.instance) {
      AudioManagerSingleton.instance = new AudioManagerSingleton();
    }
    return AudioManagerSingleton.instance;
  }
  
  /**
   * Ottiene l'AudioContext singleton (crea se non esiste)
   */
  getAudioContext(): AudioContext | null {
    if (!this.audioContext) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
        }
      } catch (e) {
        console.warn('[AudioManager] Failed to create AudioContext:', e);
        return null;
      }
    }
    
    // Resume se suspended (necessario per Safari)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    
    return this.audioContext;
  }
  
  /**
   * Riproduce un suono dalla pool (crea se non esiste)
   */
  play(src: string, options: {
    volume?: number;
    category?: AudioCategory;
    loop?: boolean;
  } = {}): HTMLAudioElement | null {
    const { volume = 0.7, category = 'feedback', loop = false } = options;
    
    try {
      let instance = this.audioPool.get(src);
      
      if (!instance) {
        // Pulisci pool se troppo grande
        if (this.audioPool.size >= this.maxPoolSize) {
          this.cleanupOldestAudio();
        }
        
        const audio = new Audio(src);
        audio.preload = 'auto';
        instance = { audio, category, lastUsed: Date.now() };
        this.audioPool.set(src, instance);
      }
      
      const { audio } = instance;
      audio.volume = volume;
      audio.loop = loop;
      audio.currentTime = 0;
      instance.lastUsed = Date.now();
      
      // Play con gestione errori
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(err => {
          // Ignora errori di autoplay - normali su iOS
          if (err.name !== 'NotAllowedError') {
            console.warn('[AudioManager] Play failed:', err.message);
          }
        });
      }
      
      return audio;
    } catch (e) {
      console.warn('[AudioManager] Error playing audio:', e);
      return null;
    }
  }
  
  /**
   * Ferma un audio specifico
   */
  stop(src: string): void {
    const instance = this.audioPool.get(src);
    if (instance) {
      instance.audio.pause();
      instance.audio.currentTime = 0;
    }
  }
  
  /**
   * Ferma tutti gli audio di una categoria
   */
  stopCategory(category: AudioCategory): void {
    this.audioPool.forEach((instance) => {
      if (instance.category === category) {
        instance.audio.pause();
        instance.audio.currentTime = 0;
      }
    });
  }
  
  /**
   * Ferma TUTTI gli audio
   */
  stopAll(): void {
    this.audioPool.forEach((instance) => {
      instance.audio.pause();
      instance.audio.currentTime = 0;
    });
  }
  
  /**
   * Genera un beep/tone usando AudioContext (per feedback)
   */
  playTone(frequency: number, duration: number, options: {
    type?: OscillatorType;
    volume?: number;
  } = {}): void {
    const { type = 'sine', volume = 0.3 } = options;
    const ctx = this.getAudioContext();
    
    if (!ctx) return;
    
    try {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('[AudioManager] Tone generation failed:', e);
    }
  }
  
  /**
   * Precarica audio per uso futuro
   */
  preload(srcs: string[]): void {
    srcs.forEach(src => {
      if (!this.audioPool.has(src) && this.audioPool.size < this.maxPoolSize) {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = src;
        this.audioPool.set(src, { 
          audio, 
          category: 'feedback', 
          lastUsed: Date.now() 
        });
      }
    });
  }
  
  /**
   * Sblocca audio per iOS (deve essere chiamato su user gesture)
   */
  unlock(): void {
    if (this.isUnlocked) return;
    
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        this.isUnlocked = true;
        console.debug('[AudioManager] Audio unlocked');
      }).catch(() => {});
    } else {
      this.isUnlocked = true;
    }
    
    // Crea un silent audio per sbloccare il sistema
    const silentAudio = new Audio();
    silentAudio.play().catch(() => {});
  }
  
  /**
   * Pulisce audio non usati da più di 60 secondi
   */
  private cleanupUnusedAudio(): void {
    const now = Date.now();
    const maxAge = 60000; // 60 secondi
    
    this.audioPool.forEach((instance, src) => {
      if (now - instance.lastUsed > maxAge && instance.audio.paused) {
        instance.audio.src = '';
        this.audioPool.delete(src);
      }
    });
  }
  
  /**
   * Rimuove l'audio più vecchio dalla pool
   */
  private cleanupOldestAudio(): void {
    let oldestSrc: string | null = null;
    let oldestTime = Date.now();
    
    this.audioPool.forEach((instance, src) => {
      if (instance.lastUsed < oldestTime && instance.audio.paused) {
        oldestTime = instance.lastUsed;
        oldestSrc = src;
      }
    });
    
    if (oldestSrc) {
      const instance = this.audioPool.get(oldestSrc);
      if (instance) {
        instance.audio.src = '';
        this.audioPool.delete(oldestSrc);
      }
    }
  }
  
  /**
   * Setup listener per sbloccare audio su primo touch
   */
  private setupUnlockListener(): void {
    const unlockHandler = () => {
      this.unlock();
      document.removeEventListener('touchstart', unlockHandler);
      document.removeEventListener('click', unlockHandler);
    };
    
    document.addEventListener('touchstart', unlockHandler, { once: true, passive: true });
    document.addEventListener('click', unlockHandler, { once: true });
  }
  
  /**
   * Cleanup completo (chiamare su unmount app)
   */
  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.audioPool.forEach((instance) => {
      instance.audio.pause();
      instance.audio.src = '';
    });
    this.audioPool.clear();
    
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }
  
  /**
   * Info di debug
   */
  getStats(): { poolSize: number; contextState: string | null; isUnlocked: boolean } {
    return {
      poolSize: this.audioPool.size,
      contextState: this.audioContext?.state || null,
      isUnlocked: this.isUnlocked
    };
  }
}

// Export singleton instance
export const AudioManager = AudioManagerSingleton.getInstance();

// Export type for external use
export type { AudioCategory };

