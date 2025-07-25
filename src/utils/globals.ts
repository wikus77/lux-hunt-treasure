// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

// Utility functions for iOS compatibility and enhanced navigation
export const preserveFunctionName = (fn: Function, name?: string) => {
  if (name && fn) {
    Object.defineProperty(fn, 'name', { value: name });
  }
  return fn;
};

export const vibrate = (pattern?: number | number[]) => {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern || 200);
    }
  } catch (error) {
    console.warn('Vibration not supported:', error);
  }
};

export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isMobileDevice = () => isMobile();

export const getDeviceOrientation = () => {
  if (typeof window === 'undefined') return 'portrait';
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
};

export const isProductionReady = () => {
  return process.env.NODE_ENV === 'production';
};

export const safeLog = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔒 [M1SSION™] ${message}`, ...args);
  }
};

export const playSound = (soundName: string) => {
  try {
    // Simple audio feedback for web
    if (typeof window !== 'undefined') {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  } catch (error) {
    console.warn('Audio not available:', error);
  }
};