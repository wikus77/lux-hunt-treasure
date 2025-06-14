
import { Link } from "react-router-dom";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface UnifiedHeaderProps {
  profileImage?: string | null;
  leftComponent?: React.ReactNode;
  onClickMail?: () => void;
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  profileImage,
  leftComponent,
  onClickMail,
}) => {
  const { unreadCount, openNotificationsDrawer } = useNotificationManager();
  const [hasAccess, setHasAccess] = useState(false);
  const [isCapacitor, setIsCapacitor] = useState(false);

  // Enhanced access check with iOS persistence support
  useEffect(() => {
    const checkAccess = () => {
      // Detect Capacitor environment
      const isCapacitorApp = !!(window as any).Capacitor;
      setIsCapacitor(isCapacitorApp);
      
      // Enhanced mobile detection including Capacitor
      const userAgent = navigator.userAgent;
      const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent) || isCapacitorApp;
      
      // iOS-specific access checks
      const hasStoredAccess = localStorage.getItem('developer_access_granted') === 'true' || 
                              localStorage.getItem('hasStoredAccess') === 'true';
      const isDeveloperUser = localStorage.getItem('developer_user_email') === 'wikus77@hotmail.it' ||
                              localStorage.getItem('ios_user_email') === 'wikus77@hotmail.it';
      const hasIosSession = localStorage.getItem('ios_session_token');
      const hasUnlimitedAccess = localStorage.getItem('unlimited_access') === 'true';
      
      console.log('🍎 UnifiedHeader iOS access check:', { 
        isMobile, 
        hasStoredAccess, 
        isCapacitorApp, 
        isDeveloperUser,
        hasIosSession: !!hasIosSession,
        hasUnlimitedAccess
      });
      
      // DEVELOPER ACCESS: Grant unlimited access if developer credentials are stored
      if (isDeveloperUser || hasUnlimitedAccess) {
        console.log('🎯 Developer access granted via iOS persistence');
        setHasAccess(true);
        localStorage.setItem('unlimited_access', 'true');
        localStorage.setItem('bypass_all_restrictions', 'true');
      } else if (isMobile && (hasStoredAccess || hasIosSession)) {
        console.log('📱 Mobile access granted via stored session');
        setHasAccess(true);
      } else if (!isMobile) {
        // Web users can't access profile functionality
        setHasAccess(false);
      } else {
        // Mobile without access - should trigger developer login
        console.log('❌ No access found for mobile user');
        setHasAccess(false);
      }
    };
    
    checkAccess();
    
    // Re-check periodically for iOS session updates
    const interval = setInterval(checkAccess, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleProfileClick = () => {
    const isCapacitorApp = !!(window as any).Capacitor;
    const userAgent = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent) || isCapacitorApp;
    const hasStoredAccess = localStorage.getItem('developer_access_granted') === 'true';
    const isDeveloperUser = localStorage.getItem('developer_user_email') === 'wikus77@hotmail.it';
    
    console.log('🍎 Profile click - iOS check:', { isMobile, hasStoredAccess, isCapacitorApp, isDeveloperUser });
    
    if (!isDeveloperUser && isMobile && !hasStoredAccess) {
      // Clear any existing access and reload to trigger login
      localStorage.removeItem('developer_access_granted');
      localStorage.removeItem('developer_user_email');
      localStorage.removeItem('unlimited_access');
      localStorage.removeItem('ios_session_token');
      console.log('🔄 Triggering developer login for iOS');
      window.location.reload();
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed left-0 right-0 z-50 glass-backdrop backdrop-blur-xl bg-gradient-to-r from-black/70 via-[#131524]/70 to-black/70"
      style={{ 
        // CRITICAL FIX: Position header below the safe zone
        top: 'calc(47px + env(safe-area-inset-top, 0px))', // 47px fixed + env fallback
        paddingTop: '0px',
        marginTop: '0px'
      }}
    >
      <div className="container mx-auto h-full max-w-screen-xl">
        <div className="flex items-center justify-between h-[72px] px-3 sm:px-4">
          {/* Left Section */}
          <div className="flex items-center">
            {leftComponent ? (
              leftComponent
            ) : (
              <Link
                to="/home"
                className="text-xl sm:text-2xl font-orbitron font-bold"
              >
                <span className="text-[#00D1FF]" style={{ 
                  textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
                }}>M1</span>
                <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
              </Link>
            )}
          </div>

          {/* Center section - removed M1-AGENT badge */}
          <div className="flex items-center justify-center">
            {/* Empty center area */}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Notifications - Enable for developer or web users */}
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

            {/* Settings - Enable for developer */}
            {hasAccess ? (
              <Link to="/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-white/10"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-white/10"
                disabled
              >
                <Settings className="w-5 h-5" />
              </Button>
            )}

            {/* Profile Avatar - ALWAYS CLICKABLE for developer access */}
            {hasAccess ? (
              <Link to="/profile">
                <ProfileAvatar
                  profileImage={profileImage}
                  className="w-10 h-10 border-2 border-[#00D1FF]/30 hover:border-[#00D1FF] transition-colors cursor-pointer"
                />
              </Link>
            ) : (
              <div onClick={handleProfileClick} className="cursor-pointer">
                <ProfileAvatar
                  profileImage={profileImage}
                  className="w-10 h-10 border-2 border-[#00D1FF]/30 hover:border-[#00D1FF] transition-colors"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default UnifiedHeader;
