
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

const Home = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { profileImage } = useProfileImage();
  const isMobile = useIsMobile();
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
      <div className="h-[72px] w-full" />

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
                className="fixed inset-x-0 top-0 z-[60] px-2 md:px-4 mt-16"
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
