// 🔐 FIRMATO: BY JOSEPH MULÈ – CEO M1SSION KFT™  
// M1SSION™ Capacitor Navigation Hook - Updated for Custom Routing
// Compatibilità Capacitor iOS al 100% - NO react-router-dom

import { useEffect } from 'react';
import { useNavigation } from '@/hooks/useNavigation';
import { useNavigationStore } from '@/stores/navigationStore';

export const useCapacitorNavigation = () => {
  const { location, navigate, isCapacitor } = useNavigation();
  const { setCurrentTab, addToHistory } = useNavigationStore();

  // Log navigation changes for debugging
  useEffect(() => {
    console.log('🧭 CAPACITOR NAVIGATION:', {
      currentPath: location.pathname,
      isCapacitor,
      timestamp: new Date().toISOString()
    });
    
    // Update navigation store
    setCurrentTab(location.pathname);
    addToHistory(location.pathname);
    
    // iOS-specific optimizations
    if (isCapacitor) {
      // Prevent iOS bounce scroll
      document.body.style.overscrollBehavior = 'none';
      (document.body.style as any).WebkitOverflowScrolling = 'touch';
      
      // Force scroll to top for new routes
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }
  }, [location.pathname, isCapacitor, setCurrentTab, addToHistory]);

  // Capacitor-compatible navigation function
  const navigateCapacitor = (path: string, options?: { replace?: boolean }) => {
    console.log('🧭 Navigating to:', path, 'Capacitor:', isCapacitor);
    
    // Update store first
    setCurrentTab(path);
    addToHistory(path);
    
    // Use custom navigation
    navigate(path, { replace: options?.replace || false });
  };

  // Debug info
  const getNavigationInfo = () => ({
    currentPath: location.pathname,
    isCapacitor,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    userAgent: navigator.userAgent,
    hasCapacitorGlobal: !!(window as any).Capacitor
  });

  return {
    navigateCapacitor,
    isCapacitor,
    currentPath: location.pathname,
    getNavigationInfo
  };
};