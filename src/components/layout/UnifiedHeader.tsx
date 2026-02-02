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
import { SettingsModal } from "@/components/settings/SettingsModal";

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
  // Debug logs only in development
  if (import.meta.env.DEV) console.log("✅ M1SSION™ UnifiedHeader component rendering");
  
  // 🛡️ SINGLE-MOUNT GUARD: Prevent duplicate header instances
  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current && import.meta.env.DEV) {
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
  const isHomeRoute = location === '/home';
  const isBuzzRoute = location === '/buzz';
  const { shouldHideHeader: windowHide } = useScrollDirection(50);
  const [mapHide, setMapHide] = useState(false);
  const [homeHide, setHomeHide] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsOriginRect, setSettingsOriginRect] = useState<DOMRect | null>(null);
  
  // 🛡️ BUZZ ROUTE GUARD: Disable scroll-hide on /buzz to prevent freeze
  const hideHeader = isBuzzRoute ? false : (isMapRoute ? mapHide : (isHomeRoute ? homeHide : windowHide));

  // 🛡️ HOME SCROLL-HIDE: Scroll position based (più affidabile)
  useEffect(() => {
    if (!isHomeRoute || disableScrollHide) return;
    
    let lastScrollY = 0;
    let ticking = false;
    
    const updateHeader = () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
      
      // Solo se abbiamo scrollato abbastanza
      if (Math.abs(currentScrollY - lastScrollY) > 5) {
        if (currentScrollY > lastScrollY && currentScrollY > 80) {
          // Scrolling DOWN = nascondi header
          setHomeHide(true);
        } else if (currentScrollY < lastScrollY) {
          // Scrolling UP = mostra header
          setHomeHide(false);
        }
        lastScrollY = currentScrollY;
      }
      ticking = false;
    };
    
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };
    
    // Touch fallback per iOS dove scroll potrebbe non triggare
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY || 0;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0]?.clientY || 0;
      const diff = touchStartY - touchEndY;
      if (diff > 60) setHomeHide(true);
      else if (diff < -60) setHomeHide(false);
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    document.body.addEventListener('touchstart', onTouchStart, { passive: true });
    document.body.addEventListener('touchend', onTouchEnd, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.body.removeEventListener('touchstart', onTouchStart);
      document.body.removeEventListener('touchend', onTouchEnd);
    };
  }, [isHomeRoute, disableScrollHide]);

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
      // M1SSION™ WRAP FIX: Improved Capacitor environment detection
      const cap = (window as any).Capacitor;
      const isCapacitorApp = !!(
        cap?.isNativePlatform?.() ||
        ['ios', 'android'].includes(cap?.getPlatform?.() || '') ||
        window.location.protocol === 'capacitor:'
      );
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
    const cap = (window as any).Capacitor;
    const isCapacitorApp = !!(cap?.isNativePlatform?.() || ['ios', 'android'].includes(cap?.getPlatform?.() || ''));
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
  const bottomNavPages = ['/', '/home', '/map', '/buzz', '/games', '/notifications', '/leaderboard', '/intelligence', '/map-3d-tiler', '/forum'];
  const isBottomNavPage = bottomNavPages.includes(location);
  const isMap = location === '/map';

  return (
    <>
      <MinimalHeaderStrip show={false}>
        {/* Hidden - Legacy support */}
      </MinimalHeaderStrip>
      
      {/* 🆕 NEW HEADER LAYOUT - No background pill, transparent with floating elements */}
      <motion.div
        className="unified-header-wrapper"
        initial={{ y: 0 }}
        animate={{ y: hideHeader ? -120 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          // M1SSION™ WRAP FIX: Use safe-area for both PWA and Capacitor native
          paddingTop: (isPWA || isCapacitor) ? 'calc(env(safe-area-inset-top, 0px) + 12px)' : '16px',
          paddingLeft: '16px',
          paddingRight: '16px',
          pointerEvents: 'none',
          // 🔧 PWA FIX: GPU layer promotion per stabilità durante scroll
          backfaceVisibility: 'hidden',
          WebkitBackdropVisibility: 'hidden',
        }}
      >
        {/* TOP ROW - Profile + Settings (right side) */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'auto',
          }}
        >
          {/* Settings - Glass Pill */}
          <motion.button
            onClick={(e) => {
              hapticLight();
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setSettingsOriginRect(rect);
              setIsSettingsModalOpen(true);
            }}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '22px',
              background: 'rgba(15, 20, 30, 0.6)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
              }}
              transition={{ 
                rotate: { duration: reduceAnimations ? 1.6 : 12, repeat: reduceAnimations ? 0 : Infinity, ease: "linear" },
              }}
              style={{
                filter: "drop-shadow(0 0 8px rgba(0, 209, 255, 0.5))"
              }}
            >
              <Settings className="w-5 h-5 text-[#00D1FF]" />
            </motion.div>
          </motion.button>

          {/* Profile Avatar */}
          <ProfileDropdown
            profileImage={currentProfileImage}
            className="cursor-pointer"
          />
        </div>
      </motion.div>
      
      {/* Settings Modal - FULLSCREEN con animazione FLIP */}
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)}
        originRect={settingsOriginRect}
      />
    </>
  );
};

export default UnifiedHeader;