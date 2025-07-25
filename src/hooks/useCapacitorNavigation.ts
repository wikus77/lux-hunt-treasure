import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useWouterNavigation } from './useWouterNavigation';
import { useNavigationStore } from '@/stores/navigationStore';

export const useCapacitorNavigation = () => {
  const [location] = useLocation();
  const { navigate } = useWouterNavigation();
  const { setCurrentTab, addToHistory } = useNavigationStore();

  // Detect Capacitor environment
  const isCapacitor = typeof window !== 'undefined' && 
    (!!(window as any).Capacitor || window.location.protocol === 'capacitor:');

  // Log navigation changes for debugging
  useEffect(() => {
    console.log('🧭 CAPACITOR NAVIGATION:', {
      currentPath: location,
      isCapacitor,
      timestamp: new Date().toISOString()
    });
    
    // Update navigation store
    setCurrentTab(location);
    addToHistory(location);
    
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
  }, [location, isCapacitor, setCurrentTab, addToHistory]);

  // Capacitor-compatible navigation function
  const navigateCapacitor = (path: string, options?: { replace?: boolean }) => {
    console.log('🧭 Navigating to:', path, 'Capacitor:', isCapacitor);
    
    // Update store first
    setCurrentTab(path);
    addToHistory(path);
    
    // Use React Router navigate
    navigate(path, { replace: options?.replace || false });
    
    // iOS WebView scroll fix
    if (isCapacitor) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }
  };

  // Debug info
  const getNavigationInfo = () => ({
    currentPath: location,
    isCapacitor,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    userAgent: navigator.userAgent,
    hasCapacitorGlobal: !!(window as any).Capacitor
  });

  return {
    navigateCapacitor,
    isCapacitor,
    currentPath: location,
    getNavigationInfo
  };
};