
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CommandCenterHome } from "@/components/command-center/CommandCenterHome";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfileImage } from "@/hooks/useProfileImage";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import NotificationsBanner from "@/components/notifications/NotificationsBanner";
import { Helmet } from "react-helmet";
import { toast } from "sonner";
import BottomNavigation from "@/components/layout/BottomNavigation";
import UnifiedHeader from "@/components/layout/UnifiedHeader";

const AppHome = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { profileImage } = useProfileImage();
  const isMobile = useIsMobile();
  const [hasAccess, setHasAccess] = useState(false);
  const [isCapacitor, setIsCapacitor] = useState(false);
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

  // 🔥 IMMEDIATE CAPACITOR ACCESS - NO RESTRICTIONS
  useEffect(() => {
    const isCapacitorApp = !!(window as any).Capacitor;
    setIsCapacitor(isCapacitorApp);
    
    if (isCapacitorApp) {
      console.log("🔓 CAPACITOR: Immediate access granted - no developer screen");
      setHasAccess(true);
      return;
    }
    
    // Check for developer email
    const userEmail = localStorage.getItem('developer_user_email') || 
                     sessionStorage.getItem('email');
    
    if (userEmail === 'wikus77@hotmail.it') {
      console.log("🔓 DEVELOPER EMAIL: Access granted for wikus77@hotmail.it");
      setHasAccess(true);
      localStorage.setItem('developer_access', 'granted');
      return;
    }
    
    // Check stored access for web users
    const hasStoredAccess = localStorage.getItem('developer_access') === 'granted';
    if (hasStoredAccess) {
      setHasAccess(true);
    } else if (!isMobile) {
      // Web users without access get redirected to landing
      window.location.href = '/landing';
    }
  }, [isMobile]);

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

  // NO DEVELOPER ACCESS SCREEN ON CAPACITOR OR DEVELOPER EMAIL
  if (!hasAccess && !isCapacitor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070818] px-4">
        <div className="p-8 bg-blue-800/30 rounded-xl text-center w-full max-w-sm glass-card">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-blue-300">Accesso Richiesto</h2>
          <p className="text-white/80 mb-6">Inserisci il codice di accesso per continuare</p>
          <button 
            onClick={() => {
              const code = prompt("Inserisci il codice:");
              if (code === "M1SSION2025") {
                localStorage.setItem('developer_access', 'granted');
                setHasAccess(true);
              }
            }}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full text-white"
          >
            Inserisci Codice
          </button>
        </div>
      </div>
    );
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
    <div 
      className="bg-[#070818] w-full"
      style={{ 
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Helmet>
        <title>M1SSION™ - Home App</title>
      </Helmet>
      
      {/* Fixed Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: '72px',
          paddingTop: 'env(safe-area-inset-top, 47px)',
          backgroundColor: 'rgba(7, 8, 24, 0.95)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <UnifiedHeader profileImage={profileImage} />
      </header>
      
      {/* Main scrollable content */}
      <main
        style={{
          paddingTop: 'calc(72px + env(safe-area-inset-top, 47px) + 40px)',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          height: '100dvh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 0
        }}
      >
        <AnimatePresence>
          {isLoaded && (
            <motion.div
              className="relative"
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
                  className="fixed inset-x-0 z-40 px-2 md:px-4"
                  style={{ 
                    top: 'calc(72px + env(safe-area-inset-top, 47px))'
                  }}
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
                  <p className="text-gray-400 mt-2">Centro di Comando Agente</p>
                </motion.div>

                <main className="max-w-screen-xl mx-auto pb-20">
                  <CommandCenterHome />
                </main>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default AppHome;
