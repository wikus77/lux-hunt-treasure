// © 2025 Joseph MULÉ – M1SSION™
import { Link } from "wouter";
import { useLocation } from "wouter";
import { Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import ProfileDropdown from "@/components/profile/ProfileDropdown";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useEnhancedNavigation } from "@/hooks/useEnhancedNavigation";
import { useProfileImage } from "@/hooks/useProfileImage";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { supabase } from "@/integrations/supabase/client";
import ReferralCodeDisplay from "@/components/layout/header/ReferralCodeDisplay";

interface UnifiedHeaderProps {
  profileImage?: string | null;
  leftComponent?: React.ReactNode;
  onClickMail?: () => void;
}

// Page title mapping - MISSION text only - BY JOSEPH MULE
const pageTitles: Record<string, string> = {
  '/home': 'MISSION',
  '/map': 'MISSION',
  '/buzz': 'MISSION',
  '/games': 'MISSION',
  '/leaderboard': 'MISSION',
  '/notifications': 'MISSION',
  '/profile': 'MISSION',
  '/settings': 'MISSION'
};

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  profileImage: propProfileImage,
  leftComponent,
  onClickMail
}) => {
  console.log("✅ M1SSION™ UnifiedHeader component rendering");
  const [location] = useLocation();
  const { unreadCount, openNotificationsDrawer } = useNotificationManager();
  const { goBackWithFeedback, canGoBack } = useEnhancedNavigation();
  const { profileImage } = useProfileImage();
  const { user } = useUnifiedAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [isCapacitor, setIsCapacitor] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  // Use profile image from hook or fallback to prop
  const currentProfileImage = profileImage || propProfileImage;

  // Check for Capacitor environment and device type
  useEffect(() => {
    // Detect PWA mode
    const isPWAMode = window.matchMedia('(display-mode: standalone)').matches;
    setIsPWA(isPWAMode);
    const checkAccess = async () => {
      // Detect Capacitor environment
      const isCapacitorApp = !!(window as any).Capacitor;
      setIsCapacitor(isCapacitorApp);
      
      // Enhanced mobile detection including Capacitor
      const userAgent = navigator.userAgent;
      const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent) || isCapacitorApp;
      const hasStoredAccess = localStorage.getItem('developer_access') === 'granted';
      
      let isDeveloperUser = false;
      // Use secure admin check instead of hardcoded email
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        isDeveloperUser = profile?.role === 'admin';
      }
      
      console.log('UnifiedHeader access check:', { isMobile, hasStoredAccess, isCapacitorApp, isDeveloperUser });
      
      // DEVELOPER ACCESS: Grant unlimited access if developer credentials are stored
      if (isDeveloperUser) {
        setHasAccess(true);
        localStorage.setItem('unlimited_access', 'true');
        localStorage.setItem('bypass_all_restrictions', 'true');
      } else if (isMobile && hasStoredAccess) {
        setHasAccess(true);
      } else if (!isMobile) {
        // Web users can't access profile functionality
        setHasAccess(false);
      } else {
        // Mobile without access - should trigger developer login
        setHasAccess(false);
      }
    };
    
    checkAccess();
  }, [user]);

  const handleProfileClick = async () => {
    const isCapacitorApp = !!(window as any).Capacitor;
    const userAgent = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent) || isCapacitorApp;
    const hasStoredAccess = localStorage.getItem('developer_access') === 'granted';
    
    let isDeveloperUser = false;
    // Use secure admin check instead of hardcoded email
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      isDeveloperUser = profile?.role === 'admin';
    }
    
    console.log('Profile click - Capacitor:', { isMobile, hasStoredAccess, isCapacitorApp, isDeveloperUser });
    
    if (!isDeveloperUser && isMobile && !hasStoredAccess) {
      localStorage.removeItem('developer_access');
      localStorage.removeItem('developer_user');
      localStorage.removeItem('full_access_granted');
      console.log('Triggering developer login for Capacitor');
      window.location.reload();
    }
  };

  const currentPageTitle = pageTitles[location] || 'M1SSION';
  const isHomePage = location === '/home';
  
  // ✅ BY JOSEPH MULÈ — CEO di NIYVORA KFT - Pages that should NOT show back arrow 
  const bottomNavPages = ['/map', '/buzz', '/games', '/notifications', '/leaderboard', '/intelligence'];
  const isBottomNavPage = bottomNavPages.includes(location);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed left-0 right-0 z-50 backdrop-blur-xl rounded-b-lg"
      style={{
        top: '0px',
        background: 'rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 209, 255, 0.2)',
        boxShadow: '0 4px 24px rgba(0, 209, 255, 0.15), 0 2px 12px rgba(0, 209, 255, 0.1), inset 0 -1px 0 rgba(0, 209, 255, 0.1)',
        paddingTop: isPWA ? 'max(env(safe-area-inset-top, 0px), 16px)' : 'max(env(safe-area-inset-top, 0px), 12px)',
        height: 'calc(72px + max(env(safe-area-inset-top, 0px), 8px))',
      }}
    >
      <div className="container mx-auto h-full max-w-screen-xl relative">
          {/* Main Header Row */}
          <div className="flex items-center justify-between h-[72px] px-3 sm:px-4 relative">
            {/* Left Section */}
            <div className="flex items-center">
              {leftComponent ? (
                leftComponent
              ) : (
                <div className="flex items-center">
                  {/* Back Button - Only show for non-home pages that aren't bottom nav pages */}
                  {!isHomePage && !isBottomNavPage && canGoBack && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => goBackWithFeedback()}
                      className="mr-2 rounded-full hover:bg-white/10"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  )}
                  
                  <Link
                    to="/home"
                    className="text-xl sm:text-2xl font-orbitron font-bold"
                  >
                    <span className="text-[#00D1FF]" style={{ 
                      textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
                    }}>M1</span>
                    <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
                  </Link>
                </div>
              )}
            </div>

            {/* Center section - Agent Code Vertical Layout - © 2025 Joseph MULÉ – M1SSION™ */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
              {/* CODE con pallino pulsante */}
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 bg-[#00D1FF] rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    boxShadow: "0 0 8px rgba(0, 209, 255, 0.6), 0 0 16px rgba(0, 209, 255, 0.4)"
                  }}
                />
                <span 
                  className="text-xs font-orbitron font-bold text-white tracking-wider"
                  style={{
                    textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
                  }}
                >
                  CODE
                </span>
              </div>
              {/* Codice Agente sotto */}
              <ReferralCodeDisplay />
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* Settings - Always accessible for authenticated users */}
              <Link to="/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-white/10"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                      scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(0, 209, 255, 0.4))"
                    }}
                  >
                    <Settings className="w-5 h-5 text-[#00D1FF]" />
                  </motion.div>
                </Button>
              </Link>

              {/* Profile Dropdown - 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™ */}
              <ProfileDropdown
                profileImage={currentProfileImage}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Animated color line at bottom of header - same as bottom navigation */}
          <div className="line-glow absolute bottom-0 left-0 w-full"></div>
        </div>
    </motion.header>
  );
};

export default UnifiedHeader;