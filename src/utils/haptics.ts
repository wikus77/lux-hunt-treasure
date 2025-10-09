// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - Advanced Haptics Manager for PWA

// Pattern ottimizzati per navigator.vibrate()
const HAPTIC_PATTERNS = {
  // Notifiche
  tick: [10],                          // Feedback leggero
  buzzUnlocked: [0, 100, 50, 100],     // Pattern distintivo
  missionComplete: [0, 50, 50, 100, 50, 150],
  timeExpired: [0, 300],
  important: [0, 50, 100, 50, 200, 50, 50],
  
  // XP/Rewards
  xpSmall: [30],
  xpMedium: [0, 50, 30, 50],
  xpLarge: [0, 50, 50, 100, 50, 150],
  levelUp: [0, 100, 100, 100, 100, 200],
  
  // Interazioni
  selection: [15],
  success: [0, 50, 50, 100],
  error: [300],
  
  // Giochi
  cardFlip: [15],
  match: [0, 50, 30, 50],
  wrong: [200],
  victory: [0, 100, 50, 100, 50, 200]
} as const;

export type HapticType = keyof typeof HAPTIC_PATTERNS;

class HapticManager {
  private isEnabled: boolean = true;
  
  constructor() {
    // Carica preferenza da localStorage
    const saved = localStorage.getItem('haptics-enabled');
    if (saved !== null) {
      this.isEnabled = saved === 'true';
    }
  }
  
  async trigger(type: HapticType) {
    if (!this.isEnabled || !('vibrate' in navigator)) return;
    
    const pattern = HAPTIC_PATTERNS[type];
    try {
      navigator.vibrate(pattern);
      console.log('📳 Haptic triggered:', type);
    } catch (error) {
      console.warn('⚠️ Haptic failed:', error);
    }
  }
  
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem('haptics-enabled', String(enabled));
    console.log('📳 Haptics', enabled ? 'enabled' : 'disabled');
  }
  
  getEnabled(): boolean {
    return this.isEnabled;
  }
  
  isSupported(): boolean {
    return 'vibrate' in navigator;
  }
}

export const hapticManager = new HapticManager();
