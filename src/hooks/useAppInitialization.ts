// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// M1SSION™ - App Initialization Hook for PWA Mode (No Capacitor)

import { useEffect, useState } from 'react';
import { useUnifiedAuth } from './useUnifiedAuth';
import { useNavigationStore } from '@/stores/navigationStore';
import { detectPWAEnvironment } from '@/utils/pwaStubs';

interface AppInitializationState {
  isInitialized: boolean;
  isCapacitor: boolean;
  hasCompletedIntro: boolean;
  appVersion: string;
  deviceInfo: any;
}

export const useAppInitialization = () => {
  const { isAuthenticated, isLoading: authLoading } = useUnifiedAuth();
  const { setCapacitorMode, setCurrentTab } = useNavigationStore();
  
  const [state, setState] = useState<AppInitializationState>({
    isInitialized: false,
    isCapacitor: false,
    hasCompletedIntro: false,
    appVersion: '1.0.0',
    deviceInfo: null
  });

  // Initialize app for PWA mode only - no Capacitor logic
  const initializeApp = async () => {
    console.log('🚀 M1SSION PWA App Initialization starting...');
    
    try {
      const isPWA = detectPWAEnvironment();
      
      // Always set Capacitor mode to false for web builds
      setCapacitorMode(false);
      
      // PWA device info instead of Capacitor
      const deviceInfo = {
        platform: 'web',
        userAgent: navigator.userAgent,
        isPWA: isPWA
      };

      // Check if intro was completed
      const hasCompletedIntro = localStorage.getItem('m1ssion-intro-completed') === 'true';
      
      // Set initial route based on auth and intro status
      if (isPWA && isAuthenticated && !authLoading) {
        setCurrentTab('/home');
      }

      setState({
        isInitialized: true,
        isCapacitor: false, // Always false in PWA build
        hasCompletedIntro,
        appVersion: '1.0.0',
        deviceInfo
      });

      console.log('✅ M1SSION PWA App Initialization completed:', {
        isCapacitor: false,
        isAuthenticated,
        hasCompletedIntro,
        deviceInfo: deviceInfo.platform
      });

    } catch (error) {
      console.error('❌ PWA App Initialization error:', error);
      setState(prev => ({ ...prev, isInitialized: true }));
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeApp();
  }, [isAuthenticated, authLoading]);

  // iOS PWA-specific optimizations (no Capacitor dependencies)
  useEffect(() => {
    if (state.isInitialized) {
      // 🔥 FIX: Allow native pull-to-refresh in Safari browser
      // Note: PWA standalone on iOS never has native pull-to-refresh
      document.body.style.overscrollBehavior = 'auto';
      (document.body.style as any).WebkitOverflowScrolling = 'touch';
      
      // Add safe area CSS variables for iOS PWA
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
  }, [state.isInitialized]);

  return {
    ...state,
    initializeApp,
    isLoading: authLoading || !state.isInitialized
  };
};