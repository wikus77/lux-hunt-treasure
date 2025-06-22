
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search, User, Bell, Settings } from "lucide-react";

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Search, label: "Cerca", path: "/search" },
    { icon: Bell, label: "Alert", path: "/notifications" },
    { icon: User, label: "Profilo", path: "/profile" },
    { icon: Settings, label: "Impostazioni", path: "/settings" }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-cyan-400/30">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center p-2 min-w-[60px] ${
                isActive ? "text-cyan-400" : "text-white/60"
              }`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              <Icon 
                className={`w-5 h-5 mb-1 ${
                  isActive ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(0,209,255,0.6)]" : ""
                }`} 
              />
              <span 
                className={`text-xs font-orbitron ${
                  isActive ? "text-cyan-400 font-bold" : "text-white/60"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  className="absolute -top-[1px] left-1/2 transform -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                  layoutId="activeTab"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
