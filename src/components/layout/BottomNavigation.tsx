
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, Map, Home, Award, User, Circle, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";

const BottomNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { unreadCount } = useNotifications();

  // Standard navigation links without subscriptions
  const links = [
    { icon: <Home className="h-6 w-6" />, label: "Home", path: "/home" },
    { icon: <Map className="h-6 w-6" />, label: "Mappa", path: "/map" },
    {
      icon: <Circle strokeWidth={2} className="h-6 w-6" />,
      label: "Buzz",
      path: "/buzz",
      isSpecial: true,
    },
    { icon: <Gamepad2 className="h-6 w-6" />, label: "Games", path: "/games" },
    {
      icon: <Mail className="h-6 w-6" />,
      label: "Notifiche",
      path: "/notifications",
      badge: unreadCount > 0,
    },
    { icon: <Award className="h-6 w-6" />, label: "Classifica", path: "/leaderboard" },
  ];

  const handleLinkClick = (path: string, e: React.MouseEvent) => {
    if (path === "/home") {
      e.preventDefault();
      window.location.href = "/home";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: "0px",
        zIndex: 9999,
        paddingBottom: "calc(env(safe-area-inset-bottom, 34px) + 12px)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
        backgroundColor: "rgba(0,0,0,0.95)",
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
        isolation: "isolate",
      }}
    >
      <motion.div
        className="h-16 backdrop-blur-xl bg-gradient-to-r from-black/70 via-[#131524]/70 to-black/70 border-t border-white/10 px-3"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        style={{
          position: "relative",
          zIndex: "inherit",
          height: "64px",
          display: "flex",
          alignItems: "center",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="flex items-center justify-around h-full max-w-lg mx-auto w-full">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={(e) => handleLinkClick(link.path, e)}
              className={`relative flex flex-col items-center justify-center w-16 h-16 transition-colors mobile-touch-target ${
                currentPath === link.path
                  ? "text-[#00D1FF]"
                  : "text-gray-400 hover:text-gray-300"
              }`}
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
                    animate={currentPath === link.path ? {
                      scale: [1, 1.1, 1],
                      filter: [
                        "drop-shadow(0 0 5px rgba(0, 209, 255, 0.5))",
                        "drop-shadow(0 0 12px rgba(123, 46, 255, 0.7))",
                        "drop-shadow(0 0 5px rgba(0, 209, 255, 0.5))"
                      ]
                    } : {}}
                    transition={{ 
                      repeat: currentPath === link.path ? Infinity : 0, 
                      duration: 3,
                      ease: "easeInOut"
                    }}
                  >
                    {link.icon}
                  </motion.div>
                )}

                {link.badge && (
                  <motion.div 
                    className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 bg-[#FF59F8] rounded-full shadow-[0_0_8px_rgba(240,89,255,0.5)]"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-[8px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  </motion.div>
                )}
              </motion.div>
              <span className="text-xs mt-1">{link.label}</span>
              {currentPath === link.path && (
                <motion.div
                  className="absolute bottom-0 w-6 h-1 bg-[#00D1FF] rounded-t-md"
                  layoutId="navigation-underline"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{
                    boxShadow: "0 0 8px rgba(0, 209, 255, 0.5)",
                  }}
                />
              )}
            </Link>
          ))}
        </div>
        <div className="line-glow absolute top-0 left-0 w-full"></div>
      </motion.div>
    </div>
  );
};

export default BottomNavigation;
