// M1SSION™ - Enhanced Global Layout with Safe Area Integration
import React from "react";
import { useLocation } from "wouter";
import { SafeAreaWrapper } from "./SafeAreaWrapper";
import UnifiedHeader from "./UnifiedHeader";
import BottomNavigation from "./BottomNavigation";
import { detectCapacitorEnvironment } from "@/utils/iosCapacitorFunctions";

interface GlobalLayoutProps {
  children: React.ReactNode;
}

/**
 * Enhanced GlobalLayout with automatic layout detection and safe area handling
 */
const GlobalLayout: React.FC<GlobalLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const isCapacitor = detectCapacitorEnvironment();
  
  // Routes that should hide navigation
  const hideNavigationRoutes = [
    '/',
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
      <SafeAreaWrapper className="min-h-screen bg-gradient-to-br from-black via-[#0B1426] to-[#1a1a2e]">
        {children}
      </SafeAreaWrapper>
    );
  }

  // Full screen pages (map, buzz, games) - no header padding
  if (isFullScreen) {
    return (
      <SafeAreaWrapper className="min-h-screen bg-gradient-to-br from-black via-[#0B1426] to-[#1a1a2e]">
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
    <SafeAreaWrapper className="min-h-screen bg-gradient-to-br from-black via-[#0B1426] to-[#1a1a2e]">
      <div className="relative min-h-screen">
        {/* Header */}
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
        
        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </SafeAreaWrapper>
  );
};

export default GlobalLayout;