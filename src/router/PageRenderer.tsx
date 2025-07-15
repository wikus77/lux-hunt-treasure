// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ Page Renderer - iOS Capacitor Compatible Layout Manager

import React from 'react';
import { useNavigationStore } from '@/stores/navigationStore';
import { useAuth } from '@/hooks/use-auth';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { detectCapacitorEnvironment } from '@/utils/capacitor';

interface PageRendererProps {
  children: React.ReactNode;
}

const PageRenderer: React.FC<PageRendererProps> = ({ children }) => {
  const { currentTab } = useNavigationStore();
  const { isAuthenticated } = useAuth();
  const isCapacitor = detectCapacitorEnvironment();

  console.log('🎨 PageRenderer render:', {
    currentTab,
    isAuthenticated,
    isCapacitor
  });

  // Routes that should hide navigation completely
  const hideNavigationRoutes = [
    '/',
    '/login',
    '/register',
    '/auth',
    '/kyc',
    '/verification',
    '/select-mission',
    '/legal/terms',
    '/legal/privacy',
    '/legal/safecreative',
    '/privacy-policy',
    '/terms',
    '/how-it-works',
    '/contacts'
  ];

  // Routes that should use full screen layout (no header padding)
  const fullScreenRoutes = [
    '/map',
    '/buzz',
    '/games'
  ];

  const shouldHideNavigation = hideNavigationRoutes.includes(currentTab);
  const isFullScreen = fullScreenRoutes.includes(currentTab);
  const shouldShowNavigation = isAuthenticated && !shouldHideNavigation;

  // Landing and auth pages - minimal layout
  if (shouldHideNavigation) {
    return (
      <div className="relative min-h-screen">
        {children}
      </div>
    );
  }

  // Full screen pages (map, buzz, games) - no header padding but with nav
  if (isFullScreen && shouldShowNavigation) {
    return (
      <div className="relative min-h-screen">
        {/* Single UnifiedHeader */}
        <UnifiedHeader />
        
        {/* Main content without padding */}
        <main className="relative z-10">
          {children}
        </main>
        
        {/* Single BottomNavigation */}
        <BottomNavigation />
      </div>
    );
  }

  // Standard app pages - with header padding and nav
  if (shouldShowNavigation) {
    return (
      <div className="relative min-h-screen">
        {/* Single UnifiedHeader */}
        <UnifiedHeader />
        
        {/* Main content with header padding */}
        <main 
          className="relative z-10 pt-[119px] pb-20"
          style={{
            minHeight: 'calc(100vh - 119px - 80px)', // Account for header and bottom nav
            paddingTop: isCapacitor ? 'calc(119px + env(safe-area-inset-top, 0px))' : '119px'
          }}
        >
          {children}
        </main>
        
        {/* Single BottomNavigation */}
        <BottomNavigation />
      </div>
    );
  }

  // Fallback - no navigation
  return (
    <div className="relative min-h-screen">
      {children}
    </div>
  );
};

export default PageRenderer;