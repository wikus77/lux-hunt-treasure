// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - PWA Hardware Stub (replacement for Capacitor hardware)

import { useState, useEffect } from 'react';
import { playSound } from '@/utils/audio';
import { hapticManager, HapticType } from '@/utils/haptics';

export const usePWAHardwareStub = () => {
  const [state] = useState({
    isPWA: typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches,
    deviceInfo: { platform: 'web', userAgent: navigator.userAgent },
    networkStatus: navigator.onLine ? 'online' : 'offline' as 'online' | 'offline' | 'unknown',
    orientation: 'portrait'
  });

  const vibrate = async (duration: number = 200) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
        console.log('📳 Vibration triggered');
      } catch (error) {
        console.warn('⚠️ Vibration failed:', error);
      }
    }
  };

  const triggerHaptic = async (type: HapticType) => {
    await hapticManager.trigger(type);
  };

  return {
    ...state,
    vibrate,
    triggerHaptic,
    playSound,
    isLoading: false
  };
};

// Main export
export const usePWAHardware = usePWAHardwareStub;

// Backward compatibility
export const useCapacitorHardware = usePWAHardwareStub;