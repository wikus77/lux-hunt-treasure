// M1SSION™ - Enhanced Global Layout with Safe Area Integration
import React from "react";
import { useLocation } from "wouter";
import { SafeAreaWrapper } from "./SafeAreaWrapper";
import UnifiedHeader from "./UnifiedHeader";
import BottomNavigation from "./BottomNavigation";
import { detectPWAEnvironment } from "@/utils/pwaStubs";
import CookieBanner from "@/components/legal/CookieBanner";

interface GlobalLayoutProps {
  children: React.ReactNode;
}

/**
 * Enhanced GlobalLayout with automatic layout detection and safe area handling
 */
const GlobalLayout: React.FC<GlobalLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const isCapacitor = detectPWAEnvironment();
  
  // Routes that should hide navigation
  const hideNavigationRoutes = [
    '/login',
    '/register',
    '/auth',
    '/kyc',
    '/verification',
    '/select-mission'
  ];
  
  // Routes that should use different layouts
  const fullScreenRoutes = [
    '/map',
    '/buzz',
    '/games'
  ];
  
  const shouldHideNavigation = hideNavigationRoutes.includes(location);
  const isFullScreen = fullScreenRoutes.includes(location);
  
  console.log('🏗️ GlobalLayout:', {
    path: location,
    shouldHideNavigation,
    isFullScreen,
    isCapacitor
  });

  // Landing and auth pages - minimal layout
  if (shouldHideNavigation) {
    return (
      <SafeAreaWrapper className="min-h-screen">
        {children}
      </SafeAreaWrapper>
    );
  }

  // Full screen pages (map, buzz, games) - no header padding
  if (isFullScreen) {
    return (
      <SafeAreaWrapper className="min-h-screen">
        <div className="relative min-h-screen">
          {/* Header */}
          <UnifiedHeader />
          
          {/* Main content without padding */}
          <main className="relative z-10">
            {children}
          </main>
          
          {/* Bottom Navigation */}
          <BottomNavigation />
        </div>
      </SafeAreaWrapper>
    );
  }

  // Standard app pages - with header padding
  return (
    <SafeAreaWrapper className="min-h-screen">
      <div className="relative min-h-screen">
        {/* Header */}
        <UnifiedHeader />
        
        {/* Main content with header padding - REDUCED for tighter layout */}
        <main 
          className="relative z-10 pt-[80px] pb-20"
          style={{
            minHeight: 'calc(100vh - 80px - 80px)', // Account for header and bottom nav
            paddingTop: isCapacitor ? 'calc(80px + env(safe-area-inset-top, 0px))' : '80px'
          }}
        >
          {children}
        </main>
        
        {/* Bottom Navigation */}
        <BottomNavigation />
        
        {/* Cookie Banner */}
        <CookieBanner />
      </div>
    </SafeAreaWrapper>
  );
};

export default GlobalLayout;