// M1SSION™ - Capacitor Hardware Integration Hook
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { playSound } from '@/utils/audio';

interface CapacitorHardwareState {
  isCapacitor: boolean;
  deviceInfo: any;
  networkStatus: 'online' | 'offline' | 'unknown';
  batteryLevel: number | null;
  isCharging: boolean | null;
  orientation: string;
}

export const useCapacitorHardware = () => {
  const { toast } = useToast();
  
  const [state, setState] = useState<CapacitorHardwareState>({
    isCapacitor: false,
    deviceInfo: null,
    networkStatus: 'unknown',
    batteryLevel: null,
    isCharging: null,
    orientation: 'portrait'
  });

  // Explicit Capacitor detection for iOS compatibility
  const detectCapacitorWithExplicitNames = (): boolean => {
    return typeof window !== 'undefined' && 
      (!!(window as any).Capacitor || window.location.protocol === 'capacitor:');
  };

  // Initialize hardware monitoring with explicit function names
  const initializeHardwareMonitoring = async () => {
    const isCapacitor = detectCapacitorWithExplicitNames();
    
    if (!isCapacitor) {
      setState(prev => ({ ...prev, isCapacitor: false }));
      return;
    }

    console.log('🔧 Initializing Capacitor hardware monitoring...');

    try {
      const { Device, Network, StatusBar } = (window as any).Capacitor;

      // Get device info
      let deviceInfo = null;
      if (Device) {
        deviceInfo = await Device.getInfo();
        console.log('📱 Device detected:', deviceInfo.platform, deviceInfo.model);
      }

      // Get network status
      let networkStatus: 'online' | 'offline' | 'unknown' = 'unknown';
      if (Network) {
        const status = await Network.getStatus();
        networkStatus = status.connected ? 'online' : 'offline';
        console.log('🌐 Network status:', networkStatus);
      }

      // Configure status bar for iOS
      if (StatusBar && deviceInfo?.platform === 'ios') {
        await StatusBar.setStyle({ style: 'dark' });
        await StatusBar.setBackgroundColor({ color: '#000000' });
        console.log('📱 iOS status bar configured');
      }

      setState(prev => ({
        ...prev,
        isCapacitor: true,
        deviceInfo,
        networkStatus
      }));

      // Setup network listeners
      if (Network) {
        const networkListener = Network.addListener('networkStatusChange', (status: any) => {
          const newStatus = status.connected ? 'online' : 'offline';
          console.log('🌐 Network status changed:', newStatus);
          
          setState(prev => ({ ...prev, networkStatus: newStatus }));
          
          if (!status.connected) {
            toast({
              title: "Connessione persa",
              description: "Controlla la tua connessione internet"
            });
          }
        });

        return () => {
          networkListener.remove();
        };
      }

    } catch (error) {
      console.error('❌ Capacitor hardware initialization error:', error);
      setState(prev => ({ ...prev, isCapacitor: true })); // Still set as Capacitor even if some features fail
    }
  };

  // Device orientation handler with explicit function name
  const handleOrientationChangeExplicit = () => {
    const orientation = window.screen?.orientation?.type || 'portrait-primary';
    setState(prev => ({ ...prev, orientation }));
    console.log('📱 Orientation changed:', orientation);
  };

  // Initialize on mount
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    const init = async () => {
      cleanup = await initializeHardwareMonitoring();
    };
    
    init();

    // Add orientation listener
    window.addEventListener('orientationchange', handleOrientationChangeExplicit);

    return () => {
      cleanup?.();
      window.removeEventListener('orientationchange', handleOrientationChangeExplicit);
    };
  }, []);

  // Explicit hardware functions for iOS Capacitor compatibility
  const hardwareFunctions = {
    vibrate: async (duration: number = 200) => {
      if (state.isCapacitor && (window as any).Capacitor?.Haptics) {
        try {
          await (window as any).Capacitor.Haptics.impact({ style: 'medium' });
          console.log('📳 Haptic feedback triggered');
        } catch (error) {
          console.warn('⚠️ Haptic feedback failed:', error);
        }
      }
    },

    setStatusBarStyle: async (style: 'light' | 'dark') => {
      if (state.isCapacitor && (window as any).Capacitor?.StatusBar) {
        try {
          await (window as any).Capacitor.StatusBar.setStyle({ style });
          console.log('📱 Status bar style set:', style);
        } catch (error) {
          console.warn('⚠️ Status bar style change failed:', error);
        }
      }
    },

    keepScreenAwake: async (keep: boolean) => {
      if (state.isCapacitor && (window as any).Capacitor?.KeepAwake) {
        try {
          if (keep) {
            await (window as any).Capacitor.KeepAwake.keepAwake();
          } else {
            await (window as any).Capacitor.KeepAwake.allowSleep();
          }
          console.log('📱 Screen awake setting:', keep ? 'enabled' : 'disabled');
        } catch (error) {
          console.warn('⚠️ Keep awake setting failed:', error);
        }
      }
    }
  };

  return {
    ...state,
    ...hardwareFunctions,
    playSound,
    isLoading: false
  };
};