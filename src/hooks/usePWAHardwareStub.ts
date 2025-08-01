// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - PWA Hardware Stub (replacement for Capacitor hardware)

import { useState, useEffect } from 'react';
import { playSound } from '@/utils/audio';

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

  return {
    ...state,
    vibrate,
    playSound,
    isLoading: false
  };
};

// Backward compatibility
export const useCapacitorHardware = usePWAHardwareStub;