// M1SSION™ - App Initialization Hook for iOS Capacitor
import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { useNavigationStore } from '@/stores/navigationStore';
import { explicitNavigationHandler } from '@/utils/iosCapacitorFunctions';

interface AppInitializationState {
  isInitialized: boolean;
  isCapacitor: boolean;
  hasCompletedIntro: boolean;
  appVersion: string;
  deviceInfo: any;
}

export const useAppInitialization = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { setCapacitorMode, setCurrentTab } = useNavigationStore();
  
  const [state, setState] = useState<AppInitializationState>({
    isInitialized: false,
    isCapacitor: false,
    hasCompletedIntro: false,
    appVersion: '1.0.0',
    deviceInfo: null
  });

  // Detect Capacitor environment with explicit function names
  const detectCapacitorEnvironment = (): boolean => {
    return typeof window !== 'undefined' && 
      (!!(window as any).Capacitor || window.location.protocol === 'capacitor:');
  };

  // Initialize app with explicit function names for iOS compatibility
  const initializeApp = async () => {
    console.log('🚀 M1SSION App Initialization starting...');
    
    try {
      const isCapacitor = detectCapacitorEnvironment();
      
      // Update navigation store
      setCapacitorMode(isCapacitor);
      
      // Get device info if in Capacitor
      let deviceInfo = null;
      if (isCapacitor && (window as any).Capacitor) {
        try {
          const { Device } = (window as any).Capacitor;
          if (Device) {
            deviceInfo = await Device.getInfo();
            console.log('📱 Device Info:', deviceInfo);
          }
        } catch (error) {
          console.warn('⚠️ Could not get device info:', error);
        }
      }

      // Check if intro was completed
      const hasCompletedIntro = localStorage.getItem('m1ssion-intro-completed') === 'true';
      
      // Set initial route based on auth and intro status
      if (isCapacitor && isAuthenticated && !authLoading) {
        setCurrentTab('/home');
      }

      setState({
        isInitialized: true,
        isCapacitor,
        hasCompletedIntro,
        appVersion: '1.0.0',
        deviceInfo
      });

      console.log('✅ M1SSION App Initialization completed:', {
        isCapacitor,
        isAuthenticated,
        hasCompletedIntro,
        deviceInfo: deviceInfo?.platform || 'web'
      });

    } catch (error) {
      console.error('❌ App Initialization error:', error);
      setState(prev => ({ ...prev, isInitialized: true }));
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeApp();
  }, [isAuthenticated, authLoading]);

  // iOS-specific optimizations
  useEffect(() => {
    if (state.isCapacitor && state.isInitialized) {
      // Prevent iOS bounce scroll
      document.body.style.overscrollBehavior = 'none';
      (document.body.style as any).WebkitOverflowScrolling = 'touch';
      
      // Add safe area CSS variables for iOS
      const addSafeAreaStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
          :root {
            --safe-area-inset-top: env(safe-area-inset-top, 44px);
            --safe-area-inset-bottom: env(safe-area-inset-bottom, 34px);
            --safe-area-inset-left: env(safe-area-inset-left, 0px);
            --safe-area-inset-right: env(safe-area-inset-right, 0px);
          }
        `;
        document.head.appendChild(style);
      };
      
      addSafeAreaStyles();
    }
  }, [state.isCapacitor, state.isInitialized]);

  return {
    ...state,
    initializeApp,
    isLoading: authLoading || !state.isInitialized
  };
};