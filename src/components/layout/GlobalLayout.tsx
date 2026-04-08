// M1SSION™ - Enhanced Global Layout with Safe Area Integration
// © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
// 
// FIX v3: Use --app-height instead of 100vh/100dvh for iOS WKWebView compatibility
// FIX v8: Capacitor iOS - AppDelegate handles header offset via body padding
//         CSS overrides neutralize redundant main padding and element margin

import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { SafeAreaWrapper } from "./SafeAreaWrapper";
import UnifiedHeader from "./UnifiedHeader";
import BottomNavigation from "./BottomNavigation";
import { detectPWAEnvironment } from "@/utils/pwaStubs";
import { initViewportHeight, updateAppHeight } from "@/utils/viewportHeight";
// 🔧 FIX 22/01/2026: Removed KeyboardAccessoryBar - user wants NO toolbar/accessory bar
// import KeyboardAccessoryBar from "@/components/keyboard/KeyboardAccessoryBar";

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
  /** Capacitor native Home: single-screen, no vertical scroll / rubber-band on main (WKWebView). */
  const isAppHomePath = location === '/' || location === '/home';
  const lockAppHomeScroll = isAppHomePath && isCapacitor;
  
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
  // 🔧 FIX v6 (22/01/2026): AION-LIKE PATTERN - content scrolls UNDER header
  // No paddingTop on <main> - content starts at top:0 and scrolls behind glass header
  if (isFullScreen) {
    return (
      <SafeAreaWrapper className="min-h-screen">
        {/* Header - fixed position with glass effect, content scrolls behind it */}
        <UnifiedHeader />
        
        {/* Main content - SCROLLS UNDER HEADER (AION-like) */}
        <main 
          key={location} 
          className={`relative global-layout-content m1-single-scroll-root m1-scroll-under-header${lockAppHomeScroll ? ' overscroll-y-none' : ''}`}
          style={{
            ...(lockAppHomeScroll
              ? {
                  height: 'var(--app-height, 100dvh)',
                  maxHeight: 'var(--app-height, 100dvh)',
                  minHeight: 0,
                  overflowY: 'hidden',
                  overflowX: 'hidden',
                  overscrollBehaviorY: 'none',
                  WebkitOverflowScrolling: 'auto',
                }
              : {
                  minHeight: 'var(--app-height, 100dvh)',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  overscrollBehavior: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'pan-y',
                }),
            // 🔧 FIX v6: NO paddingTop - content scrolls under the glass header
            paddingTop: 0,
            paddingBottom: isCapacitor ? 'calc(64px + env(safe-area-inset-bottom, 0px))' : '64px',
            position: 'relative',
            zIndex: 0,
          }}
        >
          {children}
        </main>
        
        {/* Bottom Navigation - wrapped for keyboard hide (iOS PWA) */}
        <div id="m1-bottom-nav">
          <BottomNavigation />
        </div>
      </SafeAreaWrapper>
    );
  }

  // Standard app pages - AION-like scroll under header
  // 🔧 FIX v6 (22/01/2026): AION-LIKE PATTERN - content scrolls UNDER header
  // No global paddingTop - each page handles its first-element margin
  return (
    <SafeAreaWrapper className="min-h-screen">
      {/* Header - fixed position with glass effect, content scrolls behind it */}
      <UnifiedHeader />
      
      {/* Main content - SCROLLS UNDER HEADER (AION-like) */}
      <main 
        key={location}
        className={`relative global-layout-content has-bottom-nav-padding m1-single-scroll-root m1-scroll-under-header${lockAppHomeScroll ? ' overscroll-y-none' : ''}`}
        style={{
          ...(lockAppHomeScroll
            ? {
                height: 'var(--app-height, 100dvh)',
                maxHeight: 'var(--app-height, 100dvh)',
                minHeight: 0,
                overflowY: 'hidden',
                overflowX: 'hidden',
                overscrollBehaviorY: 'none',
                WebkitOverflowScrolling: 'auto',
              }
            : {
                minHeight: 'var(--app-height, 100dvh)',
                overflowY: 'auto',
                overflowX: 'hidden',
                overscrollBehavior: 'auto',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
              }),
          paddingTop: 0,
          paddingBottom: isCapacitor ? 'calc(64px + env(safe-area-inset-bottom, 0px))' : '64px',
          position: 'relative',
          zIndex: 0,
        }}
      >
        {children}
      </main>
      
      {/* Bottom Navigation - wrapped for keyboard hide (iOS PWA) */}
      <div id="m1-bottom-nav">
        <BottomNavigation />
      </div>
    </SafeAreaWrapper>
  );
};

export default GlobalLayout;