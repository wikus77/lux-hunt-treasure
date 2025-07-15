// ✅ Fix UI eseguito da JOSEPH MULE — M1SSION™
import React from "react";
import { useLocation } from "wouter";
import { Mail, Map, Home, Award, User, Circle, Gamepad2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import { useWouterNavigation } from "@/hooks/useWouterNavigation";
import { detectCapacitorEnvironment } from "@/utils/iosCapacitorFunctions";

// Explicit function name for iOS Capacitor compatibility
const BottomNavigationComponent = () => {
  const [currentPath] = useLocation();
  const { unreadCount } = useNotifications();
  const { 
    navigate, 
    isCapacitor 
  } = useWouterNavigation();

  console.log('🧭 BottomNavigation render:', {
    currentPath,
    isCapacitor,
    unreadCount
  });

  // Enhanced navigation links with better organization
  const links = [
    { 
      icon: <Home className="h-6 w-6" />, 
      label: "Home", 
      path: "/home",
      color: "#00D1FF"
    },
    { 
      icon: <Map className="h-6 w-6" />, 
      label: "Mappa", 
      path: "/map",
      color: "#4ADE80"
    },
    {
      icon: <Circle strokeWidth={2} className="h-6 w-6" />,
      label: "Buzz",
      path: "/buzz",
      isSpecial: true,
      color: "#F59E0B"
    },
    { 
      icon: <Gamepad2 className="h-6 w-6" />, 
      label: "Games", 
      path: "/games",
      color: "#8B5CF6"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      label: "Notifiche",
      path: "/notifications",
      badge: unreadCount > 0,
      badgeCount: unreadCount,
      color: "#EF4444"
    },
    { 
      icon: <Award className="h-6 w-6" />, 
      label: "Classifica", 
      path: "/leaderboard",
      color: "#F59E0B"
    },
  ];

  // iOS Capacitor compatible navigation handler with haptic feedback
  const handleNavigationExplicit = async (link: typeof links[0], e: React.MouseEvent) => {
    e.preventDefault();
    
    console.log('🧭 Navigation clicked:', { path: link.path, isCapacitor });
    
    // Execute Wouter navigation
    navigate(link.path);
    
    // iOS WebView scroll fix with explicit function
    const applyIOSScrollFix = () => {
      if (isCapacitor) {
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      }
    };
    applyIOSScrollFix();
  };

  return (
    <div
      className="bottom-navigation-ios"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: "0px",
        zIndex: 9999,
        paddingBottom: isCapacitor ? "calc(env(safe-area-inset-bottom, 34px) + 12px)" : "12px",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
        backgroundColor: "rgba(0,0,0,0.95)",
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
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        style={{
          position: "relative",
          zIndex: "inherit",
          height: "90px", // Aumento del 10% (da 82px a 90px)
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(to right, rgba(0, 0, 0, 0.55), rgba(19, 21, 33, 0.55), rgba(0, 0, 0, 0.55))",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
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
                onClick={(e) => handleNavigationExplicit(link, e)}
                className={`relative flex flex-col items-center justify-center w-16 h-16 transition-colors mobile-touch-target cursor-pointer ${
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
                        repeat: Infinity, 
                        duration: 3,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] opacity-30 blur-sm animate-pulse" />
                      <div
                        className="absolute inset-0 rounded-full border-2 border-[#00D1FF]/60 animate-spin-slow"
                        style={{
                          animation: "spin 8s linear infinite",
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
                        repeat: isActive ? Infinity : 0, 
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
                          repeat: Infinity,
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
                    repeat: isActive ? Infinity : 0, 
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