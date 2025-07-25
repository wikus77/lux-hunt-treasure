// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useEffect } from 'react';
import BottomNavigation from './BottomNavigation';

interface NavigationWrapperProps {
  children: React.ReactNode;
}

const NavigationWrapper: React.FC<NavigationWrapperProps> = ({ children }) => {
  useEffect(() => {
    const handleOrientationChange = () => {
      // Force a re-render after orientation change
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };

    if (typeof window !== 'undefined') {
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