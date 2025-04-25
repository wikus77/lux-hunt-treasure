
import { useState, useEffect } from "react";
import HomeLayout from "@/components/home/HomeLayout";
import HomeContent from "@/components/home/HomeContent";
import BriefProfileModal from "@/components/profile/BriefProfileModal";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { useProfileImage } from "@/hooks/useProfileImage";
import { motion } from "framer-motion";

const Home = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsBanner, setShowNotificationsBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { profileImage } = useProfileImage();

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

  // Random floating particles for futuristic look
  const particles = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 15 + 15,
    color: i % 3 === 0 ? '#00E5FF' : i % 3 === 1 ? '#FFC300' : '#FF00FF',
  }));

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="p-8 bg-red-800/30 rounded-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Errore</h2>
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
    <>
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
              y: [0, -20, 0, 20, 0],
              x: [0, 10, 20, 10, 0],
              opacity: [0.4, 0.8, 0.6, 0.9, 0.4],
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
      </div>

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <HomeLayout 
          profileImage={profileImage}
          showNotificationsBanner={showNotificationsBanner}
          notifications={notifications}
          unreadCount={unreadCount}
          onCloseNotifications={handleCloseNotifications}
          onMarkAllAsRead={markAllAsRead}
        >
          <div className="w-full mx-auto max-w-4xl">
            {/* Welcome banner with "IT IS POSSIBLE" motto */}
            <motion.div 
              className="glass-card p-6 mb-8 relative overflow-hidden"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div 
                className="absolute -right-4 -bottom-10 opacity-10"
                animate={{ 
                  y: [0, -5, 0, -5, 0],
                  rotate: [0, 2, 0, -2, 0],
                }}
                transition={{ 
                  duration: 10, 
                  ease: "easeInOut", 
                  repeat: Infinity,
                }}
              >
                <img 
                  src="/lovable-uploads/ed5de774-31bd-4930-8b16-7af05790ab50.png" 
                  alt="M1SSION Logo" 
                  className="w-40 h-40 object-contain"
                />
              </motion.div>
              
              <h1 className="mission-heading">WELCOME TO M1SSION</h1>
              <p className="text-white/80 mb-4">The prize contest that changes the rules</p>
              <div className="mission-motto">IT IS POSSIBLE</div>
            </motion.div>
            
            {/* Main content */}
            <HomeContent />
          </div>
        </HomeLayout>
      </motion.div>

      <BriefProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profileImage={profileImage}
      />
    </>
  );
};

export default Home;
