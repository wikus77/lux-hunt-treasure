// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT
import React from "react";
import { useLocation } from "wouter";
import { Home, MessageSquare, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import { useWouterNavigation } from "@/hooks/useWouterNavigation";
import { hapticLight } from "@/utils/haptics";
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// PWA Navigation Component - Floating Pill Style - SIMPLIFIED

const BottomNavigationComponent = () => {
  const [currentPath] = useLocation();
  const { unreadCount } = useNotifications();
  const { navigate } = useWouterNavigation();
  const isPWA = typeof window !== 'undefined' && 
    window.matchMedia('(display-mode: standalone)').matches;

  // Navigation links
  const links = [
    { 
      icon: <Home className="h-6 w-6" strokeWidth={1.5} />, 
      path: "/home",
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>, 
      path: "/map-3d-tiler",
    },
    {
      icon: <Circle strokeWidth={1.5} className="h-6 w-6" />,
      path: "/buzz",
      isSpecial: true,
    },
    { 
      icon: <span className="text-lg font-semibold">AI</span>,
      path: "/intelligence",
    },
    {
      icon: <MessageSquare className="h-6 w-6" strokeWidth={1.5} />,
      path: "/notifications",
      badge: unreadCount > 0,
      badgeCount: unreadCount,
    },
    { 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" className="w-6 h-6">
        <polygon points="12,18 4,7 20,7" />
      </svg>, 
      path: "/leaderboard",
    },
  ];

  // PWA compatible navigation handler
  const handleNavigationPWA = async (link: typeof links[0], e: React.MouseEvent) => {
    e.preventDefault();
    hapticLight();
    navigate(link.path);
    if (isPWA) {
      setTimeout(() => window.scrollTo(0, 0), 100);
    }
  };

  return (
    <div
      className="bottom-navigation-ios"
      data-onboarding="bottom-nav"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        width: "100vw",
        zIndex: 10000,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingBottom: isPWA ? "env(safe-area-inset-bottom, 8px)" : "8px",
        pointerEvents: "none",
        // GPU acceleration
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
        isolation: "isolate",
        willChange: "transform",
        visibility: "visible",
        opacity: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          width: "100%",
          maxWidth: "400px",
          height: "64px",
          background: "rgba(15, 20, 30, 0.65)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderRadius: "32px",
          padding: "0 8px",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.08)",
          pointerEvents: "auto",
        }}
      >
        {links.map((link) => {
          const isActive = currentPath === link.path || 
            (link.path === '/map-3d-tiler' && currentPath === '/living-map-3d');
          
          return (
            <motion.button
              key={link.path}
              onClick={(e) => handleNavigationPWA(link, e)}
              className="relative flex flex-col items-center justify-center"
              style={{
                background: "none",
                border: "none",
                outline: "none",
                cursor: "pointer",
                padding: "8px 12px",
                WebkitTapHighlightColor: "transparent",
                color: isActive ? "#00D1FF" : "#8B9CAF",
              }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
            >
              {/* Background circle when active */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    style={{
                      position: "absolute",
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "rgba(0, 0, 0, 0.4)",
                      zIndex: 0,
                    }}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />
                )}
              </AnimatePresence>

              {/* Active indicator line */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    style={{
                      position: "absolute",
                      top: "2px",
                      width: "20px",
                      height: "3px",
                      backgroundColor: "#00D1FF",
                      borderRadius: "2px",
                      boxShadow: "0 0 8px #00D1FF, 0 0 16px #00D1FF",
                      zIndex: 2,
                    }}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>

              {/* Icon */}
              <div className="relative z-[1]">
                {link.icon}
                
                {/* Notification badge */}
                {link.badge && link.badgeCount && (
                  <motion.div 
                    className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 bg-[#FF59F8] rounded-full"
                    style={{ boxShadow: "0 0 8px rgba(255, 89, 248, 0.7)" }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <span className="text-[8px] font-bold text-white">
                      {link.badgeCount > 9 ? "9+" : link.badgeCount}
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

const BottomNavigation = BottomNavigationComponent;
export default BottomNavigation;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
