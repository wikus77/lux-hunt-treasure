// M1SSION™ - Enhanced Global Layout with Safe Area Integration
// © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
// 
// FIX v3: Use --app-height instead of 100vh/100dvh for iOS WKWebView compatibility
// The 100vh bug in iOS causes content to be pushed under fixed elements

import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { SafeAreaWrapper } from "./SafeAreaWrapper";
import UnifiedHeader from "./UnifiedHeader";
import BottomNavigation from "./BottomNavigation";
import { detectPWAEnvironment } from "@/utils/pwaStubs";
import { initViewportHeight, updateAppHeight } from "@/utils/viewportHeight";

interface GlobalLayoutProps {
  children: React.ReactNode;
}

/**
 * Enhanced GlobalLayout with automatic layout detection and safe area handling
 * Uses --app-height CSS variable for iOS WKWebView compatibility
 */
const GlobalLayout: React.FC<GlobalLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const isCapacitor = detectPWAEnvironment();
  
  // Initialize viewport height tracking for iOS
  useEffect(() => {
    initViewportHeight();
    // Also update on mount in case values changed
    updateAppHeight();
  }, []);
  
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
  // 🔧 FIX v3: Use --app-height for iOS WKWebView compatibility
  if (isFullScreen) {
    return (
      <SafeAreaWrapper className="min-h-screen">
        <div 
          className="relative"
          style={{
            height: 'var(--app-height, 100dvh)',
            minHeight: 'var(--app-height, 100dvh)',
            maxHeight: 'var(--app-height, 100dvh)',
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
              height: 'var(--app-height, 100dvh)',
              paddingTop: isCapacitor ? 'calc(80px + env(safe-area-inset-top, 0px))' : '80px',
              paddingBottom: isCapacitor ? 'calc(64px + env(safe-area-inset-bottom, 0px))' : '64px',
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
  // 🔧 FIX v3: Use --app-height for iOS WKWebView compatibility
  // Removed duplicate className padding (pt-[80px]) - using only style.paddingTop
  return (
    <SafeAreaWrapper className="min-h-screen">
      <div 
        className="relative has-bottom-nav-padding"
        style={{
          height: 'var(--app-height, 100dvh)',
          minHeight: 'var(--app-height, 100dvh)',
          maxHeight: 'var(--app-height, 100dvh)',
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
          className="relative global-layout-content"
          style={{
            height: 'var(--app-height, 100dvh)',
            // M1SSION™ WRAP FIX: Correct padding for header + safe-area + bottom nav
            paddingTop: isCapacitor ? 'calc(80px + env(safe-area-inset-top, 0px))' : '80px',
            paddingBottom: isCapacitor ? 'calc(64px + env(safe-area-inset-bottom, 0px))' : '64px',
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
};

export default GlobalLayout;