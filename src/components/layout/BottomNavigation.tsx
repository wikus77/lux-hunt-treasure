
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Map, Users, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";
import "@/styles/mobile-optimizations.css";

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Map, label: "Mappa", path: "/map" },
    { icon: Users, label: "Buzz", path: "/buzz" },
    { icon: Trophy, label: "Classifica", path: "/leaderboard" },
    { icon: User, label: "Profilo", path: "/profile" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-lg border-t border-white/10 mobile-safe-content">
      <div className="flex items-center justify-around py-2 px-4 max-w-screen-xl mx-auto">
        {navigationItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          
          return (
            <button
              key={path}
              onClick={() => handleNavigation(path)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 mobile-touch-target",
                isActive
                  ? "text-cyan-400 bg-cyan-400/10"
                  : "text-white/60 hover:text-white/80 hover:bg-white/5"
              )}
              aria-label={label}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
