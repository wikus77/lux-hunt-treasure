
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useMapNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Debug navigation for iOS
  useEffect(() => {
    console.log('🧭 Navigation hook - Current path:', location.pathname);
    
    // Check if we're in Capacitor environment
    const isCapacitor = !!(window as any).Capacitor;
    console.log('🧭 Capacitor environment:', isCapacitor);
    
    // Log when navigating to map
    if (location.pathname === '/map') {
      console.log('🗺️ Successfully navigated to map page');
      
      // iOS-specific fixes
      if (isCapacitor) {
        // Force scroll to top
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      }
    }
  }, [location.pathname]);

  const forceNavigateToMap = () => {
    console.log('🧭 Force navigate to map');
    navigate('/map', { replace: true });
  };

  const debugNavigation = () => {
    return {
      currentPath: location.pathname,
      isMapPage: location.pathname === '/map',
      isCapacitor: !!(window as any).Capacitor,
      canNavigate: !!navigate
    };
  };

  return {
    forceNavigateToMap,
    debugNavigation,
    currentPath: location.pathname,
    isMapPage: location.pathname === '/map'
  };
};
