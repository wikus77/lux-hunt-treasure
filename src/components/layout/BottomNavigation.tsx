
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
    if (path === "/" && (activeRoute === "/" || activeRoute === "/home")) return true;
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
      badge: unreadCount > 0,
    },
  ];

  return (
    <motion.nav
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-0 left-0 right-0 z-50 glass-backdrop border-t border-white/10 backdrop-blur-xl bg-[#070818]/90 safe-padding-bottom"
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
                    filter: `drop-shadow(0 0 5px ${
                      item.path === "/" ? "rgba(0, 209, 255, 0.7)" :
                      item.path === "/map" ? "rgba(0, 209, 255, 0.7)" :
                      item.path === "/buzz" ? "rgba(123, 46, 255, 0.7)" :
                      item.path === "/leaderboard" ? "rgba(240, 89, 255, 0.7)" :
                      "rgba(0, 209, 255, 0.7)"
                    })`,
                    color: item.path === "/" ? "#00D1FF" :
                           item.path === "/map" ? "#00D1FF" :
                           item.path === "/buzz" ? "#7B2EFF" :
                           item.path === "/leaderboard" ? "#F059FF" :
                           "#00D1FF"
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
                  color: isActive(item.path) ? 
                    (item.path === "/" ? "#00D1FF" :
                     item.path === "/map" ? "#00D1FF" :
                     item.path === "/buzz" ? "#7B2EFF" :
                     item.path === "/leaderboard" ? "#F059FF" :
                     "#00D1FF") : undefined
                }}
              >
                {item.label}
              </span>
              {item.badge && (
                <span className="absolute -top-1 right-0 w-2 h-2 bg-[#F059FF] rounded-full"
                  style={{ boxShadow: "0 0 6px rgba(240, 89, 255, 0.7)" }}
                ></span>
              )}
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.nav>
  );
}

export default BottomNavigation;
