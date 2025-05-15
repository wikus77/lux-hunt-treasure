
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BriefProfileModal from "@/components/profile/BriefProfileModal";
import { CommandCenterHome } from "@/components/command-center/CommandCenterHome";
import HomeHeader from "@/components/home/HomeHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfileImage } from "@/hooks/useProfileImage";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import NotificationsBanner from "@/components/notifications/NotificationsBanner";
import HomeLayout from "@/components/home/HomeLayout";
import DynamicIsland from "@/components/DynamicIsland";
import { Helmet } from "react-helmet";
import { toast } from "sonner";

const Home = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { profileImage } = useProfileImage();
  const isMobile = useIsMobile();
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    notificationsBannerOpen,
    openNotificationsBanner,
    closeNotificationsBanner
  } = useNotificationManager();
  
  // Initialize real-time notifications (this sets up the listener)
  const { isConnected } = useRealTimeNotifications();

  // Background particles for atmosphere
  const particles = Array.from({ length: isMobile ? 8 : 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 15 + 15,
    color: i % 3 === 0 ? '#00E5FF' : i % 3 === 1 ? '#FFC300' : '#9b87f5',
  }));

  // Improve loading experience
  useEffect(() => {
    // Simple timer to ensure smooth UI transition
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Show connection status in console
  useEffect(() => {
    console.log("Real-time notification connection status:", isConnected);
  }, [isConnected]);

  // Handle errors
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
      <div className="flex min-h-screen items-center justify-center bg-black px-4">
        <div className="p-8 bg-red-800/30 rounded-xl text-center w-full max-w-sm">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Errore</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-red-900 rounded-md">
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <HomeLayout profileImage={profileImage}>
      <Helmet>
        <title>M1SSION - Home</title>
      </Helmet>
      
      <DynamicIsland />
      
      <AnimatePresence>
        {isLoaded && (
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Notifications Banner */}
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
                />
              </motion.div>
            )}
            
            {/* Custom header implementation */}
            <HomeHeader 
              profileImage={profileImage}
              unreadCount={unreadCount}
              onShowNotifications={openNotificationsBanner}
            />
            
            {/* Increased top padding to accommodate header + countdown */}
            <main className={`pt-[120px] ${isMobile ? 'sm:pt-44' : 'sm:pt-44'} px-2 sm:px-4 max-w-screen-xl mx-auto pb-20`}>
              <CommandCenterHome />
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      <BriefProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profileImage={profileImage}
      />
    </HomeLayout>
  );
};

export default Home;
