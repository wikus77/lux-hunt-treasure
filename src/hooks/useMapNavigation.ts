
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useWouterNavigation } from './useWouterNavigation';

export const useMapNavigation = () => {
  const [location] = useLocation();
  const { navigate } = useWouterNavigation();

  // Debug navigation for iOS
  useEffect(() => {
    console.log('🧭 Navigation hook - Current path:', location);
    
    // Check if we're in Capacitor environment
    const isCapacitor = !!(window as any).Capacitor;
    console.log('🧭 Capacitor environment:', isCapacitor);
    
    // Log when navigating to map
    if (location === '/map') {
      console.log('🗺️ Successfully navigated to map page');
      
      // iOS-specific fixes
      if (isCapacitor) {
        // Force scroll to top
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      }
    }
  }, [location]);

  const forceNavigateToMap = () => {
    console.log('🧭 Force navigate to map');
    navigate('/map', { replace: true });
  };

  const debugNavigation = () => {
    return {
      currentPath: location,
      isMapPage: location === '/map',
      isCapacitor: !!(window as any).Capacitor,
      canNavigate: !!navigate
    };
  };

  return {
    forceNavigateToMap,
    debugNavigation,
    currentPath: location,
    isMapPage: location === '/map'
  };
};
