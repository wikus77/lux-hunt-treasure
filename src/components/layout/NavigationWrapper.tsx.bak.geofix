import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import BottomNavigation from './BottomNavigation';
import { useNavigationStore } from '@/stores/navigationStore';
import PullToRefreshIndicator from '@/components/pwa/PullToRefreshIndicator';

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

  // PWA specific optimizations
  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    const isMobile = /iPad|iPhone|iPod|Android|Mobile/i.test(navigator.userAgent);
    
    if (isPWA || isMobile) {
      // Prevent horizontal bounce only (allow vertical for pull-to-refresh)
      document.body.style.overscrollBehaviorX = 'none';
      document.body.style.overscrollBehaviorY = 'auto';
      
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
      <PullToRefreshIndicator />
      <main className="pb-20">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default NavigationWrapper;