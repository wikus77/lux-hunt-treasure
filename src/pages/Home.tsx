
import { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useProfileImage } from "@/hooks/useProfileImage";
import { motion } from "framer-motion";
import BriefProfileModal from "@/components/profile/BriefProfileModal";
import { CommandCenterHome } from "@/components/command-center/CommandCenterHome";
import HomeHeader from "@/components/home/HomeHeader";
import { useIsMobile } from "@/hooks/use-mobile";

const Home = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsBanner, setShowNotificationsBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profileImage } = useProfileImage();
  const isMobile = useIsMobile();

  // Use try/catch to handle any potential errors in the notifications hook
  let notifications = [];
  let unreadCount = 0;
  let markAllAsRead = () => {};
  let reloadNotifications = () => {};

  try {
    const notificationsData = useNotifications();
    notifications = notificationsData.notifications;
    unreadCount = notificationsData.unreadCount;
    markAllAsRead = notificationsData.markAllAsRead;
    reloadNotifications = notificationsData.reloadNotifications;
  } catch (e) {
    console.error("Error loading notifications:", e);
    // Continue with empty notifications rather than crashing
  }

  const handleShowNotifications = () => {
    try {
      reloadNotifications();
      setShowNotificationsBanner(true);
    } catch (e) {
      console.error("Error showing notifications:", e);
    }
  };

  const handleCloseNotifications = () => {
    setShowNotificationsBanner(false);
  };

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
    <div className="relative">
      {/* Background particles */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              boxShadow: `0 0 8px ${particle.color}`,
              top: `${particle.top}%`,
              left: `${particle.left}%`,
            }}
            animate={{
              y: [0, -30, 0, 30, 0],
              x: [0, 20, 40, 20, 0],
              opacity: [0.3, 0.7, 0.5, 0.8, 0.3],
            }}
            transition={{
              duration: particle.duration,
              ease: "easeInOut",
              times: [0, 0.2, 0.5, 0.8, 1],
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}

        {/* Animated gradient overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-[#06071b]/80 via-transparent to-[#06071b]/80 z-[-1]" 
          style={{ 
            backgroundImage: "radial-gradient(ellipse at top, rgba(0,229,255,0.15) 0%, rgba(0,0,0,0) 60%), radial-gradient(ellipse at bottom, rgba(155,135,245,0.15) 0%, rgba(0,0,0,0) 60%)" 
          }}
        />

        {/* Light beams */}
        <div className="absolute top-0 left-1/4 w-[200px] h-[500px] bg-[#00a3ff] opacity-[0.02] blur-[80px] transform rotate-[-45deg]" />
        <div className="absolute bottom-0 right-1/4 w-[200px] h-[500px] bg-[#9b87f5] opacity-[0.02] blur-[80px] transform rotate-[45deg]" />

        {/* Grid lines */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.png')] bg-repeat opacity-[0.05]" />
      </div>

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Custom header implementation */}
        <HomeHeader 
          profileImage={profileImage}
          unreadCount={unreadCount}
          onShowNotifications={handleShowNotifications}
        />
        
        {/* Increased top padding to accommodate header + countdown */}
        <main className={`pt-[100px] ${isMobile ? 'sm:pt-40' : 'sm:pt-40'} px-2 sm:px-4 max-w-screen-xl mx-auto`}>
          <CommandCenterHome />
        </main>
      </motion.div>

      <BriefProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profileImage={profileImage}
      />
    </div>
  );
};

export default Home;
