
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, Map, Home, Trophy, User, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";

const BottomNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { unreadCount } = useNotifications();

  const links = [
    { icon: <Home className="h-6 w-6" />, label: "Home", path: "/" },
    { icon: <Map className="h-6 w-6" />, label: "Mappa", path: "/map" },
    { icon: <Circle strokeWidth={2} className="h-6 w-6" />, label: "Buzz", path: "/buzz" },
    { icon: <Bell className="h-6 w-6" />, label: "Notifiche", path: "/notifications", badge: unreadCount > 0 },
    { icon: <Trophy className="h-6 w-6" />, label: "Classifica", path: "/leaderboard" },
  ];

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 h-16 backdrop-blur-xl bg-gradient-to-r from-black/70 via-[#131524]/70 to-black/70 border-t border-white/10 px-3"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex items-center justify-around h-full max-w-lg mx-auto">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`relative flex flex-col items-center justify-center w-16 h-16 transition-colors ${
              currentPath === link.path
                ? "text-[#00D1FF]"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <div className="relative">
              {link.icon}
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
      
      {/* Add the horizontal line glow effect matching the header */}
      <div className="line-glow absolute top-0 left-0 w-full"></div>
    </motion.div>
  );
};

export default BottomNavigation;
