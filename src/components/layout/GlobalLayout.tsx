// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ - Enhanced Global Layout with Safe Area Integration (Zustand Compatible)
import React from "react";
import { useNavigationStore } from "@/stores/navigationStore";
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
  const { currentPage } = useNavigationStore();
  const isCapacitor = detectCapacitorEnvironment();
  
  // Routes that should use different layouts
  const fullScreenRoutes = [
    '/map',
    '/buzz',
    '/games'
  ];
  
  const isFullScreen = fullScreenRoutes.includes(currentPage);
  
  console.log('🏗️ GlobalLayout:', {
    path: currentPage,
    isFullScreen,
    isCapacitor
  });

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