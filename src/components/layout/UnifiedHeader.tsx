// © 2025 Joseph MULÉ – M1SSION™
import { Link } from "wouter";
import { useLocation } from "wouter";
import { Bell, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import ProfileDropdown from "@/components/profile/ProfileDropdown";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useEnhancedNavigation } from "@/hooks/useEnhancedNavigation";
import { useProfileImage } from "@/hooks/useProfileImage";
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
  const [location] = useLocation();
  const { unreadCount, openNotificationsDrawer } = useNotificationManager();
  const { goBackWithFeedback, canGoBack } = useEnhancedNavigation();
  const { profileImage } = useProfileImage();
  const [hasAccess, setHasAccess] = useState(false);

  // Use profile image from hook or fallback to prop
  const currentProfileImage = profileImage || propProfileImage;

  useEffect(() => {
    const checkAccess = () => {
      
      const userAgent = navigator.userAgent;
      const hasStoredAccess = localStorage.getItem('developer_access') === 'granted';
      const isDeveloperUser = localStorage.getItem('developer_user_email') === 'wikus77@hotmail.it';
      
      
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
  }, []);

  const handleProfileClick = () => {
    const userAgent = navigator.userAgent;
    const hasStoredAccess = localStorage.getItem('developer_access') === 'granted';
    const isDeveloperUser = localStorage.getItem('developer_user_email') === 'wikus77@hotmail.it';
    
    
    if (!isDeveloperUser && isMobile && !hasStoredAccess) {
      localStorage.removeItem('developer_access');
      localStorage.removeItem('developer_user');
      localStorage.removeItem('full_access_granted');
      window.location.reload();
    }
  };

  const currentPageTitle = pageTitles[location] || 'M1SSION';
  const isHomePage = location === '/home';
  
  // ✅ BY JOSEPH MULÈ — CEO di NIYVORA KFT - Pages that should NOT show back arrow 
  const bottomNavPages = ['/map', '/buzz', '/games', '/notifications', '/leaderboard'];
  const isBottomNavPage = bottomNavPages.includes(location);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed left-0 right-0 z-50 backdrop-blur-xl"
      style={{
        background: "rgba(19, 21, 33, 0.85)",
        backdropFilter: "blur(12px)",
        top: '0px',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        marginTop: '0px',
        height: 'calc(72px + env(safe-area-inset-top, 0px))',
        // Safe area background matches header
        backgroundImage: 'linear-gradient(rgba(19, 21, 33, 0.85) 0%, rgba(19, 21, 33, 0.85) 100%)'
      }}
    >
      <div className="container mx-auto h-full max-w-screen-xl">
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-[72px] px-3 sm:px-4">
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

          {/* Center section - Referral Code Display - © 2025 Joseph MULÉ – M1SSION™ */}
          <ReferralCodeDisplay />

          {/* Right Section */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClickMail || openNotificationsDrawer}
              className="relative rounded-full hover:bg-white/10"
              disabled={!hasAccess}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F059FF] rounded-full w-2 h-2"
                  style={{
                    boxShadow: "0 0 8px rgba(240, 89, 255, 0.5)"
                  }}
                ></span>
              )}
            </Button>

            {/* Settings - Always accessible for authenticated users */}
            <Link to="/settings">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-white/10"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </Link>

            {/* Profile Dropdown - 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™ */}
            <ProfileDropdown
              profileImage={currentProfileImage}
              className="cursor-pointer"
            />
          </div>
        </div>

      </div>
    </motion.header>
  );
};

export default UnifiedHeader;