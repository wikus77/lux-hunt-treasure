import { useState, useEffect } from "react";
import HomeLayout from "@/components/home/HomeLayout";
import HomeContent from "@/components/home/HomeContent";
import BriefProfileModal from "@/components/profile/BriefProfileModal";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { useProfileImage } from "@/hooks/useProfileImage";
import { motion } from "framer-motion";
import { SmoothScroll } from "@/components/ui/smooth-scroll";

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
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 5 + 2,
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
    <SmoothScroll options={{ lerp: 0.07, smartphone: { smooth: false } }}>
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
        <HomeLayout 
          profileImage={profileImage}
          showNotificationsBanner={showNotificationsBanner}
          notifications={notifications}
          unreadCount={unreadCount}
          onCloseNotifications={handleCloseNotifications}
          onMarkAllAsRead={markAllAsRead}
        >
          <div className="w-full mx-auto max-w-4xl" data-scroll-section>
            {/* Welcome banner with "IT IS POSSIBLE" motto - now with reveal animation */}
            <motion.div 
              className="glass-card p-6 mb-8 relative overflow-hidden backdrop-blur-xl bg-black/40 border border-white/10"
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
              data-scroll
              data-scroll-speed="0.2"
            >
              <motion.div 
                className="absolute -right-16 -bottom-16 opacity-10"
                animate={{ 
                  y: [0, -8, 0, -8, 0],
                  rotate: [0, 3, 0, -3, 0],
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
                  className="w-60 h-60 object-contain"
                />
              </motion.div>
              
              <div className="overflow-hidden mb-2">
                <motion.h1 
                  className="mission-heading"
                  initial={{ y: "100%" }}
                  whileInView={{ y: "0%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1], delay: 0.3 }}
                >
                  WELCOME TO M1SSION
                </motion.h1>
              </div>
              
              <div className="overflow-hidden">
                <motion.p 
                  className="text-white/80 mb-4"
                  initial={{ y: "100%" }}
                  whileInView={{ y: "0%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1], delay: 0.4 }}
                >
                  The prize contest that changes the rules
                </motion.p>
              </div>
              
              <motion.div 
                className="mission-motto"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.7 }}
              >
                <span className="wave-text">
                  {Array.from("IT IS POSSIBLE").map((char, i) => (
                    <span key={i} style={{"--char-index": i} as React.CSSProperties}>{char}</span>
                  ))}
                </span>
              </motion.div>
            </motion.div>
            
            {/* Main content with optimized animation triggers */}
            <HomeContent />
          </div>
        </HomeLayout>
      </motion.div>

      <BriefProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profileImage={profileImage}
      />
    </SmoothScroll>
  );
};

export default Home;
