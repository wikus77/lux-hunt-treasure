// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - PWA Navigation Hook

import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useWouterNavigation } from './useWouterNavigation';
import { useNavigationStore } from '@/stores/navigationStore';

export const usePWANavigation = () => {
  const [location] = useLocation();
  const { navigate } = useWouterNavigation();
  const { setCurrentTab, addToHistory } = useNavigationStore();

  // Detect PWA environment
  const isPWA = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );

  // Log navigation changes for debugging
  useEffect(() => {
    console.log('🧭 PWA NAVIGATION:', {
      currentPath: location,
      isPWA,
      timestamp: new Date().toISOString()
    });
    
    // Update navigation store
    setCurrentTab(location);
    addToHistory(location);
    
    // PWA-specific optimizations
    if (isPWA) {
      // 🔥 FIX: Allow native pull-to-refresh in Safari browser
      document.body.style.overscrollBehavior = 'auto';
      document.body.style.touchAction = 'pan-x pan-y';
      
      // Force scroll to top for new routes
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }
  }, [location, isPWA, setCurrentTab, addToHistory]);

  // PWA-compatible navigation function
  const navigatePWA = (path: string, options?: { replace?: boolean }) => {
    console.log('🧭 Navigating to:', path, 'PWA:', isPWA);
    
    // Update store first
    setCurrentTab(path);
    addToHistory(path);
    
    // Use React Router navigate
    navigate(path, { replace: options?.replace || false });
    
    // PWA scroll fix
    if (isPWA) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }
  };

  // Debug info
  const getNavigationInfo = () => ({
    currentPath: location,
    isPWA,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    userAgent: navigator.userAgent,
    displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
  });

  return {
    navigatePWA,
    isPWA,
    currentPath: location,
    getNavigationInfo
  };
};