
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, Map, Home, Award, Circle, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";

const BottomNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { unreadCount } = useNotifications();

  const links = [
    { icon: <Home className="h-6 w-6" />, label: "Home", path: "/home" },
    { icon: <Map className="h-6 w-6" />, label: "Mappa", path: "/map" },
    { 
      icon: <Circle strokeWidth={2} className="h-6 w-6" />, 
      label: "Buzz", 
      path: "/buzz",
      isSpecial: true
    },
    { icon: <Gamepad2 className="h-6 w-6" />, label: "Games", path: "/games" },
    { 
      icon: <Mail className="h-6 w-6" />, 
      label: "Notifiche", 
      path: "/notifications", 
      badge: unreadCount > 0 
    },
    { icon: <Award className="h-6 w-6" />, label: "Classifica", path: "/leaderboard" }
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
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: 'calc(64px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 9999,
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        backgroundColor: 'rgba(0, 0, 0, 0.95)'
      }}
    >
      <motion.div 
        className="h-16 backdrop-blur-xl bg-gradient-to-r from-black/70 via-[#131524]/70 to-black/70 border-t border-white/10 px-3"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        style={{
          position: 'relative',
          zIndex: 'inherit',
          height: '100%',
          display: 'flex',
          alignItems: 'center'
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
              <div className="relative">
                {link.isSpecial ? (
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] opacity-30 blur-sm animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-2 border-[#00D1FF]/60 animate-spin-slow" style={{
                      animation: 'spin 8s linear infinite'
                    }} />
                    <div className="relative z-10 text-[#00D1FF]" style={{
                      filter: 'drop-shadow(0 0 8px rgba(0, 209, 255, 0.8))',
                      textShadow: '0 0 10px rgba(0, 209, 255, 0.6)'
                    }}>
                      {link.icon}
                    </div>
                  </div>
                ) : (
                  link.icon
                )}
                
                {link.badge && (
                  <div className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 bg-[#FF59F8] rounded-full animate-pulse shadow-[0_0_8px_rgba(240,89,255,0.5)]">
                    <span className="text-[8px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs mt-1">{link.label}</span>
              {currentPath === link.path && (
                <motion.div
                  className="absolute bottom-0 w-6 h-1 bg-[#00D1FF] rounded-t-md"
                  layoutId="navigation-underline"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{ 
                    boxShadow: "0 0 8px rgba(0, 209, 255, 0.5)" 
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
