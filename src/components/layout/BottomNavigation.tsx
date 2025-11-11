// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT
import React from "react";
import { useLocation } from "wouter";
import { Mail, Map, Home, Award, User, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import { useWouterNavigation } from "@/hooks/useWouterNavigation";
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// PWA Navigation Component
const BottomNavigationComponent = () => {
  const [currentPath] = useLocation();
  const { unreadCount } = useNotifications();
  const { navigate } = useWouterNavigation();
  const isPWA = typeof window !== 'undefined' && 
    window.matchMedia('(display-mode: standalone)').matches;
  const reduceAnimations = currentPath === '/profile' || currentPath === '/settings/agent-profile';

  console.log('🧭 BottomNavigation render:', {
    currentPath,
    isPWA,
    unreadCount
  });

  // Enhanced navigation links with uniform cyan color for active state
  const links = [
    { 
      icon: <Home className="h-6 w-6" />, 
      label: "Home", 
      path: "/home",
      color: "#00D1FF"
    },
    { 
      icon: <Map className="h-6 w-6" />, 
      label: "Map", 
      path: "/map",
      color: "#00D1FF"
    },
    { 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>, 
      label: "Living", 
      path: "/living-map-3d",
      color: "#00D1FF"
    },
    {
      icon: <Circle strokeWidth={2} className="h-6 w-6" />,
      label: "Buzz",
      path: "/buzz",
      isSpecial: true,
      color: "#00D1FF"
    },
    { 
      icon: <span className="text-lg font-bold">AI</span>,
      label: "Intel", 
      path: "/intelligence",
      color: "#00D1FF"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      label: "Notice",
      path: "/notifications",
      badge: unreadCount > 0,
      badgeCount: unreadCount,
      color: "#00D1FF"
    },
    { 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>, 
      label: "Winners", 
      path: "/leaderboard",
      color: "#00D1FF"
    },
  ];

  // PWA compatible navigation handler
  const handleNavigationPWA = async (link: typeof links[0], e: React.MouseEvent) => {
    e.preventDefault();
    
    console.log('🧭 Navigation clicked:', { path: link.path, isPWA });
    
    // Execute Wouter navigation
    navigate(link.path);
    
    // PWA scroll fix
    const applyPWAScrollFix = () => {
      if (isPWA) {
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      }
    };
    applyPWAScrollFix();
  };

  return (
    <div
      className="bottom-navigation-ios"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: "0px",
        zIndex: 10000,
        paddingBottom: "0px",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
        backgroundColor: "transparent",
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
        isolation: "isolate",
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
        willChange: "transform",
      }}
    >
      <motion.div
        className="backdrop-blur-xl border-t border-white/10 px-3 bottom-nav-hardware-acceleration rounded-t-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "relative",
          zIndex: "inherit",
          height: "79px",
          display: "flex",
          alignItems: "flex-start",
          paddingTop: "8px",
          paddingBottom: isPWA ? "env(safe-area-inset-bottom)" : "0px",
          background: "rgba(0, 0, 0, 0.15)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(0, 209, 255, 0.2)",
          boxShadow: "0 -4px 24px rgba(0, 209, 255, 0.15), 0 -2px 12px rgba(0, 209, 255, 0.1), inset 0 1px 0 rgba(0, 209, 255, 0.1)",
          WebkitTapHighlightColor: "transparent",
          touchAction: "manipulation",
        }}
      >
        <div className="flex items-center justify-around h-full max-w-lg mx-auto w-full">
          {links.map((link) => {
            const isActive = currentPath === link.path;
            
            return (
              <motion.button
                key={link.path}
                onClick={(e) => handleNavigationPWA(link, e)}
                className={`relative flex flex-col items-center justify-center w-14 h-12 transition-colors mobile-touch-target cursor-pointer ${
                  isActive
                    ? "text-[#00D1FF]"
                    : "text-gray-400 hover:text-gray-300"
                }`}
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  WebkitTapHighlightColor: "transparent",
                  WebkitTouchCallout: "none",
                  userSelect: "none",
                  touchAction: "manipulation",
                  minHeight: "44px",
                  minWidth: "44px",
                }}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div className="relative">
                  {link.isSpecial ? (
                    <motion.div 
                      className="relative"
                      animate={{ 
                        scale: [1, 1.05, 1], 
                        opacity: [1, 0.9, 1] 
                      }}
                      transition={{ 
                        repeat: reduceAnimations ? 0 : Infinity, 
                        duration: 3,
                        ease: "easeInOut"
                      }}
                    >
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] opacity-30 blur-sm ${!reduceAnimations ? 'animate-pulse' : ''}`} />
                      <div
                        className="absolute inset-0 rounded-full border-2 border-[#00D1FF]/60 animate-spin-slow"
                        style={{
                          animation: reduceAnimations ? "spin 1.6s linear 1" : "spin 8s linear infinite",
                        }}
                      />
                      <div
                        className="relative z-10 text-[#00D1FF]"
                        style={{
                          filter: "drop-shadow(0 0 8px rgba(0, 209, 255, 0.8))",
                          textShadow: "0 0 10px rgba(0, 209, 255, 0.6)",
                        }}
                      >
                        {link.icon}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={isActive ? {
                        scale: [1, 1.1, 1],
                        filter: [
                          `drop-shadow(0 0 5px ${link.color}80)`,
                          `drop-shadow(0 0 12px ${link.color}CC)`,
                          `drop-shadow(0 0 5px ${link.color}80)`
                        ]
                      } : {}}
                      transition={{ 
                        repeat: isActive && !reduceAnimations ? Infinity : 0, 
                        duration: 3,
                        ease: "easeInOut"
                      }}
                      style={{
                        color: isActive ? link.color : 'inherit'
                      }}
                    >
                      {link.icon}
                    </motion.div>
                  )}

                  {/* Enhanced notification badge */}
                  <AnimatePresence>
                    {link.badge && link.badgeCount && (
                      <motion.div 
                        className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 bg-[#FF59F8] rounded-full shadow-[0_0_8px_rgba(240,89,255,0.5)]"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: 1
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ 
                          duration: 2, 
                          repeat: reduceAnimations ? 0 : Infinity,
                          repeatType: "reverse"
                        }}
                      >
                        <span className="text-[9px] font-bold text-white">
                          {link.badgeCount > 99 ? "99+" : link.badgeCount}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Enhanced label with color */}
                <motion.span 
                  className="text-xs mt-1 select-none"
                  style={{
                    color: isActive ? link.color : 'inherit'
                  }}
                  animate={isActive ? {
                    textShadow: [
                      `0 0 5px ${link.color}80`,
                      `0 0 10px ${link.color}CC`,
                      `0 0 5px ${link.color}80`
                    ]
                  } : {}}
                  transition={{ 
                    repeat: isActive && !reduceAnimations ? Infinity : 0, 
                    duration: 3,
                    ease: "easeInOut"
                  }}
                >
                  {link.label}
                </motion.span>

                {/* Enhanced active indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 w-8 h-1 rounded-t-md"
                      style={{
                        backgroundColor: link.color,
                        boxShadow: `0 0 8px ${link.color}80`,
                      }}
                      layoutId="navigation-underline"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
        <div className="line-glow absolute top-0 left-0 w-full"></div>
      </motion.div>
    </div>
  );
};

// Export with explicit name for iOS Capacitor compatibility
const BottomNavigation = BottomNavigationComponent;
export default BottomNavigation;