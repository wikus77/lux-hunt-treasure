
import { Link, useLocation } from "react-router-dom";
import { Home, Map, Zap, Trophy, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNotificationManager } from "@/hooks/useNotificationManager";

const BottomNavigation = () => {
  const location = useLocation();
  const [activeRoute, setActiveRoute] = useState("/");
  const { unreadCount } = useNotificationManager();

  useEffect(() => {
    setActiveRoute(location.pathname);
  }, [location]);

  const isActive = (path: string) => {
    if (path === "/" && activeRoute === "/") return true;
    if (path !== "/" && activeRoute.startsWith(path)) return true;
    return false;
  };

  const navigationItems = [
    {
      path: "/",
      icon: Home,
      label: "Home",
    },
    {
      path: "/map",
      icon: Map,
      label: "Mappa",
    },
    {
      path: "/buzz",
      icon: Zap,
      label: "Buzz",
    },
    {
      path: "/leaderboard",
      icon: Trophy,
      label: "Classifica",
    },
    {
      path: "/notifications",
      icon: Bell,
      label: "Notifiche",
      badge: unreadCount,
    },
  ];

  return (
    <motion.nav
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-0 left-0 right-0 z-50 glass-backdrop border-t border-white/10 backdrop-blur-xl bg-gradient-to-r from-black/80 via-[#131524]/80 to-black/80 safe-padding-bottom"
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
                <item.icon className="w-6 h-6 active-gradient-icon mb-1" />
              ) : (
                <item.icon className="w-5 h-5 opacity-70 mb-1" />
              )}
              <span className="text-xs font-medium">
                {item.label}
              </span>
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 right-0 w-4 h-4 bg-gradient-to-r from-[#7B2EFF] to-[#00D1FF] rounded-full flex items-center justify-center text-[10px]">
                  {item.badge}
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
