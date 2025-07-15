import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import BottomNavigation from './BottomNavigation';
import { useNavigationStore } from '@/stores/navigationStore';

interface NavigationWrapperProps {
  children: React.ReactNode;
}

const NavigationWrapper: React.FC<NavigationWrapperProps> = ({ children }) => {
  const [location] = useLocation();
  const { setCurrentTab, addToHistory } = useNavigationStore();

  // Update navigation state when route changes
  useEffect(() => {
    setCurrentTab(location);
    addToHistory(location);
    
    console.log('🧭 Navigation updated:', {
      path: location,
      timestamp: new Date().toISOString()
    });
  }, [location, setCurrentTab, addToHistory]);

  // iOS Capacitor specific optimizations
  useEffect(() => {
    const isCapacitor = !!(window as any).Capacitor;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isCapacitor && isIOS) {
      // Prevent iOS bounce effect
      document.body.style.overscrollBehavior = 'none';
      (document.body.style as any).WebkitOverflowScrolling = 'touch';
      
      // Fix viewport on orientation change
      const handleOrientationChange = () => {
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      };
      
      window.addEventListener('orientationchange', handleOrientationChange);
      
      return () => {
        window.removeEventListener('orientationchange', handleOrientationChange);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#070818] relative">
      <main className="pb-20">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default NavigationWrapper;