// M1SSION™ - Enhanced Global Layout with Safe Area Integration
import React from "react";
import { useLocation } from "wouter";
import { SafeAreaWrapper } from "./SafeAreaWrapper";
import UnifiedHeader from "./UnifiedHeader";
import BottomNavigation from "./BottomNavigation";
import { detectPWAEnvironment } from "@/utils/pwaStubs";
// CookieBanner RIMOSSO - gestito centralmente da CookieConsentManager in App.tsx

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
  
  // Routes that manage their own layout completely (no header/nav from GlobalLayout)
  const selfManagedRoutes: string[] = [];
  
  const shouldHideNavigation = hideNavigationRoutes.includes(location);
  const isFullScreen = fullScreenRoutes.includes(location);
  const isSelfManaged = selfManagedRoutes.includes(location);
  
  // Debug logs only in development
  if (import.meta.env.DEV) {
    console.log('🏗️ GlobalLayout:', {
      path: location,
      shouldHideNavigation,
      isFullScreen,
      isSelfManaged,
      isCapacitor
    });
  }

  // Landing and auth pages - minimal layout
  if (shouldHideNavigation) {
    return (
      <SafeAreaWrapper className="min-h-screen">
        {children}
      </SafeAreaWrapper>
    );
  }

  // Self-managed pages (notifications) - they handle their own header/nav
  if (isSelfManaged) {
    return <>{children}</>;
  }

  // Full screen pages (map, buzz, games) - no header padding
  // 🔧 FIX v2: iOS overscroll containment applied
  if (isFullScreen) {
    return (
      <SafeAreaWrapper className="min-h-screen">
        <div 
          className="relative"
          style={{
            height: '100dvh',
            overflow: 'hidden',
            position: 'relative',
            overscrollBehavior: 'none',
          }}
        >
          {/* Header - always visible */}
          <UnifiedHeader />
          
          {/* Main content - INSTANT RENDER */}
          <main 
            key={location} 
            className="relative global-layout-content"
            style={{
              height: '100dvh',
              overflowY: 'auto',
              overflowX: 'hidden',
              position: 'relative',
              zIndex: 0,
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
            }}
          >
            {children}
          </main>
          
          {/* Bottom Navigation - wrapped for keyboard hide (iOS PWA) */}
          <div id="m1-bottom-nav">
            <BottomNavigation />
          </div>
        </div>
      </SafeAreaWrapper>
    );
  }

  // Standard app pages - with header padding
  // 🔧 FIX v2: iOS overscroll containment applied at layout level
  return (
    <SafeAreaWrapper className="min-h-screen">
      <div 
        className="relative has-bottom-nav-padding"
        style={{
          height: '100dvh',
          overflow: 'hidden',
          position: 'relative',
          overscrollBehavior: 'none',
        }}
      >
        {/* Header - always visible, no transition */}
        <UnifiedHeader />
        
        {/* Main content with header padding - INSTANT RENDER */}
        <main 
          key={location} // Force remount on route change for clean transition
          className="relative pt-[80px] pb-20 global-layout-content"
          style={{
            // 🔧 FIX v3: Use calc for exact height, NO overflow auto at this level
            height: 'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
            paddingTop: isCapacitor ? 'calc(80px + env(safe-area-inset-top, 0px))' : '80px',
            overflow: 'hidden', // 🔧 CRITICAL: No scroll here - pages manage their own
            position: 'relative',
            zIndex: 0,
            overscrollBehavior: 'none', // Block bounce completely
          }}
        >
          {children}
        </main>
        
        {/* Bottom Navigation - wrapped for keyboard hide (iOS PWA) */}
        <div id="m1-bottom-nav">
          <BottomNavigation />
        </div>
      </div>
    </SafeAreaWrapper>
  );
};

export default GlobalLayout;