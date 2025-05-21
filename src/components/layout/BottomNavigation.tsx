
import { Link, useLocation } from "react-router-dom";
import { Home, Map, Zap, Trophy, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";

const BottomNavigation = () => {
  const location = useLocation();
  const [activeRoute, setActiveRoute] = useState("");
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    setActiveRoute(location.pathname);
  }, [location]);

  const isActive = (path: string) => {
    if (path === "/home" && (activeRoute === "/home" || activeRoute === "/")) return true;
    if (path !== "/home" && activeRoute.startsWith(path)) return true;
    return false;
  };

  const navigationItems = [
    {
      path: "/home",
      icon: Home,
      label: "Home",
      color: "#00D1FF"
    },
    {
      path: "/map",
      icon: Map,
      label: "Mappa",
      color: "#00D1FF"
    },
    {
      path: "/buzz",
      icon: Zap,
      label: "Buzz",
      color: "#7B2EFF"
    },
    {
      path: "/leaderboard",
      icon: Trophy,
      label: "Classifica",
      color: "#F059FF"
    },
    {
      path: "/notifications",
      icon: Bell,
      label: "Notifiche",
      color: "#00D1FF",
      badge: unreadCount
    },
  ];

  return (
    <motion.nav
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-0 left-0 right-0 z-50 glass-backdrop border-t border-white/10 backdrop-blur-xl bg-[#070818]/90 pb-safe"
    >
      <div className="flex justify-around items-center h-16">
        {navigationItems.map((item) => (
          <Link
            to={item.path}
            key={item.path}
            className={`bottom-nav-item relative px-2 py-1 ${
              isActive(item.path) ? "active" : ""
            }`}
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center w-full"
            >
              {isActive(item.path) ? (
                <item.icon 
                  className="w-6 h-6 mb-1" 
                  style={{ 
                    color: item.color,
                    filter: `drop-shadow(0 0 5px ${item.color}80)`
                  }}
                />
              ) : (
                <item.icon className="w-5 h-5 opacity-70 mb-1" />
              )}
              <span 
                className={`text-xs font-medium ${
                  isActive(item.path) ? "opacity-100" : "opacity-70"
                }`}
                style={{ 
                  color: isActive(item.path) ? item.color : undefined,
                  textShadow: isActive(item.path) ? `0 0 5px ${item.color}40` : undefined
                }}
              >
                {item.label}
              </span>
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 right-0 w-4 h-4 bg-[#F059FF] rounded-full flex items-center justify-center text-[10px] text-white"
                  style={{
                    boxShadow: "0 0 8px rgba(240, 89, 255, 0.5)"
                  }}
                >
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.nav>
  );
};

export default BottomNavigation;
