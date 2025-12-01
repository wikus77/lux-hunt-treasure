// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { Link, useLocation } from "wouter";
import { Settings, ArrowLeft } from "lucide-react";
import { hapticLight } from "@/utils/haptics";
import { Button } from "@/components/ui/button";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import ProfileDropdown from "@/components/profile/ProfileDropdown";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useEnhancedNavigation } from "@/hooks/useEnhancedNavigation";
import { useProfileImage } from "@/hooks/useProfileImage";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { supabase } from "@/integrations/supabase/client";
import ReferralCodeDisplay from "@/components/layout/header/ReferralCodeDisplay";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import MinimalHeaderStrip from "@/components/layout/MinimalHeaderStrip";

interface UnifiedHeaderProps {
  profileImage?: string | null;
  leftComponent?: React.ReactNode;
  onClickMail?: () => void;
  disableScrollHide?: boolean; // Guard: disable scroll-hide listeners on /buzz
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
  onClickMail,
  disableScrollHide = false
}) => {
  console.log("✅ M1SSION™ UnifiedHeader component rendering");
  
  // 🛡️ SINGLE-MOUNT GUARD: Prevent duplicate header instances
  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) {
      console.warn('⚠️ UnifiedHeader: Multiple mounts detected, cleaning up duplicates');
    }
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);
  
  const [location] = useLocation();
  const { unreadCount, openNotificationsDrawer } = useNotificationManager();
  const { goBackWithFeedback, canGoBack } = useEnhancedNavigation();
  const { profileImage } = useProfileImage();
  const { user } = useUnifiedAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [isCapacitor, setIsCapacitor] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const isMapRoute = location === '/map' || location.startsWith('/map/');
  const isBuzzRoute = location === '/buzz';
  const { shouldHideHeader: windowHide } = useScrollDirection(50);
  const [mapHide, setMapHide] = useState(false);
  
  // 🛡️ BUZZ ROUTE GUARD: Disable scroll-hide on /buzz to prevent freeze
  const hideHeader = isBuzzRoute ? false : (isMapRoute ? mapHide : windowHide);

  // 🛡️ SCROLL-HIDE LISTENERS: Only active on /map route, disabled on /buzz to prevent freeze
  useEffect(() => {
    // Guard: Skip listener setup on /buzz or if explicitly disabled
    if (!isMapRoute || disableScrollHide || isBuzzRoute) return;
    
    const el = document.querySelector('#map-scroll-container') as HTMLElement | null;
    if (!el) return;

    const onScroll = () => setMapHide(el.scrollTop > 10);
    el.addEventListener('scroll', onScroll, { passive: true });

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) setMapHide(true);
      if (e.deltaY < 0 && el.scrollTop <= 0) setMapHide(false);
    };
    el.addEventListener('wheel', onWheel, { passive: true, capture: true });

    let touchStartY: number | null = null;
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0]?.clientY ?? null; };
    const onTouchMove = (e: TouchEvent) => {
      if (touchStartY == null) return;
      const currentY = e.touches[0]?.clientY ?? touchStartY;
      const deltaY = touchStartY - currentY;
      if (deltaY > 0) setMapHide(true);
      if (deltaY < 0 && el.scrollTop <= 0) setMapHide(false);
      touchStartY = currentY;
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true, capture: true });

    const leaflet = document.querySelector('.leaflet-container') as HTMLElement | null;
    if (leaflet) {
      leaflet.addEventListener('wheel', onWheel, { passive: true, capture: true });
      leaflet.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
      leaflet.addEventListener('touchmove', onTouchMove, { passive: true, capture: true });
    }

    return () => {
      el.removeEventListener('scroll', onScroll as any);
      el.removeEventListener('wheel', onWheel as any);
      el.removeEventListener('touchstart', onTouchStart as any);
      el.removeEventListener('touchmove', onTouchMove as any);
      if (leaflet) {
        leaflet.removeEventListener('wheel', onWheel as any);
        leaflet.removeEventListener('touchstart', onTouchStart as any);
        leaflet.removeEventListener('touchmove', onTouchMove as any);
      }
    };
  }, [isMapRoute, location, disableScrollHide, isBuzzRoute]);

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
  const reduceAnimations = location === '/profile' || location === '/settings/agent-profile';
  
  // ✅ BY JOSEPH MULÈ — CEO di NIYVORA KFT - Pages that should NOT show back arrow 
  const bottomNavPages = ['/', '/home', '/map', '/buzz', '/games', '/notifications', '/leaderboard', '/intelligence', '/map-3d-tiler'];
  const isBottomNavPage = bottomNavPages.includes(location);
  const isMap = location === '/map';

  return (
    <>
      <MinimalHeaderStrip show={false}>
        {/* Center section - Agent Code Vertical Layout - © 2025 Joseph MULÉ – M1SSION™ */}
        <div className="flex flex-col items-center gap-1">
          {/* CODE con pallino pulsante */}
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 bg-[#00D1FF] rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 1.6,
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
      </MinimalHeaderStrip>
      {/* FLOATING PILL HEADER - Same style as bottom nav */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'flex',
          justifyContent: 'center',
          paddingTop: isPWA ? 'calc(env(safe-area-inset-top, 0px) + 12px)' : '16px',
          paddingLeft: '16px',
          paddingRight: '16px',
          pointerEvents: 'none',
        }}
      >
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{
          width: '100%',
          maxWidth: '600px',
          height: '64px',
          background: 'linear-gradient(180deg, #2A3441 0%, #1E2630 100%)',
          borderRadius: '32px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.05)',
          pointerEvents: 'auto',
          position: 'relative',
          isolation: 'isolate',
        }}
      >
        {/* Hidden background div for compatibility */}
        <div className="hidden" />
        <div className="h-full w-full relative">
          {/* Main Header Row */}
          <div className="flex items-center justify-between h-full px-4 sm:px-6 relative">
            {/* Left Section */}
            <motion.div className="flex items-center" animate={{ opacity: hideHeader ? 0 : 1 }} transition={{ duration: 0.3 }}>
              {leftComponent ? (
                leftComponent
              ) : (
                <div className="flex items-center">
                  {/* Back Button - 🚀 NATIVE: Più grande e tappabile */}
                  {!isHomePage && !isBottomNavPage && canGoBack && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { hapticLight(); goBackWithFeedback(); }}
                      className="mr-2 rounded-xl hover:bg-white/10 unified-header-btn w-11 h-11 m1-touch-feedback"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </Button>
                  )}
                  
                  <Link
                    to="/home"
                    className="text-2xl sm:text-[1.75rem] font-orbitron font-bold m1ssion-logo m1-text-glow"
                  >
                    <span className="text-[#00D1FF]" style={{ 
                      textShadow: "0 0 12px rgba(0, 209, 255, 0.7), 0 0 24px rgba(0, 209, 255, 0.4)"
                    }}>M1</span>
                    <span className="text-white">SSION<span className="text-[10px] align-top ml-0.5">™</span></span>
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Center section - Agent Code Vertical Layout - 🚀 NATIVE: Badge più visibile */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
              {/* CODE con pallino pulsante */}
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2.5 h-2.5 bg-[#00D1FF] rounded-full m1-glow-pulse"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: reduceAnimations ? 0 : Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    boxShadow: "0 0 10px rgba(0, 209, 255, 0.7), 0 0 20px rgba(0, 209, 255, 0.5)"
                  }}
                />
                <span 
                  className="text-[11px] font-orbitron font-bold text-white tracking-widest"
                  style={{
                    textShadow: "0 0 12px rgba(0, 209, 255, 0.7), 0 0 24px rgba(0, 209, 255, 0.4)"
                  }}
                >
                  CODE
                </span>
              </div>
              {/* Codice Agente sotto */}
              <ReferralCodeDisplay />
            </div>

            {/* Right Section */}
            <motion.div className="flex items-center space-x-1 sm:space-x-3" animate={{ opacity: hideHeader ? 0 : 1 }} transition={{ duration: 0.3 }}>
              {/* Settings - 🚀 NATIVE: Pulsante più grande */}
              <Link to="/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl hover:bg-white/10 unified-header-btn w-11 h-11 m1-touch-feedback"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.08, 1]
                    }}
                    transition={{ 
                      rotate: { duration: reduceAnimations ? 1.6 : 8, repeat: reduceAnimations ? 0 : Infinity, ease: "linear" },
                      scale: { duration: reduceAnimations ? 1.2 : 4, repeat: reduceAnimations ? 0 : Infinity, ease: "easeInOut" }
                    }}
                    style={{
                      filter: "drop-shadow(0 0 10px rgba(0, 209, 255, 0.5))"
                    }}
                  >
                    <Settings className="w-6 h-6 text-[#00D1FF]" />
                  </motion.div>
                </Button>
              </Link>

              {/* Profile Dropdown - 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™ */}
              <ProfileDropdown
                profileImage={currentProfileImage}
                className="cursor-pointer"
              />
            </motion.div>
          </div>

        </div>
      </motion.header>
      </div>
    </>
  );
};

export default UnifiedHeader;