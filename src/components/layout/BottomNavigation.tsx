
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Award, Home, Map, BadgeAlert, Zap } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { path: "/home", icon: Home, label: "Home" },
    { path: "/map", icon: Map, label: "Mappa" },
    { path: "/buzz", icon: Zap, label: "Buzz" },
    { path: "/leaderboard", icon: Award, label: "Classifica" },
    { path: "/notifications", icon: BadgeAlert, label: "Avvisi", badge: unreadCount > 0 ? unreadCount : null },
  ];

  // Adjust touch target sizing for better mobile UX
  const buttonClasses = "bottom-nav-item px-1 py-2 min-w-[56px] min-h-[50px] flex flex-col items-center justify-center relative";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-backdrop py-2 px-4 sm:py-3 bg-black/70 backdrop-blur-md border-t border-white/10">
        <nav className="flex justify-around items-center max-w-screen-xl mx-auto">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={buttonClasses}
              aria-label={item.label}
            >
              <div className="relative">
                <motion.div
                  animate={{ 
                    filter: isActive(item.path) 
                      ? "drop-shadow(0 0 8px rgba(123, 46, 255, 0.5))" 
                      : "none" 
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <item.icon
                    className={`h-6 w-6 transition-all duration-300 ${
                      isActive(item.path) 
                        ? "text-white scale-110"
                        : "text-gray-400"
                    }`}
                  />
                </motion.div>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center animate-pulse">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 transition-colors duration-300 ${
                isActive(item.path) 
                  ? "text-white font-medium" 
                  : "text-gray-400"
              }`}>
                {item.label}
              </span>
              {isActive(item.path) && (
                <div className="h-0.5 w-5 mx-auto mt-1 bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default BottomNavigation;
