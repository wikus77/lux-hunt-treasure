
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CommandCenterHome } from "@/components/command-center/CommandCenterHome";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfileImage } from "@/hooks/useProfileImage";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import { useDynamicIsland } from "@/hooks/useDynamicIsland";
import { useDynamicIslandSafety } from "@/hooks/useDynamicIslandSafety";
import { useMissionManager } from "@/hooks/useMissionManager";
import NotificationsBanner from "@/components/notifications/NotificationsBanner";
import { Helmet } from "react-helmet";
import { toast } from "sonner";
import BottomNavigation from "@/components/layout/BottomNavigation";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/auth";

const Home = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { profileImage } = useProfileImage();
  const isMobile = useIsMobile();
  const [hasAccess, setHasAccess] = useState(false);
  const [isCapacitor, setIsCapacitor] = useState(false);
  const { startActivity, updateActivity, endActivity } = useDynamicIsland();
  const { currentMission } = useMissionManager();
  const navigate = useNavigate();
  const { getCurrentUser, isAuthenticated } = useAuthContext();
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    deleteNotification,
    notificationsBannerOpen,
    openNotificationsBanner,
    closeNotificationsBanner
  } = useNotificationManager();

  const { isConnected } = useRealTimeNotifications();

  // Activate Dynamic Island safety system
  useDynamicIslandSafety();

  // Force redirect for developer email and Capacitor bypass
  useEffect(() => {
    const isCapacitorApp = !!(window as any).Capacitor;
    const user = getCurrentUser();
    
    // CAPACITOR DEVELOPER BYPASS: Always allow access if on Capacitor
    if (isCapacitorApp) {
      console.log("🔓 CAPACITOR DEVELOPER BYPASS: Auto-granting access on Capacitor platform");
      setHasAccess(true);
      setIsCapacitor(true);
      return;
    }
    
    if (user?.email === "wikus77@hotmail.it") {
      console.log("🔓 Developer access: force allowing wikus77@hotmail.it to access /home");
      setHasAccess(true);
      return;
    }

    if (isAuthenticated) {
      console.log("✅ User authenticated, allowing access to /home");
      setHasAccess(true);
      return;
    }

    // Redirect to auth if not authenticated and not developer and not on Capacitor
    if (!isAuthenticated && user?.email !== "wikus77@hotmail.it" && !isCapacitorApp) {
      console.log("❌ User not authenticated, redirecting to auth");
      navigate('/login');
      return;
    }
  }, [getCurrentUser, isAuthenticated, navigate]);

  // Check for developer access and Capacitor environment (for non-Capacitor apps)
  useEffect(() => {
    const checkAccess = () => {
      const isCapacitorApp = !!(window as any).Capacitor;
      setIsCapacitor(isCapacitorApp);
      
      // If Capacitor, access is already granted above
      if (isCapacitorApp) return;
      
      const user = getCurrentUser();
      const userAgent = navigator.userAgent;
      const isMobileDevice = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent);
      const hasStoredAccess = localStorage.getItem('developer_access') === 'granted';
      
      console.log('Home access check (non-Capacitor):', { 
        isMobileDevice, 
        hasStoredAccess, 
        isCapacitorApp, 
        userEmail: user?.email,
        isAuthenticated 
      });
      
      // Developer bypass for web
      if (user?.email === "wikus77@hotmail.it") {
        console.log("🔓 Developer bypass: granting access for wikus77@hotmail.it");
        setHasAccess(true);
        return;
      }
      
      if (isMobileDevice && hasStoredAccess) {
        setHasAccess(true);
      } else if (!isMobileDevice) {
        // Web users get redirected to landing page
        window.location.href = '/';
        return;
      }
    };
    
    checkAccess();
  }, [getCurrentUser, isAuthenticated]);

  // Dynamic Island integration for HOME - Active mission con logging avanzato
  useEffect(() => {
    if (hasAccess && isLoaded && currentMission && currentMission.status === 'active') {
      console.log('🏠 HOME: Starting Dynamic Island for active mission:', currentMission.name);
      startActivity({
        missionId: currentMission.id,
        title: currentMission.name,
        status: "Missione attiva",
        progress: currentMission.progress,
        timeLeft: currentMission.timeLeft,
      });
    }
  }, [hasAccess, isLoaded, currentMission, startActivity]);

  useEffect(() => {
    return () => {
      if (currentMission && currentMission.status !== 'active') {
        console.log('🏠 HOME: Cleaning up inactive mission Live Activity');
        endActivity();
      }
    };
  }, [endActivity, currentMission]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log("Real-time notification connection status:", isConnected);
  }, [isConnected]);

  useEffect(() => {
    if (error) {
      toast.error("Si è verificato un errore", {
        description: error,
        position: "bottom-center"
      });
    }
  }, [error]);

  const getContentPaddingClass = () => {
    return isCapacitor ? "capacitor-safe-content" : "";
  };

  const getContentPaddingStyle = () => {
    if (!isCapacitor) {
      return { 
        paddingTop: 'calc(72px + env(safe-area-inset-top) + 50px)' 
      };
    }
    return {};
  };

  // NO MORE DEVELOPER ACCESS SCREEN - CAPACITOR BYPASS IS AUTOMATIC
  const user = getCurrentUser();
  const isCapacitorApp = !!(window as any).Capacitor;
  
  // If on Capacitor, always show the home page (no DeveloperAccess screen)
  if (isCapacitorApp || (user?.email === "wikus77@hotmail.it")) {
    // Force hasAccess = true for Capacitor or developer email
    if (!hasAccess) {
      setHasAccess(true);
    }
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070818] px-4">
        <div className="p-8 bg-red-800/30 rounded-xl text-center w-full max-w-sm glass-card">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-red-300">Errore</h2>
          <p className="text-white/80">{error}</p>
          <motion.button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-full text-white btn-hover-effect"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Riprova
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070818] pb-20 w-full">
      <Helmet>
        <title>M1SSION™ - Home</title>
      </Helmet>
      
      <UnifiedHeader profileImage={profileImage} />
      <div 
        className={getContentPaddingClass()}
        style={getContentPaddingStyle()}
      />

      <AnimatePresence>
        {isLoaded && (
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {notificationsBannerOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`fixed inset-x-0 z-[60] px-2 md:px-4 ${isCapacitor ? 'capacitor-safe-content' : ''}`}
                style={!isCapacitor ? { 
                  top: 'calc(72px + env(safe-area-inset-top) + 50px)'
                } : {}}
              >
                <NotificationsBanner
                  notifications={notifications}
                  open={notificationsBannerOpen}
                  unreadCount={unreadCount}
                  onClose={closeNotificationsBanner}
                  onMarkAllAsRead={markAllAsRead}
                  onDeleteNotification={deleteNotification}
                />
              </motion.div>
            )}

            <div className="container mx-auto px-3">
              <motion.div
                className="text-center my-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h1 className="text-4xl font-orbitron font-bold">
                  <span className="text-[#00D1FF]" style={{ 
                    textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
                  }}>M1</span>
                  <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
                </h1>
              </motion.div>

              <main className="max-w-screen-xl mx-auto pb-20">
                <CommandCenterHome />
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <BottomNavigation />
    </div>
  );
};

export default Home;
