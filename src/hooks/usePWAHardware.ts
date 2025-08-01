// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - PWA Hardware Integration Hook

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { playSound } from '@/utils/audio';

interface PWAHardwareState {
  isPWA: boolean;
  deviceInfo: any;
  networkStatus: 'online' | 'offline' | 'unknown';
  orientation: string;
}

export const usePWAHardware = () => {
  const { toast } = useToast();
  
  const [state, setState] = useState<PWAHardwareState>({
    isPWA: false,
    deviceInfo: null,
    networkStatus: 'unknown',
    orientation: 'portrait'
  });

  // PWA detection
  const detectPWAEnvironment = (): boolean => {
    return typeof window !== 'undefined' && (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  };

  // Initialize PWA monitoring
  const initializePWAMonitoring = async () => {
    const isPWA = detectPWAEnvironment();
    
    console.log('🔧 Initializing PWA hardware monitoring...');

    try {
      // Get basic device info via navigator
      const deviceInfo = {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language,
        onLine: navigator.onLine
      };

      // Get network status
      const networkStatus: 'online' | 'offline' | 'unknown' = 
        navigator.onLine ? 'online' : 'offline';

      setState(prev => ({
        ...prev,
        isPWA,
        deviceInfo,
        networkStatus
      }));

      // Setup network listeners
      const handleOnline = () => {
        console.log('🌐 Network status: online');
        setState(prev => ({ ...prev, networkStatus: 'online' }));
      };

      const handleOffline = () => {
        console.log('🌐 Network status: offline');
        setState(prev => ({ ...prev, networkStatus: 'offline' }));
        toast({
          title: "Connessione persa",
          description: "Controlla la tua connessione internet"
        });
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };

    } catch (error) {
      console.error('❌ PWA hardware initialization error:', error);
      setState(prev => ({ ...prev, isPWA: true }));
    }
  };

  // Device orientation handler
  const handleOrientationChange = () => {
    const orientation = window.screen?.orientation?.type || 'portrait-primary';
    setState(prev => ({ ...prev, orientation }));
    console.log('📱 Orientation changed:', orientation);
  };

  // Initialize on mount
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    const init = async () => {
      cleanup = await initializePWAMonitoring();
    };
    
    init();

    // Add orientation listener
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      cleanup?.();
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // PWA hardware functions
  const hardwareFunctions = {
    vibrate: async (duration: number = 200) => {
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(duration);
          console.log('📳 Vibration triggered');
        } catch (error) {
          console.warn('⚠️ Vibration failed:', error);
        }
      }
    },

    requestPermissions: async () => {
      const permissions = [];
      
      if ('Notification' in window) {
        const notificationPermission = await Notification.requestPermission();
        permissions.push({ type: 'notifications', status: notificationPermission });
      }
      
      return permissions;
    },

    shareContent: async (data: { title: string; text: string; url?: string }) => {
      if ('share' in navigator) {
        try {
          await navigator.share(data);
          console.log('📤 Content shared successfully');
          return true;
        } catch (error) {
          console.warn('⚠️ Share failed:', error);
          return false;
        }
      }
      return false;
    }
  };

  return {
    ...state,
    ...hardwareFunctions,
    playSound,
    isLoading: false
  };
};