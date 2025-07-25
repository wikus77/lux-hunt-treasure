// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useEffect, useState } from 'react';
import { useUnifiedAuth } from './useUnifiedAuth';
import { useNavigationStore } from '@/stores/navigationStore';

interface AppInitializationState {
  isInitialized: boolean;
  hasCompletedIntro: boolean;
  appVersion: string;
  deviceInfo: any;
}

export const useAppInitialization = () => {
  const { session, isAuthenticated, isLoading: authLoading } = useUnifiedAuth();
  const { setCurrentTab } = useNavigationStore();
  
  const [state, setState] = useState<AppInitializationState>({
    isInitialized: false,
    hasCompletedIntro: false,
    appVersion: '1.0.0',
    deviceInfo: null
  });

  const isBrowser = () => {
    return typeof window !== 'undefined';
  };

  // Initialize app with explicit function names for iOS compatibility
  const initializeApp = async () => {
    console.log('🚀 M1SSION App Initialization starting...');
    
    try {
      let deviceInfo = null;
      if (isBrowser()) {
        try {
          deviceInfo = { platform: 'web' };
          console.log('📱 Device Info:', deviceInfo);
        } catch (error) {
          console.warn('⚠️ Could not get device info:', error);
        }
      }

      // Check if intro was completed
      const hasCompletedIntro = localStorage.getItem('m1ssion-intro-completed') === 'true';
      
      // Set initial route based on auth and intro status
      if (session) {
        setCurrentTab('/home');
      }

      setState({
        isInitialized: true,
        hasCompletedIntro,
        appVersion: '1.0.0',
        deviceInfo
      });

      console.log('✅ M1SSION App Initialization completed:', {
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
    if (isBrowser()) {
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
  }, []);

  return {
    ...state,
    initializeApp,
    isLoading: authLoading || !state.isInitialized
  };
};